import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { PageHeader, PrimaryBtn, Badge, EmptyState, LoadingSpinner, Modal, FormField, Input, Select, ModalActions, Table, Tr, Td, ActionBtn } from '../../components/ui'

const EMPTY = { property: '', tenant: '', start_date: '', end_date: '', monthly_rent: '', status: 'ACTIVE' }

export default function LeasesPage() {
  const [leases, setLeases] = useState([])
  const [properties, setProperties] = useState([])
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [notice, setNotice] = useState('')

  const load = async () => {
    try {
      const [lr, pr, tr] = await Promise.all([
        api.get('landlord/leases/'),
        api.get('landlord/properties/'),
        api.get('landlord/registered-tenants/')
      ])
      setLeases(lr.data.leases || lr.data)
      setProperties(pr.data)
      setTenants(tr.data.tenants || tr.data || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openForm = (l = null) => {
    setEditing(l)
    setForm(l ? { property: l.property?.id || l.property || '', tenant: l.tenant?.id || l.tenant || '', start_date: l.start_date || '', end_date: l.end_date || '', monthly_rent: l.monthly_rent || '', status: l.status || 'ACTIVE' } : EMPTY)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Client-side date validation (mirrors backend LeaseSerializer rules).
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = new Date(form.start_date + 'T00:00:00')
    const end = new Date(form.end_date + 'T00:00:00')

    if (!form.start_date || !form.end_date) {
      alert('Please select both a start date and an end date.')
      return
    }
    if (!editing && start < today) {
      alert('Start date cannot be in the past.')
      return
    }
    if (end <= start) {
      alert('End date must be later than the start date.')
      return
    }

    setSaving(true)
    setNotice('')
    // Only send fields the backend Lease model accepts
    const payload = {
      property: form.property,
      tenant: form.tenant,
      start_date: form.start_date,
      end_date: form.end_date,
      monthly_rent: form.monthly_rent,
      status: form.status,
    }
    try {
      if (editing) {
        await api.put(`landlord/leases/${editing.id}/`, payload)
        setNotice('Lease updated successfully.')
      } else {
        await api.post('landlord/leases/', payload)
        setNotice('Lease created successfully.')
      }
      setShowModal(false)
      load()
    } catch (err) {
      const d = err.response?.data
      alert(d?.message || d?.error || (typeof d === 'string' ? d : JSON.stringify(d)) || 'Failed to save lease')
    } finally {
      setSaving(false)
    }
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

      {notice && (
        <div className="mb-5 flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl animate-fade-in">
          <i className="bi bi-check-circle-fill text-green-500"></i>
          <p className="text-sm text-green-700 font-medium">{notice}</p>
          <button onClick={() => setNotice('')} className="ml-auto text-green-500 hover:text-green-700">
            <i className="bi bi-x-lg text-sm"></i>
          </button>
        </div>
      )}

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
    <form onSubmit={handleSubmit} className="space-y-2">
      
      {/* Property */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Property</label>
        <Select value={form.property} onChange={set('property')} required>
          <option value="">Select property...</option>
          {properties.map(p => (
            <option key={p.id} value={p.id}>
              {p.title} — {p.location}
            </option>
          ))}
        </Select>
      </div>

      {/* Tenant */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mt-8 mb-1.5">Tenant</label>
        <Select value={form.tenant} onChange={set('tenant')} required>
          <option value="">Select tenant...</option>
          {tenants.map(t => (
            <option key={t.id} value={t.id}>
              {t.full_name}{t.phone ? ` — ${t.phone}` : ''}
            </option>
          ))}
        </Select>
        {tenants.length === 0 && (
          <p className="text-xs text-amber-600 mt-1.5">
            No tenants registered yet. Please register a tenant first.
          </p>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
          <Input
            type="date"
            value={form.start_date}
            onChange={set('start_date')}
            min={!editing ? new Date().toISOString().split('T')[0] : undefined}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
          <Input
            type="date"
            value={form.end_date}
            onChange={set('end_date')}
            min={form.start_date || undefined}
            required
          />
        </div>
      </div>

      {/* Monthly Rent */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Rent (KSh)</label>
        <Input
          type="number"
          value={form.monthly_rent}
          onChange={set('monthly_rent')}
          required
          placeholder="0"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
        <Select value={form.status} onChange={set('status')}>
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRED">Expired</option>
          <option value="TERMINATED">Terminated</option>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-3">
        <button
          type="button"
          onClick={() => setShowModal(false)}
          className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : editing ? 'Update Lease' : 'Create Lease'}
        </button>
      </div>
    </form>
  </Modal>
)}

      {/* {showModal && (
        <Modal title={editing ? 'Edit Lease' : 'New Lease'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Property">
              <Select value={form.property} onChange={set('property')} required>
                <option value="">Select property...</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.title} — {p.location}</option>)}
              </Select>
            </FormField>
            <FormField label="Tenant">
              <Select value={form.tenant} onChange={set('tenant')} required>
                <option value="">Select tenant...</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.full_name}{t.phone ? ` — ${t.phone}` : ''}{t.email_address ? ` (${t.email_address})` : ''}
                  </option>
                ))}
              </Select>
              {tenants.length === 0 && (
                <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                  <i className="bi bi-exclamation-circle-fill"></i>
                  No tenants registered yet — add one under <span className="font-semibold">Tenants → Register Tenant</span> first.
                </p>
              )}
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Start Date">
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={set('start_date')}
                  min={!editing ? new Date().toISOString().split('T')[0] : undefined}
                  required
                />
              </FormField>
              <FormField label="End Date">
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={set('end_date')}
                  min={form.start_date || undefined}
                  required
                />
              </FormField>
            </div>
            <FormField label="Monthly Rent (KSh)"><Input type="number" value={form.monthly_rent} onChange={set('monthly_rent')} required /></FormField>
            <FormField label="Status">
              <Select value={form.status} onChange={set('status')}>
                <option value="PENDING">Pending</option><option value="ACTIVE">Active</option><option value="EXPIRED">Expired</option><option value="TERMINATED">Terminated</option>
              </Select>
            </FormField>
            <ModalActions onCancel={() => setShowModal(false)} submitLabel={editing ? 'Update Lease' : 'Create Lease'} submitting={saving} />
          </form>
        </Modal>
      )} */}
    </div>
  )
}
