import React, { useState, useEffect, useContext } from 'react'
import api from '../../services/api'
import { AuthContext } from '../../AuthContext'
import { PageHeader, PrimaryBtn, SearchBar, FilterTabs, Badge, EmptyState, LoadingSpinner, Modal, FormField, Input, Select, ModalActions, Table, Tr, Td, ActionBtn, ReceiptModal } from '../../components/ui'

const FILTERS = [{ key: 'ALL', label: 'All' }, { key: 'PENDING', label: 'Pending' }, { key: 'COMPLETED', label: 'Completed' }, { key: 'FAILED', label: 'Failed' }]
const EMPTY = { lease: '', amount: '', method: 'M-Pesa', status: 'PENDING' }

export default function PaymentsPage() {
  const { profile } = useContext(AuthContext)
  const [payments, setPayments] = useState([])
  const [leases, setLeases] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [receiptId, setReceiptId] = useState(null)
  const [verifyTarget, setVerifyTarget] = useState(null) // { id, status }
  const [issuerName, setIssuerName] = useState('')
  const [verifying, setVerifying] = useState(false)

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

  const submitVerify = async () => {
    if (!verifyTarget) return
    setVerifying(true)
    try {
      // Update status + issuer name so the printed receipt shows WHO verified it.
      await api.put(`landlord/payments/${verifyTarget.id}/`, {
        status: verifyTarget.status,
        issued_by: issuerName.trim() || undefined,
      })
      setVerifyTarget(null)
      setIssuerName('')
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to verify payment')
    } finally {
      setVerifying(false)
    }
  }

  const handleVerify = (id, status) => {
    // Prefill the issuer with the LANDLORD's name so the receipt defaults to
    // the landlord as the official issuer (can still be changed if needed).
    const landlordName = (profile?.business_name || profile?.full_name || '').trim()
    setVerifyTarget({ id, status })
    setIssuerName(landlordName)
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
<Table headers={['Tenant / Property', 'Amount', 'Date', 'Method', 'Receipt No.', 'Covers', 'Status', 'Actions']}>
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
              <Td className="text-xs font-mono text-teal-700">{pay.receipt_number || '—'}</Td>
              <Td className="text-xs text-gray-600">{Array.isArray(pay.covered_months) && pay.covered_months.length > 0 ? pay.covered_months.join(', ') : '—'}</Td>
              <Td><Badge status={pay.status} /></Td>
              <Td>
                <div className="flex gap-1.5">
{pay.status === 'COMPLETED' && (
                    <ActionBtn variant="blue" onClick={() => setReceiptId(pay.id)}>
                      <i className="bi bi-receipt mr-1"></i>Receipt
                    </ActionBtn>
                  )}
                  {pay.status === 'PENDING' && (
                    <>
                      <ActionBtn variant="green" onClick={() => handleVerify(pay.id, 'COMPLETED')}>Verify</ActionBtn>
                      <ActionBtn variant="red" onClick={() => handleVerify(pay.id, 'FAILED')}>Fail</ActionBtn>
                    </>
                  )}
                  <ActionBtn variant="default" onClick={() => openForm(pay)}>Edit</ActionBtn>
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

{receiptId && <ReceiptModal paymentId={receiptId} onClose={() => setReceiptId(null)} />}

      {verifyTarget && (
        <Modal title={verifyTarget.status === 'COMPLETED' ? 'Verify Payment' : 'Mark Payment Failed'} onClose={() => setVerifyTarget(null)}>
          <form onSubmit={(e) => { e.preventDefault(); submitVerify() }} className="space-y-4">
            <p className="text-sm text-gray-600">
              {verifyTarget.status === 'COMPLETED'
                ? 'Enter the name of the person who received/verified this payment. This will appear on the official receipt as "Issued By".'
                : 'Optionally enter your name for the record.'}
            </p>
            <FormField label="Issuer Name">
              <Input
                autoFocus
                value={issuerName}
                onChange={(e) => setIssuerName(e.target.value)}
                placeholder="e.g. John Doe, Mary, Property Manager"
              />
            </FormField>
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
              <button type="button" onClick={() => setVerifyTarget(null)} className="w-full sm:flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={verifying} className="w-full sm:flex-1 py-2.5 text-sm btn-primary disabled:opacity-50">
                {verifying ? 'Saving...' : verifyTarget.status === 'COMPLETED' ? 'Verify Payment' : 'Confirm Failed'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
