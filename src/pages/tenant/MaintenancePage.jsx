import React, { useState, useEffect, useContext } from 'react'
import api from '../../services/api'
import { AuthContext } from '../../AuthContext'
import { PageHeader, FilterTabs, Badge, EmptyState, LoadingSpinner, FormField, Input, Textarea, ModalActions } from '../../components/ui'

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'COMPLETED', label: 'Completed' },
]

// The backend core/maintenance/ endpoint requires a PROPERTY id (the Maintenance
// model has a `property` FK), NOT a lease id. The lease serializer exposes the
// property as a raw FK id in `lease.property`.
const EMPTY = { property: '', issue: '', description: '' }

// Extract the property id from a lease — the lease serializer returns the
// property as a raw FK id (number), but may also be an object in some cases.
const getPropertyId = (lease) => {
  const p = lease?.property
  if (!p) return ''
  if (typeof p === 'object') return p.id || ''
  return p
}

// Extract a display title for the property from a lease
const getPropertyTitle = (lease) => {
  const p = lease?.property
  if (p && typeof p === 'object') return p.title || 'Property'
  return 'Your property'
}

export default function MaintenancePage() {
  const { profile } = useContext(AuthContext)
  const [requests, setRequests] = useState([])
  const [leaseOptions, setLeaseOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    const load = async () => {
      try {
        const [mr, lr] = await Promise.all([api.get('core/maintenance/'), api.get('core/leases/')])
        setRequests(mr.data.maintenance_requests || [])
        // Active leases that have a property id
        const active = (lr.data.leases || []).filter(l => l.status === 'ACTIVE' && getPropertyId(l))
        setLeaseOptions(active)
        if (active.length === 1) setForm(p => ({ ...p, property: getPropertyId(active[0]) }))
      } catch (e) { console.error(e) } finally { setLoading(false) }
    }
    load()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.post('core/maintenance/', {
        property: form.property,
        issue: form.issue,
        description: form.description || '',
      })
      setRequests(prev => [res.data.maintenance || res.data, ...prev])
      setForm(EMPTY); setShowForm(false)
    } catch (err) {
      // Show the backend's actual validation message instead of a generic one
      const d = err.response?.data
      if (d && typeof d === 'object') {
        const firstErr = Object.entries(d).find(([k, v]) => v && (typeof v === 'string' || Array.isArray(v)))
        if (firstErr) {
          const [k, v] = firstErr
          alert(`${k}: ${Array.isArray(v) ? v[0] : v}`)
        } else {
          alert(d.error || d.detail || 'Failed to submit')
        }
      } else {
        alert(d || 'Failed to submit')
      }
    }
    finally { setSubmitting(false) }
  }

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))
  const filtered = requests.filter(r => filter === 'ALL' || (r.status || '').toUpperCase() === filter)

  const STATUS_ICONS = { pending: 'bi-hourglass-split', in_progress: 'bi-arrow-repeat', resolved: 'bi-check-circle-fill', cancelled: 'bi-x-circle-fill' }

  return (
    <div className="p-6 space-y-5 animate-fade-up">
      <PageHeader
        title="Maintenance Requests"
        subtitle={profile?.full_name}
        action={
          <button onClick={() => setShowForm(!showForm)} className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
            {showForm ? <><i className="bi bi-x-lg"></i> Cancel</> : <><i className="bi bi-plus-lg"></i> New Request</>}
          </button>
        }
      />

      {/* Submit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <i className="bi bi-tools text-teal-500"></i> Submit a Maintenance Request
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {leaseOptions.length > 1 ? (
              <FormField label="Property">
                <select value={form.property} onChange={set('property')} required className="input-field w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50">
                  <option value="">Select property...</option>
                  {leaseOptions.map(l => (
                    <option key={l.id} value={getPropertyId(l)}>
                      {getPropertyTitle(l)}
                    </option>
                  ))}
                </select>
              </FormField>
            ) : (
              // Single active lease — show it as a read-only context line
              leaseOptions.length === 1 && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600">
                  <i className="bi bi-building text-teal-500"></i>
                  {getPropertyTitle(leaseOptions[0])}
                </div>
              )
            )}
            <FormField label="Issue"><Input value={form.issue} onChange={set('issue')} required placeholder="e.g. Broken pipe, No electricity..." /></FormField>
            <FormField label="Description (optional)"><Textarea rows={3} value={form.description} onChange={set('description')} placeholder="Describe the issue in more detail..." /></FormField>
            <ModalActions onCancel={() => setShowForm(false)} submitLabel="Submit Request" submitting={submitting} />
          </form>
        </div>
      )}

      <FilterTabs options={FILTERS} active={filter} onChange={setFilter} />

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon="bi-tools" message="No maintenance requests yet." />
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const statusKey = (r.status || 'pending').toLowerCase()
            return (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  statusKey === 'resolved' ? 'bg-green-100' :
                  statusKey === 'in_progress' ? 'bg-blue-100' :
                  statusKey === 'cancelled' ? 'bg-red-100' : 'bg-amber-100'
                }`}>
                  <i className={`bi ${STATUS_ICONS[statusKey] || 'bi-tools'} text-sm ${
                    statusKey === 'resolved' ? 'text-green-600' :
                    statusKey === 'in_progress' ? 'text-blue-600' :
                    statusKey === 'cancelled' ? 'text-red-600' : 'text-amber-600'
                  }`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">{r.issue || '—'}</p>
                  <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
                    <i className="bi bi-building text-xs"></i>{r.property_title || '—'}
                  </p>
                  {r.description && <p className="text-sm text-gray-500 mt-1.5">{r.description}</p>}
                  <p className="text-xs text-gray-300 mt-2">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</p>
                </div>
                <Badge status={r.status || 'pending'} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}