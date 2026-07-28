import React, { useState, useEffect, useContext } from 'react'
import api from '../../services/api'
import { AuthContext } from '../../AuthContext'

const STATUS_COLORS = {
  COMPLETED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  FAILED: 'bg-red-100 text-red-700',
}

const EMPTY_FORM = { lease: '', amount: '', payment_date: '', method: 'M-Pesa' }

export default function TenantPaymentsPage() {
  const { profile } = useContext(AuthContext)
  const [payments, setPayments] = useState([])
  const [summary, setSummary] = useState(null)
  const [leases, setLeases] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [activeFilter, setActiveFilter] = useState('ALL')

  const loadData = async () => {
    try {
      const [payRes, leaseRes] = await Promise.all([
        api.get('core/payments/'),
        api.get('core/leases/')
      ])
      setPayments(payRes.data.payments || [])
      setSummary(payRes.data.summary || null)
      const activeLeases = (leaseRes.data.leases || []).filter(l => l.status === 'ACTIVE')
      setLeases(activeLeases)
      if (activeLeases.length === 1) setForm(p => ({ ...p, lease: activeLeases[0].id }))
    } catch (err) {
      console.error('Failed to load payments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.post('core/payments/', {
        ...form,
        payment_date: new Date(form.payment_date).toISOString()
      })
      alert(res.data.message || 'Payment submitted!')
      setShowForm(false)
      setForm(EMPTY_FORM)
      loadData()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit payment')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = payments.filter(p =>
    activeFilter === 'ALL' || p.status === activeFilter
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Payments</h2>
          {profile?.full_name && <p className="text-sm text-gray-500 mt-0.5">{profile.full_name}</p>}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700"
        >
          {showForm ? 'Cancel' : '+ Pay Rent'}
        </button>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Monthly Rent', value: `KSh ${Number(summary.monthly_rent).toLocaleString()}`, color: 'text-gray-800' },
            { label: 'Total Paid', value: `KSh ${Number(summary.total_paid).toLocaleString()}`, color: 'text-green-600' },
            { label: 'Pending', value: `KSh ${Number(summary.total_pending).toLocaleString()}`, color: 'text-yellow-600' },
            { label: 'Balance Due', value: `KSh ${Number(summary.balance_due).toLocaleString()}`, color: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className={`text-lg font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {summary?.balance_due > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
          {summary.clear_message}
        </div>
      )}

      {/* Pay Rent Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">Submit Rent Payment</h3>

          {leases.length > 1 && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Lease</label>
              <select
                value={form.lease}
                onChange={e => setForm(p => ({ ...p, lease: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select lease...</option>
                {leases.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.property?.title || l.property} — KSh {Number(l.monthly_rent).toLocaleString()}/mo
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Amount (KSh)</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                required
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Payment Date</label>
              <input
                type="date"
                value={form.payment_date}
                onChange={e => setForm(p => ({ ...p, payment_date: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Payment Method</label>
            <select
              value={form.method}
              onChange={e => setForm(p => ({ ...p, method: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="M-Pesa">M-Pesa</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Payment'}
          </button>
        </form>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'PENDING', 'COMPLETED', 'FAILED'].map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium ${activeFilter === f ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Payment History */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="bi bi-credit-card text-4xl block mb-3"></i>
          <p>No payments found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Property</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Amount</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Date</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Method</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Covers</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="p-4 font-medium">{p.property_title || p.lease?.property?.title || '—'}</td>
                  <td className="p-4">KSh {Number(p.amount).toLocaleString()}</td>
                  <td className="p-4 text-sm">{p.payment_date ? new Date(p.payment_date).toLocaleDateString() : '—'}</td>
                  <td className="p-4 text-sm">{p.method || '—'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-600'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-gray-500">
                    {Array.isArray(p.covered_months) && p.covered_months.length > 0
                      ? p.covered_months.join(', ')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
