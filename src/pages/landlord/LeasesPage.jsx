import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { PageHeader, PrimaryBtn, Badge, EmptyState, LoadingSpinner, Modal, FormField, Input, Select, Textarea, ModalActions, Table, Tr, Td, ActionBtn } from '../../components/ui'

const EMPTY = { property: '', tenant: '', start_date: '', end_date: '', monthly_rent: '', status: 'ACTIVE', terms: '' }

export default function LeasesPage() {
  const [leases, setLeases] = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [displayTenant, setDisplayTenant] = useState('')

  const load = async () => {
    try {
      const [lr, pr] = await Promise.all([api.get('landlord/leases/'), api.get('landlord/properties/')])
      setLeases(lr.data.leases || lr.data)
      setProperties(pr.data)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openForm = (l = null) => {
    setEditing(l)
    setForm(l ? { property: l.property?.id || l.property || '', tenant: l.tenant?.id || l.tenant || '', start_date: l.start_date || '', end_date: l.end_date || '', monthly_rent: l.monthly_rent || '', status: l.status || 'ACTIVE', terms: l.terms || '' } : EMPTY)
    setDisplayTenant(l ? (l.tenant?.full_name || l.tenant_name || '') : '')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      editing ? await api.put(`landlord/leases/${editing.id}/`, form) : await api.post('landlord/leases/', form)
      setShowModal(false); load()
    } catch (err) { alert(err.response?.data?.message || err.response?.data?.error || 'Failed to save') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lease?')) return
    try { await api.delete(`landlord/leases/${id}/`); load() }
    catch { alert('Failed to delete') }
  }

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  return (
    <div className="p-6 animate-fade-up">
      <PageHeader
        title="Leases"
        subtitle={`${leases.filter(l => l.status === 'ACTIVE').length} active`}
        action={<PrimaryBtn onClick={() => openForm()}><i className="bi bi-plus-lg"></i> Create Lease</PrimaryBtn>}
      />

      {loading ? <LoadingSpinner /> : leases.length === 0 ? (
        <EmptyState icon="bi-file-earmark-text" message="No leases yet. Create your first lease." />
      ) : (
        <Table headers={['Property', 'Tenant', 'Monthly Rent', 'Period', 'Status', 'Actions']}>
          {leases.map(l => (
            <Tr key={l.id}>
              <Td className="font-semibold text-gray-900">{l.property?.title || l.property}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold shrink-0">
                    {(l.tenant?.full_name || l.tenant_name || '?')[0].toUpperCase()}
                  </div>
                  <span>{l.tenant?.full_name || l.tenant_name || l.tenant}</span>
                </div>
              </Td>
              <Td className="font-bold text-gray-900">KSh {Number(l.monthly_rent).toLocaleString()}</Td>
              <Td className="text-gray-400 text-xs whitespace-nowrap">{l.start_date} → {l.end_date}</Td>
              <Td><Badge status={l.status} /></Td>
              <Td>
                <div className="flex gap-1.5">
                  <ActionBtn variant="blue" onClick={() => openForm(l)}>Edit</ActionBtn>
                  <ActionBtn variant="red" onClick={() => handleDelete(l.id)}>Delete</ActionBtn>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Lease' : 'New Lease'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Property">
              <Select value={form.property} onChange={set('property')} required>
                <option value="">Select property...</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.title} — {p.location}</option>)}
              </Select>
            </FormField>
            <FormField label="Tenant (name or ID)">
              <Input value={displayTenant} onChange={e => { setDisplayTenant(e.target.value); setForm(p => ({ ...p, tenant: e.target.value })) }} required placeholder="Enter tenant name or ID" />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Start Date"><Input type="date" value={form.start_date} onChange={set('start_date')} required /></FormField>
              <FormField label="End Date"><Input type="date" value={form.end_date} onChange={set('end_date')} required /></FormField>
            </div>
            <FormField label="Monthly Rent (KSh)"><Input type="number" value={form.monthly_rent} onChange={set('monthly_rent')} required /></FormField>
            <FormField label="Status">
              <Select value={form.status} onChange={set('status')}>
                <option value="PENDING">Pending</option><option value="ACTIVE">Active</option><option value="EXPIRED">Expired</option><option value="TERMINATED">Terminated</option>
              </Select>
            </FormField>
            <FormField label="Terms (optional)"><Textarea rows={2} value={form.terms} onChange={set('terms')} /></FormField>
            <ModalActions onCancel={() => setShowModal(false)} submitLabel={editing ? 'Update Lease' : 'Create Lease'} />
          </form>
        </Modal>
      )}
    </div>
  )
}
