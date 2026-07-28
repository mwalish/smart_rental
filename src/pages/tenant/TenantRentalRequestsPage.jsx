import React, { useState, useEffect, useContext } from 'react'
import api from '../../services/api'
import { AuthContext } from '../../AuthContext'

export default function TenantRentalRequestsPage() {
  const { profile } = useContext(AuthContext)
  const [requests, setRequests] = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ property: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [activeFilter, setActiveFilter] = useState('ALL')

  const loadData = async () => {
    try {
      const [reqRes, propRes] = await Promise.all([
        api.get('core/rental-requests/'),
        api.get('core/properties/available/')
      ])
      setRequests(reqRes.data.rental_requests || [])
      setProperties(propRes.data || [])
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.post('core/rental-requests/', form)
      setRequests(prev => [res.data.request, ...prev])
      setForm({ property: '', message: '' })
      setShowForm(false)
    } catch (err) {
      alert(err.response?.data?.error || JSON.stringify(err.response?.data) || 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleWithdraw = async (id) => {
    if (!window.confirm('Withdraw this request?')) return
    try {
      await api.delete(`core/rental-requests/${id}/`)
      setRequests(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      alert(err.response?.data?.error || 'Cannot withdraw this request')
    }
  }

  const filtered = requests.filter(r =>
    activeFilter === 'ALL' || r.status === activeFilter
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Rental Requests</h2>
          {profile?.full_name && <p className="text-sm text-gray-500 mt-0.5">{profile.full_name}</p>}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700"
        >
          {showForm ? 'Cancel' : '+ Apply for Property'}
        </button>
      </div>

      {/* Submit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">Apply for a Property</h3>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Property</label>
            <select
              value={form.property}
              onChange={e => setForm(p => ({ ...p, property: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select available property...</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} — {p.location} (KSh {Number(p.rent_per_month).toLocaleString()}/mo)
                </option>
              ))}
            </select>
            {properties.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">No available properties at the moment.</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Message (optional)</label>
            <textarea
              rows={3}
              value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              placeholder="Introduce yourself or add any notes..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || properties.length === 0}
            className="px-6 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium ${activeFilter === f ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Request List */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="bi bi-envelope text-4xl block mb-3"></i>
          <p>No rental requests yet. Apply for a property above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Property</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Message</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Date</th>
                <th className="p-4 text-center text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="p-4 font-medium">{r.property_title || '—'}</td>
                  <td className="p-4 text-sm max-w-xs truncate">{r.message || '—'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      r.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      r.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {r.status_display || r.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-4 text-center">
                    {r.status === 'PENDING' && (
                      <button
                        onClick={() => handleWithdraw(r.id)}
                        className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100"
                      >
                        Withdraw
                      </button>
                    )}
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
