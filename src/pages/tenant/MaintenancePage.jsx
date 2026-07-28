import React, { useState, useEffect, useContext } from 'react'
import api from '../../services/api'
import { AuthContext } from '../../AuthContext'
import { PageHeader, FilterTabs, Badge, EmptyState, LoadingSpinner, FormField, Input, Textarea, ModalActions } from '../../components/ui'

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'CANCELLED', label: 'Cancelled' },
]
const EMPTY = { property: '', issue: '', description: '' }

export default function MaintenancePage() {
  const { profile } = useContext(AuthContext)
  const [requests, setRequests] = useState([])
  const [properties, setProperties] = useState([])
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
        const props = (lr.data.leases || []).filter(l => l.status === 'ACTIVE' && l.property).map(l => l.property)
        setProperties(props)
        if (props.length === 1) setForm(p => ({ ...p, property: props[0].id }))
      } catch (e) { console.error(e) } finally { setLoading(false) }
    }
    load()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.post('core/maintenance/', form)
      setRequests(prev => [res.data.maintenance, ...prev])
      setForm(EMPTY); setShowForm(false)
    } catch (err) { alert(err.response?.data?.error || 'Failed to submit') }
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
            {properties.length > 1 && (
              <FormField label="Property">
                <select value={form.property} onChange={set('property')} required className="input-field w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50">
                  <option value="">Select property...</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </FormField>
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
