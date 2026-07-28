import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function PaymentsPage() {
  const navigate = useNavigate()
  const [payments, setPayments] = useState([])
  const [leases, setLeases] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    lease: '',
    amount: '',
    payment_date: '',
    method: 'M-Pesa',
    status: 'PENDING'
  })

  const [activeFilter, setActiveFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const loadData = async () => {
    try {
      const [payRes, leaseRes] = await Promise.all([
        api.get('landlord/payments/'),
        api.get('landlord/leases/')
      ])
      setPayments(payRes.data.payments || payRes.data)
      setLeases(leaseRes.data.leases || leaseRes.data)
    } catch (err) {
      console.error('Failed to load data:', err)
      alert('Could not load payments or leases')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getLeaseDetails = (leaseId) => leases.find(l => l.id === leaseId) || null

  const filteredPayments = payments.filter(pay => {
    const lease = getLeaseDetails(pay.lease?.id || pay.lease)
    const tenantName = (pay.tenant_name || lease?.tenant?.full_name || '').toLowerCase()
    const propName = (pay.property_title || lease?.property?.title || '').toLowerCase()
    const amountText = String(pay.amount || '')
    const q = searchQuery.toLowerCase()

    const matchStatus = activeFilter === 'ALL' || pay.status === activeFilter
    const matchSearch = !searchQuery || tenantName.includes(q) || propName.includes(q) || amountText.includes(q)
    return matchStatus && matchSearch
  })

  const openForm = (payment = null) => {
    if (payment) {
      setEditing(payment)
      setFormData({
        lease: payment.lease?.id || payment.lease || '',
        amount: payment.amount || '',
        payment_date: payment.payment_date ? formatDate(payment.payment_date).split('/').reverse().join('-') : '',
        method: payment.method || 'M-Pesa',
        status: payment.status || 'PENDING'
      })
    } else {
      setEditing(null)
      setFormData({ lease: '', amount: '', payment_date: '', method: 'M-Pesa', status: 'PENDING' })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...formData, payment_date: new Date(formData.payment_date).toISOString() }
      editing 
        ? await api.put(`landlord/payments/${editing.id}/`, payload)
        : await api.post('landlord/payments/', payload)
      alert(`Payment ${editing ? 'updated' : 'recorded'} successfully!`)
      setShowModal(false)
      loadData()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || 'Failed to save payment')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment?')) return
    try {
      await api.delete(`landlord/payments/${id}/`)
      alert('Payment deleted')
      loadData()
    } catch (err) {
      console.error(err)
      alert('Failed to delete payment')
    }
  }

  return (
    <div className="p-6">
      <button onClick={() => navigate('/dashboard')} className="mb-4 flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium">
        <i className="bi bi-arrow-left"></i> Back
      </button>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-800">Payments</h2>
          <button onClick={() => openForm()} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2">
            <i className="bi bi-plus-lg"></i> New Payment
          </button>
        </div>

        {/* Centered Search Bar */}
        <div className="flex justify-center">
          <div className="w-full sm:max-w-md">
            <div className="relative">
              <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search tenant, property or amount..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Centered Status Filters */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { key: 'ALL', label: 'All' },
            { key: 'PENDING', label: 'Pending' },
            { key: 'COMPLETED', label: 'Completed' },
            { key: 'FAILED', label: 'Failed' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                activeFilter === f.key ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading payments...</p>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="bi bi-credit-card text-4xl mb-3"></i>
          <p>No payments found matching your search or filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Tenant / Property</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Amount</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Date</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Payment Method</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="p-4 text-center text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(pay => {
                const lease = getLeaseDetails(pay.lease?.id || pay.lease)
                return (
                  <tr key={pay.id} className="border-t border-gray-100">
                    <td className="p-4 font-medium">
                      {pay.tenant_name || lease?.tenant?.full_name || 'Unknown'}
                      <span className="text-gray-500 text-sm ml-2">• {pay.property_title || lease?.property?.title || '-'}</span>
                    </td>
                    <td className="p-4">KSh {Number(pay.amount).toLocaleString()}</td>
                    <td className="p-4 text-sm">{formatDate(pay.payment_date)}</td>
                    <td className="p-4">{pay.method || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        pay.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        pay.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>{pay.status}</span>
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      <button onClick={() => openForm(pay)} className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100">Edit</button>
                      <button onClick={() => handleDelete(pay.id)} className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100">Delete</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">{editing ? 'Edit Payment' : 'New Payment'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lease</label>
                <select value={formData.lease} onChange={e => setFormData({...formData, lease: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                  <option value="">Select Lease</option>
                  {leases.map(l => <option key={l.id} value={l.id}>{l.tenant?.full_name || l.tenant_name} — {l.property?.title || l.property}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KSh)</label>
                <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required placeholder="0.00" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input type="date" value={formData.payment_date} onChange={e => setFormData({...formData, payment_date: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">{editing ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}