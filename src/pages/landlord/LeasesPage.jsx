import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function LeasesPage() {
  const navigate = useNavigate()
  const [leases, setLeases] = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    property: '',
    tenant: '', // ✅ still holds ID for backend
    start_date: '',
    end_date: '',
    monthly_rent: '',
    status: 'ACTIVE',
    terms: ''
  })
  const [displayTenantName, setDisplayTenantName] = useState('') // ✅ just for showing name

  const loadData = async () => {
    try {
      const [leasesRes, propsRes] = await Promise.all([
        api.get('landlord/leases/'),
        api.get('landlord/properties/')
      ])
      setLeases(leasesRes.data.leases || leasesRes.data)
      setProperties(propsRes.data)
    } catch (err) {
      console.error('Failed to load data:', err)
      alert('Could not load leases or properties')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const openForm = (lease = null) => {
    if (lease) {
      setEditing(lease)
      setFormData({
        property: lease.property?.id || lease.property || '',
        tenant: lease.tenant?.id || lease.tenant || '',
        start_date: lease.start_date || '',
        end_date: lease.end_date || '',
        monthly_rent: lease.monthly_rent || '',
        status: lease.status || 'ACTIVE',
        terms: lease.terms || ''
      })
      // ✅ Show full name in the input
      setDisplayTenantName(lease.tenant?.full_name || lease.tenant?.name || lease.tenant_name || '')
    } else {
      setEditing(null)
      setFormData({ property: '', tenant: '', start_date: '', end_date: '', monthly_rent: '', status: 'ACTIVE', terms: '' })
      setDisplayTenantName('')
    }
    setShowModal(true)
  }

  // ✅ When user types, keep form.tenant as ID if it's a number, else use value
  const handleTenantChange = (e) => {
    const val = e.target.value
    setDisplayTenantName(val)
    setFormData(prev => ({ ...prev, tenant: val }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`landlord/leases/${editing.id}/`, formData)
        alert('Lease updated successfully!')
      } else {
        await api.post('landlord/leases/', formData)
        alert('Lease created successfully!')
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      console.error(err)
      let msg = 'Failed to save lease'
      if (err.response?.data) {
        const d = err.response.data
        msg = d.message || d.error || JSON.stringify(d)
      }
      alert(msg)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lease?')) return
    try {
      await api.delete(`landlord/leases/${id}/`)
      alert('Lease deleted')
      loadData()
    } catch (err) {
      console.error(err)
      alert('Failed to delete lease')
    }
  }

  return (
    <div className="p-6">
      <button 
        onClick={() => navigate('/dashboard')} 
        className="mb-4 flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
      >
        <i className="bi bi-arrow-left"></i> Back to Dashboard
      </button>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Leases</h2>
        <button 
          onClick={() => openForm()} 
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
        >
          <i className="bi bi-plus-lg"></i> Create Lease
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading leases...</p>
      ) : leases.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="bi bi-file-earmark-text text-4xl mb-4"></i>
          <p>No leases yet. Create your first lease to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Property</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Tenant Name</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Rent</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Dates</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="p-4 text-center text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leases.map(l => (
                <tr key={l.id} className="border-t border-gray-100">
                  <td className="p-4 font-medium">{l.property?.title || l.property}</td>
                  {/* ✅ Always shows full name, never ID */}
                  <td className="p-4">{l.tenant?.full_name || l.tenant?.name || l.tenant_name || l.tenant}</td>
                  <td className="p-4">KSh {Number(l.monthly_rent).toLocaleString()}</td>
                  <td className="p-4 text-sm">{l.start_date} → {l.end_date}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      l.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>{l.status}</span>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <button 
                      onClick={() => openForm(l)} 
                      className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(l.id)} 
                      className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">{editing ? 'Edit Lease' : 'New Lease'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                <select
                  value={formData.property}
                  onChange={e => setFormData({...formData, property: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select Property</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.title} — {p.location}</option>
                  ))}
                </select>
              </div>
              {/* ✅ Shows full name, still sends ID to backend */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
                <input
                  type="text"
                  value={displayTenantName}
                  onChange={handleTenantChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                  placeholder="Enter tenant name or ID"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={e => setFormData({...formData, start_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={e => setFormData({...formData, end_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (KSh)</label>
                <input
                  type="number"
                  value={formData.monthly_rent}
                  onChange={e => setFormData({...formData, monthly_rent: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="PENDING">Pending</option>
                  <option value="ACTIVE">Active</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Notes</label>
                <textarea
                  value={formData.terms}
                  onChange={e => setFormData({...formData, terms: e.target.value})}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  {editing ? 'Update Lease' : 'Create Lease'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
