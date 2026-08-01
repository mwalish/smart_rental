import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { PageHeader, PrimaryBtn, SearchBar, FilterTabs, Badge, EmptyState, LoadingSpinner, Modal, FormField, Input, Select, ModalActions, Table, Tr, Td, ActionBtn } from '../../components/ui'

const FILTERS = [{ key: 'ALL', label: 'All' }, { key: 'PENDING', label: 'Pending' }, { key: 'COMPLETED', label: 'Completed' }, { key: 'FAILED', label: 'Failed' }]
const EMPTY = { lease: '', amount: '', method: 'M-Pesa', status: 'PENDING' }

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [leases, setLeases] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      const [pr, lr] = await Promise.all([api.get('landlord/payments/'), api.get('landlord/leases/')])
      setPayments(pr.data.payments || pr.data)
      setLeases(lr.data.leases || lr.data)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openForm = (pay = null) => {
    setEditing(pay)
    setForm(pay ? {
      lease: pay.lease?.id || pay.lease || '',
      amount: pay.amount || '',
      method: pay.method || 'M-Pesa',
      status: pay.status || 'PENDING'
    } : EMPTY)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      editing ? await api.put(`landlord/payments/${editing.id}/`, form) : await api.post('landlord/payments/', form)
      setShowModal(false); load()
    } catch (err) { alert(err.response?.data?.error || 'Failed to save') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment?')) return
    try { await api.delete(`landlord/payments/${id}/`); load() }
    catch { alert('Failed to delete') }
  }

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const filtered = payments.filter(pay => {
    const q = search.toLowerCase()
    return (filter === 'ALL' || pay.status === filter) &&
      (!q || (pay.tenant_name || '').toLowerCase().includes(q) || (pay.property_title || '').toLowerCase().includes(q) || String(pay.amount).includes(q))
  })

  const totalCompleted = payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + Number(p.amount), 0)

  return (
    <div className="p-6 animate-fade-up">
      <PageHeader
        title="Payments"
        subtitle={`KSh ${totalCompleted.toLocaleString()} collected`}
        action={<PrimaryBtn onClick={() => openForm()}><i className="bi bi-plus-lg"></i> New Payment</PrimaryBtn>}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="sm:w-72">
          <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tenant, property, amount..." />
        </div>
        <FilterTabs options={FILTERS} active={filter} onChange={setFilter} />
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon="bi-cash-stack" message="No payments found." />
      ) : (
        <Table headers={['Tenant / Property', 'Amount', 'Date', 'Method', 'Status', 'Actions']}>
          {filtered.map(pay => (
            <Tr key={pay.id}>
              <Td>
                <p className="font-semibold text-gray-900">{pay.tenant_name || '—'}</p>
                <p className="text-xs text-gray-400">{pay.property_title || '—'}</p>
              </Td>
              <Td className="font-bold text-gray-900">KSh {Number(pay.amount).toLocaleString()}</Td>
              <Td className="text-gray-400 whitespace-nowrap">{pay.created_at ? new Date(pay.created_at).toLocaleDateString() : '—'}</Td>
              <Td>
                <span className="flex items-center gap-1.5 text-gray-600">
                  {pay.method === 'M-Pesa' && <i className="bi bi-phone text-green-600"></i>}
                  {pay.method || '—'}
                </span>
              </Td>
              <Td><Badge status={pay.status} /></Td>
              <Td>
                <div className="flex gap-1.5">
                  <ActionBtn variant="blue" onClick={() => openForm(pay)}>Edit</ActionBtn>
                  <ActionBtn variant="red" onClick={() => handleDelete(pay.id)}>Delete</ActionBtn>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Payment' : 'New Payment'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Lease">
              <Select value={form.lease} onChange={set('lease')} required>
                <option value="">Select lease...</option>
                {leases.map(l => <option key={l.id} value={l.id}>{l.tenant?.full_name || l.tenant_name} — {l.property?.title || l.property}</option>)}
              </Select>
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Amount (KSh)"><Input type="number" value={form.amount} onChange={set('amount')} required placeholder="0" /></FormField>
              <FormField label="Method">
                <Select value={form.method} onChange={set('method')}>
                  <option>M-Pesa</option><option>Bank Transfer</option><option>Cash</option><option>Cheque</option>
                </Select>
              </FormField>
            </div>
            <FormField label="Status">
              <Select value={form.status} onChange={set('status')}>
                <option value="PENDING">Pending</option><option value="COMPLETED">Completed</option><option value="FAILED">Failed</option>
              </Select>
            </FormField>
            <ModalActions onCancel={() => setShowModal(false)} submitLabel={editing ? 'Update' : 'Save Payment'} />
          </form>
        </Modal>
      )}
    </div>
  )
}
