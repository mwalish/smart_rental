import React, { useState, useEffect, useContext } from 'react'
import api from '../../services/api'
import { AuthContext } from '../../AuthContext'
import { PageHeader, FilterTabs, Badge, EmptyState, LoadingSpinner, Table, Tr, Td, ActionBtn, FormField, Textarea, ModalActions } from '../../components/ui'

const FILTERS = [{ key: 'ALL', label: 'All' }, { key: 'PENDING', label: 'Pending' }, { key: 'APPROVED', label: 'Approved' }, { key: 'REJECTED', label: 'Rejected' }]

export default function TenantRentalRequestsPage() {
  const { profile } = useContext(AuthContext)
  const [requests, setRequests] = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ property: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState('ALL')

  const load = async () => {
    try {
      const [rr, pr] = await Promise.all([api.get('core/rental-requests/'), api.get('core/properties/available/')])
      setRequests(rr.data.rental_requests || [])
      setProperties(pr.data || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.post('core/rental-requests/', form)
      setRequests(prev => [res.data.request, ...prev])
      setForm({ property: '', message: '' }); setShowForm(false)
    } catch (err) { alert(err.response?.data?.error || JSON.stringify(err.response?.data) || 'Failed to submit') }
    finally { setSubmitting(false) }
  }

  const handleWithdraw = async (id) => {
    if (!window.confirm('Withdraw this request?')) return
    try { await api.delete(`core/rental-requests/${id}/`); setRequests(prev => prev.filter(r => r.id !== id)) }
    catch (err) { alert(err.response?.data?.error || 'Cannot withdraw') }
  }

  const filtered = requests.filter(r => filter === 'ALL' || r.status === filter)

  return (
    <div className="p-6 space-y-5 animate-fade-up">
      <PageHeader
        title="Rental Requests"
        subtitle={profile?.full_name}
        action={
          <button onClick={() => setShowForm(!showForm)} className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
            {showForm ? <><i className="bi bi-x-lg"></i> Cancel</> : <><i className="bi bi-plus-lg"></i> Apply for Property</>}
          </button>
        }
      />

      {/* Apply Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <i className="bi bi-envelope-fill text-teal-500"></i> Apply for a Property
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Available Property">
              <select value={form.property} onChange={e => setForm(p => ({ ...p, property: e.target.value }))} required className="input-field w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50">
                <option value="">Select available property...</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.title} — {p.location} (KSh {Number(p.rent_per_month).toLocaleString()}/mo)</option>
                ))}
              </select>
              {properties.length === 0 && <p className="text-xs text-gray-400 mt-1">No available properties at the moment.</p>}
            </FormField>
            <FormField label="Message (optional)">
              <Textarea rows={3} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Introduce yourself or add any notes..." />
            </FormField>
            <ModalActions onCancel={() => setShowForm(false)} submitLabel="Submit Application" submitting={submitting} />
          </form>
        </div>
      )}

      <FilterTabs options={FILTERS} active={filter} onChange={setFilter} />

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon="bi-envelope" message="No rental requests yet. Apply for a property above." />
      ) : (
        <Table headers={['Property', 'Location', 'Message', 'Status', 'Date', 'Actions']}>
          {filtered.map(r => (
            <Tr key={r.id}>
              <Td className="font-semibold text-gray-900">{r.property_title || '—'}</Td>
              <Td className="text-gray-400">{r.property_location || '—'}</Td>
              <Td className="max-w-[160px] truncate text-gray-400">{r.message || '—'}</Td>
              <Td><Badge status={r.status} /></Td>
              <Td className="text-gray-400 whitespace-nowrap">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</Td>
              <Td>
                {r.status === 'PENDING' && (
                  <ActionBtn variant="red" onClick={() => handleWithdraw(r.id)}>Withdraw</ActionBtn>
                )}
              </Td>
            </Tr>
          ))}
        </Table>
      )}
    </div>
  )
}
