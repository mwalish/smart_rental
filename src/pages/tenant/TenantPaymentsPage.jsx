import React, { useState, useEffect, useContext } from 'react'
import api from '../../services/api'
import { AuthContext } from '../../AuthContext'
import { PageHeader, FilterTabs, Badge, EmptyState, LoadingSpinner, Table, Tr, Td, FormField, Input, Select, ModalActions } from '../../components/ui'

const FILTERS = [{ key: 'ALL', label: 'All' }, { key: 'PENDING', label: 'Pending' }, { key: 'COMPLETED', label: 'Completed' }, { key: 'FAILED', label: 'Failed' }]
const EMPTY = { lease: '', amount: '', method: 'M-Pesa' }

export default function TenantPaymentsPage() {
  const { profile } = useContext(AuthContext)
  const [payments, setPayments] = useState([])
  const [summary, setSummary] = useState(null)
  const [leases, setLeases] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState('ALL')

  const load = async () => {
    try {
      const [pr, lr] = await Promise.all([api.get('core/payments/'), api.get('core/leases/')])
      setPayments(pr.data.payments || [])
      setSummary(pr.data.summary || null)
      const active = (lr.data.leases || []).filter(l => l.status === 'ACTIVE')
      setLeases(active)
      if (active.length === 1) setForm(p => ({ ...p, lease: active[0].id }))
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.post('core/payments/', { lease: form.lease, amount: form.amount, method: form.method })
      alert(res.data.message || 'Payment submitted!')
      setShowForm(false); setForm(EMPTY); load()
    } catch (err) { alert(err.response?.data?.error || 'Failed to submit') }
    finally { setSubmitting(false) }
  }

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))
  const filtered = payments.filter(p => filter === 'ALL' || p.status === filter)

  const SUMMARY_CARDS = summary ? [
    { label: 'Monthly Rent', val: `KSh ${Number(summary.monthly_rent).toLocaleString()}`, icon: 'bi-house-fill', color: 'from-slate-600 to-slate-500' },
    { label: 'Total Paid', val: `KSh ${Number(summary.total_paid).toLocaleString()}`, icon: 'bi-check-circle-fill', color: 'from-green-500 to-emerald-400' },
    { label: 'Pending', val: `KSh ${Number(summary.total_pending).toLocaleString()}`, icon: 'bi-hourglass-split', color: 'from-amber-500 to-yellow-400' },
    { label: 'Balance Due', val: `KSh ${Number(summary.balance_due).toLocaleString()}`, icon: 'bi-exclamation-circle-fill', color: 'from-red-500 to-rose-400' },
  ] : []

  return (
    <div className="p-6 space-y-5 animate-fade-up">
      <PageHeader
        title="My Payments"
        subtitle={profile?.full_name}
        action={
          <button onClick={() => setShowForm(!showForm)} className={`btn-primary px-5 py-2.5 text-sm flex items-center gap-2 ${showForm ? 'opacity-70' : ''}`}>
            {showForm ? <><i className="bi bi-x-lg"></i> Cancel</> : <><i className="bi bi-plus-lg"></i> Pay Rent</>}
          </button>
        }
      />

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SUMMARY_CARDS.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 stat-card">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-md`}>
                <i className={`bi ${s.icon} text-white text-sm`}></i>
              </div>
              <p className="text-lg font-black text-gray-900">{s.val}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {summary?.balance_due > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <i className="bi bi-exclamation-triangle-fill text-amber-500 mt-0.5 shrink-0"></i>
          <p className="text-sm text-amber-800">{summary.clear_message}</p>
        </div>
      )}

      {/* Pay Rent Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <i className="bi bi-cash-stack text-teal-500"></i> Submit Rent Payment
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {leases.length > 1 && (
              <FormField label="Lease">
                <select value={form.lease} onChange={set('lease')} required className="input-field w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50">
                  <option value="">Select lease...</option>
                  {leases.map(l => <option key={l.id} value={l.id}>{l.property?.title || l.property} — KSh {Number(l.monthly_rent).toLocaleString()}/mo</option>)}
                </select>
              </FormField>
            )}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Amount (KSh)"><Input type="number" value={form.amount} onChange={set('amount')} required placeholder="0" /></FormField>
            </div>
            <FormField label="Payment Method">
              <select value={form.method} onChange={set('method')} className="input-field w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50">
                <option>M-Pesa</option><option>Bank Transfer</option><option>Cash</option><option>Cheque</option>
              </select>
            </FormField>
            <ModalActions onCancel={() => setShowForm(false)} submitLabel="Submit Payment" submitting={submitting} />
          </form>
        </div>
      )}

      {/* Filter + Table */}
      <div className="flex flex-wrap gap-2 mb-1">
        <FilterTabs options={FILTERS} active={filter} onChange={setFilter} />
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon="bi-credit-card" message="No payments found." />
      ) : (
        <Table headers={['Property', 'Amount', 'Date', 'Method', 'Status', 'Covers']}>
          {filtered.map(p => (
            <Tr key={p.id}>
              <Td className="font-semibold text-gray-900">{p.property_title || '—'}</Td>
              <Td className="font-bold text-gray-900">KSh {Number(p.amount).toLocaleString()}</Td>
              <Td className="text-gray-400 whitespace-nowrap">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</Td>
              <Td>
                <span className="flex items-center gap-1.5 text-gray-600">
                  {p.method === 'M-Pesa' && <i className="bi bi-phone text-green-600 text-xs"></i>}
                  {p.method || '—'}
                </span>
              </Td>
              <Td><Badge status={p.status} /></Td>
              <Td className="text-xs text-gray-400">{Array.isArray(p.covered_months) && p.covered_months.length > 0 ? p.covered_months.join(', ') : '—'}</Td>
            </Tr>
          ))}
        </Table>
      )}
    </div>
  )
}
