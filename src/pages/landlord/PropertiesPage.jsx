import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function PropertiesPage() {
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  // ✅ MATCHES DJANGO EXACTLY: title, rent_per_month
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    rent_per_month: '',
    status: 'AVAILABLE',
    description: ''
  })

  const loadProperties = async () => {
    try {
      const res = await api.get('landlord/properties/')
      setProperties(res.data)
    } catch (err) {
      console.error('Failed to load properties:', err)
      alert('Could not load properties')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProperties() }, [])

  const openForm = (prop = null) => {
    if (prop) {
      setEditing(prop)
      setFormData({
        title: prop.title || '',
        location: prop.location || '',
        rent_per_month: prop.rent_per_month || '',
        status: prop.status || 'AVAILABLE',
        description: prop.description || ''
      })
    } else {
      setEditing(null)
      setFormData({ title: '', location: '', rent_per_month: '', status: 'AVAILABLE', description: '' })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`landlord/properties/${editing.id}/`, formData)
        alert('Property updated successfully!')
      } else {
        await api.post('landlord/properties/', formData)
        alert('Property added successfully!')
      }
      setShowModal(false)
      loadProperties()
    } catch (err) {
      console.error(err)
      let errorMsg = 'Failed to save property'
      if (err.response?.data) {
        const data = err.response.data
        if (data.error) {
          errorMsg = typeof data.error === 'string' 
            ? data.error 
            : Object.entries(data.error).map(([k,v]) => `${k}: ${v.join(', ')}`).join(' | ')
        } else if (data.message) {
          errorMsg = data.message
        }
      }
      alert(errorMsg)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property? This cannot be undone.')) return
    try {
      await api.delete(`landlord/properties/${id}/`)
      alert('Property deleted')
      loadProperties()
    } catch (err) {
      console.error(err)
      alert('Failed to delete property')
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
        <h2 className="text-2xl font-bold text-gray-800">My Properties</h2>
        <button onClick={() => openForm()} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2">
          <i className="bi bi-plus-lg"></i> Add Property
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading properties...</p>
      ) : properties.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="bi bi-building text-4xl mb-4"></i>
          <p>No properties added yet. Click "Add Property" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
            <div key={prop.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {/* ✅ Use correct field names from backend */}
              <h3 className="text-xl font-semibold mb-2">{prop.title}</h3>
              <p className="text-gray-600 mb-1"><i className="bi bi-geo-alt me-2"></i>{prop.location}</p>
              <p className="text-gray-600 mb-3"><i className="bi bi-cash-coin me-2"></i>KSh {prop.rent_per_month}/month</p>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                prop.status === 'OCCUPIED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {prop.status}
              </span>
              <div className="mt-4 flex gap-2">
                <button onClick={() => openForm(prop)} className="flex-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                  <i className="bi bi-pencil me-1"></i> Edit
                </button>
                <button onClick={() => handleDelete(prop.id)} className="flex-1 px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100">
                  <i className="bi bi-trash me-1"></i> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">{editing ? 'Edit Property' : 'Add New Property'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (KSh)</label>
                <input
                  type="number"
                  value={formData.rent_per_month}
                  onChange={e => setFormData({...formData, rent_per_month: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                  {editing ? 'Update' : 'Add'} Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
