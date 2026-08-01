import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { PageHeader, PrimaryBtn, Badge, EmptyState, LoadingSpinner, Modal, FormField, Input, Select, Textarea, ModalActions, Table, Tr, Td, ActionBtn } from '../../components/ui'

const EMPTY = { property: '', tenant: '', date_time: '', notes: '', status: 'SCHEDULED' }

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([])
  const [properties, setProperties] = useState([])
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const load = async () => {
    try {
      const [mr, pr, tr] = await Promise.all([api.get('landlord/meetings/'), api.get('landlord/properties/'), api.get('landlord/tenants/')])
      setMeetings(mr.data.meetings || mr.data)
      setProperties(pr.data)
      setTenants(tr.data.tenants || tr.data || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openForm = (m = null) => {
    setEditing(m)
    setForm(m ? { property: m.property?.id || m.property || '', tenant: m.tenant?.id || m.tenant || '', date_time: m.date_time ? new Date(m.date_time).toISOString().slice(0, 16) : '', notes: m.notes || '', status: m.status || 'SCHEDULED' } : EMPTY)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Guard against empty datetime — required field but avoid RangeError on invalid input
      if (!form.date_time) { alert('Please select a date and time.'); return }
      const payload = { ...form, date_time: new Date(form.date_time).toISOString() }
      // Empty tenant (optional) → send null so the FK isn't invalid
      if (!payload.tenant) payload.tenant = null
      editing ? await api.put(`landlord/meetings/${editing.id}/`, payload) : await api.post('landlord/meetings/', payload)
      setShowModal(false); load()
    } catch (err) { alert(err.response?.data?.message || err.response?.data?.error || 'Failed to save') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this meeting?')) return
    try { await api.delete(`landlord/meetings/${id}/`); load() }
    catch { alert('Failed to cancel') }
  }

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const upcoming = meetings.filter(m => m.status === 'SCHEDULED').length

  return (
    <div className="p-6 animate-fade-up">
      <PageHeader
        title="Meetings & Viewings"
        subtitle={upcoming > 0 ? `${upcoming} upcoming` : `${meetings.length} total`}
        action={<PrimaryBtn onClick={() => openForm()}><i className="bi bi-plus-lg"></i> Schedule Meeting</PrimaryBtn>}
      />

      {loading ? <LoadingSpinner /> : meetings.length === 0 ? (
        <EmptyState icon="bi-calendar2-check" message="No meetings scheduled yet." />
      ) : (
        <Table headers={['Property', 'Tenant', 'Date & Time', 'Status', 'Actions']}>
          {meetings.map(m => (
            <Tr key={m.id}>
              <Td className="font-semibold text-gray-900">{m.property?.title || m.property_title || '—'}</Td>
              <Td className="text-gray-500">{m.tenant?.full_name || m.tenant_name || '—'}</Td>
              <Td className="whitespace-nowrap text-gray-600">
                <div className="flex items-center gap-1.5">
                  <i className="bi bi-calendar2 text-teal-500 text-xs"></i>
                  {m.date_time_formatted || new Date(m.date_time).toLocaleString()}
                </div>
              </Td>
              <Td><Badge status={m.status} /></Td>
              <Td>
                <div className="flex gap-1.5">
                  <ActionBtn variant="blue" onClick={() => openForm(m)}>Edit</ActionBtn>
                  <ActionBtn variant="red" onClick={() => handleDelete(m.id)}>Cancel</ActionBtn>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Meeting' : 'Schedule Meeting'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Property">
              <Select value={form.property} onChange={set('property')} required>
                <option value="">Select property...</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.title} — {p.location}</option>)}
              </Select>
            </FormField>
            <FormField label="Tenant (optional)">
              <Select value={form.tenant} onChange={set('tenant')}>
                <option value="">Select tenant...</option>
                {tenants.map(t => <option key={t.id} value={t.id}>{t.full_name} — {t.phone || t.email_address}</option>)}
              </Select>
            </FormField>
            <FormField label="Date & Time"><Input type="datetime-local" value={form.date_time} onChange={set('date_time')} required /></FormField>
            <FormField label="Status">
              <Select value={form.status} onChange={set('status')}>
                <option value="SCHEDULED">Scheduled</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option>
              </Select>
            </FormField>
            <FormField label="Notes (optional)"><Textarea rows={2} value={form.notes} onChange={set('notes')} placeholder="Location, instructions..." /></FormField>
            <ModalActions onCancel={() => setShowModal(false)} submitLabel={editing ? 'Update Meeting' : 'Schedule Meeting'} />
          </form>
        </Modal>
      )}
    </div>
  )
}
