import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { PageHeader, SearchBar, Badge, EmptyState, LoadingSpinner, Table, Tr, Td, FilterTabs, ActionBtn, ReceiptModal, Modal, FormField, Input } from '../../components/ui'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'FAILED', label: 'Failed' },
]

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
const [receiptId, setReceiptId] = useState(null)
  const [verifyTarget, setVerifyTarget] = useState(null) // { id, status } awaiting issuer name
  const [issuerName, setIssuerName] = useState('')
  const [verifying, setVerifying] = useState(false)

  const load = () => {
    api.get('core/payments/')
      .then(r => { setPayments(r.data.payments || []); setSummary(r.data.summary) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const submitVerify = async () => {
    if (!verifyTarget) return
    setVerifying(true)
    try {
      await api.put(`core/payments/${verifyTarget.id}/verify/`, {
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
    // Ask for an issuer name so the printed receipt shows who verified it.
    setVerifyTarget({ id, status })
    setIssuerName('')
  }

  const filtered = payments.filter(p => {
    const matchTab = tab === 'all' || p.status === tab
    const q = search.toLowerCase()
    const matchSearch = !q || String(p.id).includes(q) || p.method?.toLowerCase().includes(q)
    return matchTab && matchSearch
  })

  return (
    <div className="p-6 animate-fade-up">
      <PageHeader title="All Payments" subtitle={`${payments.length} total`} />

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Total Collected', value: `KSh ${Number(summary.total_paid).toLocaleString()}`, color: 'text-green-600' },
            { label: 'Pending', value: `KSh ${Number(summary.total_pending).toLocaleString()}`, color: 'text-amber-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1"><SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID or method..." /></div>
        <FilterTabs options={TABS} active={tab} onChange={setTab} />
      </div>

      {loading ? <LoadingSpinner /> : (
<Table
          headers={['ID', 'Amount', 'Method', 'Receipt No.', 'Covers', 'Status', 'Date', 'Actions']}
          empty={filtered.length === 0 && <EmptyState icon="bi-cash-stack" message="No payments found." />}
        >
          {filtered.map(p => (
            <Tr key={p.id}>
              <Td>#{p.id}</Td>
              <Td>KSh {Number(p.amount).toLocaleString()}</Td>
              <Td>{p.method}</Td>
              <Td className="text-xs font-mono text-teal-700">{p.receipt_number || '—'}</Td>
              <Td className="text-xs text-gray-600">{Array.isArray(p.covered_months) && p.covered_months.length > 0 ? p.covered_months.join(', ') : '—'}</Td>
              <Td><Badge status={p.status} /></Td>
              <Td>{p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB') : '—'}</Td>
              <Td>
                <div className="flex gap-1">
                  {p.status === 'COMPLETED' && (
                    <ActionBtn variant="blue" onClick={() => setReceiptId(p.id)}>
                      <i className="bi bi-receipt mr-1"></i>Receipt
                    </ActionBtn>
                  )}
                  {p.status === 'PENDING' && (
                    <>
                      <ActionBtn variant="green" onClick={() => handleVerify(p.id, 'COMPLETED')}>Verify</ActionBtn>
                      <ActionBtn variant="red" onClick={() => handleVerify(p.id, 'FAILED')}>Fail</ActionBtn>
                    </>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
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
                placeholder="e.g. Admin, John Doe, Mary"
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
