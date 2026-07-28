import React, { useState, useEffect } from 'react'
import api from '../../services/api'

export default function RequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const loadData = async () => {
    try {
      const res = await api.get('landlord/rental-requests/')
      setRequests(res.data || [])
    } catch (err) {
      console.error('Failed to load rental requests:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`landlord/rental-requests/${id}/`, { status: newStatus })
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update request')
    }
  }

  const filtered = requests.filter(r => {
    const q = searchQuery.toLowerCase()
    const matchStatus = activeFilter === 'ALL' || r.status === activeFilter
    const matchSearch = !q ||
      (r.tenant_name || '').toLowerCase().includes(q) ||
      (r.property_title || '').toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Rental Requests</h2>

      <div className="flex justify-center mb-4">
        <div className="relative w-full sm:max-w-md">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Search tenant or property..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {[
          { k: 'ALL', l: 'All' },
          { k: 'PENDING', l: 'Pending' },
          { k: 'APPROVED', l: 'Approved' },
          { k: 'REJECTED', l: 'Rejected' },
        ].map(f => (
          <button
            key={f.k}
            onClick={() => setActiveFilter(f.k)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium ${activeFilter === f.k ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {f.l}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="bi bi-envelope text-4xl block mb-3"></i>
          <p>No rental requests found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Applicant</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Property</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Message</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="p-4 text-center text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="p-4 font-medium">{r.tenant_name || '—'}</td>
                  <td className="p-4">{r.property_title || '—'}</td>
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
                  <td className="p-4 flex justify-center gap-2">
                    {r.status === 'PENDING' && (
                      <>
                        <button onClick={() => updateStatus(r.id, 'APPROVED')} className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100">Approve</button>
                        <button onClick={() => updateStatus(r.id, 'REJECTED')} className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100">Reject</button>
                      </>
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
