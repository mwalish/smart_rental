import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { PageHeader, PrimaryBtn, Badge, EmptyState, LoadingSpinner, Modal, FormField, Input, Select, Textarea, ModalActions, Table, Tr, Td, ActionBtn } from '../../components/ui'

const EMPTY = { title: '', property: '', date_time: '', notes: '', status: 'SCHEDULED' }

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const load = async () => {
    try {
      const [mr, pr] = await Promise.all([api.get('landlord/meetings/'), api.get('landlord/properties/')])
      setMeetings(mr.data.meetings || mr.data)
      setProperties(pr.data)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openForm = (m = null) => {
    setEditing(m)
    setForm(m ? { title: m.title || '', property: m.property?.id || m.property || '', date_time: m.date_time ? new Date(m.date_time).toISOString().slice(0, 16) : '', notes: m.notes || '', status: m.status || 'SCHEDULED' } : EMPTY)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form, date_time: new Date(form.date_time).toISOString() }
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
        <Table headers={['Title', 'Property', 'Date & Time', 'Status', 'Actions']}>
          {meetings.map(m => (
            <Tr key={m.id}>
              <Td className="font-semibold text-gray-900">{m.title || 'Property Viewing'}</Td>
              <Td className="text-gray-500">{m.property?.title || m.property_title || '—'}</Td>
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
            <FormField label="Title / Purpose"><Input value={form.title} onChange={set('title')} required placeholder="e.g. Property Viewing" /></FormField>
            <FormField label="Property">
              <Select value={form.property} onChange={set('property')} required>
                <option value="">Select property...</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.title} — {p.location}</option>)}
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
