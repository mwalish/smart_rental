
import React, { useState, useEffect } from 'react'
import api from '../../services/api'

export default function LandlordMaintenancePage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const [activeFilter, setActiveFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // ✅ Fetch maintenance requests (backend auto-filters to landlord's properties)
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get('core/maintenance/')
        setRequests(res.data.maintenance_requests || [])
      } catch (err) {
        console.error('Failed to load maintenance requests:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()
  }, [])

  // ✅ Search & filter logic
  const filtered = requests.filter(r => {
    const tenant = (r.tenant_name || r.tenant?.name || '').toLowerCase()
    const property = (r.property_title || r.property?.name || '').toLowerCase()
    const issue = (r.issue || r.description || '').toLowerCase()
    const q = searchQuery.toLowerCase()

    const matchStatus = activeFilter === 'ALL' || r.status?.toUpperCase() === activeFilter
    const matchSearch = !searchQuery || tenant.includes(q) || property.includes(q) || issue.includes(q)
    return matchStatus && matchSearch
  })

  // ✅ Update status (uses PUT as per your backend)
  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`core/maintenance/${id}/`, { status: newStatus })
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
      alert(`Status updated to ${newStatus.replace('_', ' ')}`)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || 'Failed to update status')
    }
  }

  // ✅ Delete request (landlord/admin allowed per your backend)
  const deleteRequest = async (id) => {
    if (!window.confirm('Delete this request permanently?')) return
    try {
      await api.delete(`core/maintenance/${id}/`)
      setRequests(prev => prev.filter(r => r.id !== id))
      alert('Request deleted')
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || 'You cannot delete this request')
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Maintenance Requests</h2>

      {/* Centered Search Bar */}
      <div className="flex justify-center mb-4">
        <div className="w-full sm:max-w-md">
          <div className="relative">
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search tenant, property or issue..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Centered Status Filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {[
          { key: 'ALL', label: 'All' },
          { key: 'PENDING', label: 'Pending' },
          { key: 'IN_PROGRESS', label: 'In Progress' },
          { key: 'RESOLVED', label: 'Resolved' },
          { key: 'CANCELLED', label: 'Cancelled' }
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

      {loading ? (
        <p className="text-center text-gray-500">Loading requests...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="bi bi-tools text-4xl mb-3"></i>
          <p>No maintenance requests for your properties.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Tenant</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Property</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Issue</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="p-4 text-center text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="p-4 font-medium">{r.tenant_name || r.tenant?.name || '—'}</td>
                  <td className="p-4">{r.property_title || r.property?.name || '—'}</td>
                  <td className="p-4 max-w-xs truncate">{r.issue || r.description || '—'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      (r.status || '').toLowerCase() === 'resolved' ? 'bg-green-100 text-green-700' :
                      (r.status || '').toLowerCase() === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      (r.status || '').toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {(r.status || 'Pending').replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center gap-1 flex-wrap">
                    {(r.status || '').toLowerCase() !== 'in_progress' && (
                      <button onClick={() => updateStatus(r.id, 'in_progress')} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100">Start</button>
                    )}
                    {(r.status || '').toLowerCase() !== 'resolved' && (
                      <button onClick={() => updateStatus(r.id, 'resolved')} className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100">Resolve</button>
                    )}
                    {(r.status || '').toLowerCase() !== 'cancelled' && (
                      <button onClick={() => updateStatus(r.id, 'cancelled')} className="px-2 py-1 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100">Cancel</button>
                    )}
                    <button onClick={() => deleteRequest(r.id)} className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100">Delete</button>
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