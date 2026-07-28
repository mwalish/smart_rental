import React, { useState, useEffect, useContext } from 'react'
import api from '../../services/api'
import { AuthContext } from '../../AuthContext'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const EMPTY_FORM = { property: '', issue: '', description: '' }

export default function MaintenancePage() {
  const { profile } = useContext(AuthContext)
  const [requests, setRequests] = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [activeFilter, setActiveFilter] = useState('ALL')

  useEffect(() => {
    const load = async () => {
      try {
        const [maintRes, leaseRes] = await Promise.all([
          api.get('core/maintenance/'),
          api.get('core/leases/')
        ])
        setRequests(maintRes.data.maintenance_requests || [])
        // Extract unique properties from tenant's leases
        const leaseProps = (leaseRes.data.leases || [])
          .filter(l => l.status === 'ACTIVE' && l.property)
          .map(l => l.property)
        setProperties(leaseProps)
        if (leaseProps.length === 1) setForm(p => ({ ...p, property: leaseProps[0].id }))
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.post('core/maintenance/', form)
      setRequests(prev => [res.data.maintenance, ...prev])
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = requests.filter(r =>
    activeFilter === 'ALL' || (r.status || '').toUpperCase() === activeFilter
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Maintenance Requests</h2>
          {profile?.full_name && <p className="text-sm text-gray-500 mt-0.5">{profile.full_name}</p>}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700"
        >
          {showForm ? 'Cancel' : '+ New Request'}
        </button>
      </div>

      {/* Submit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">Submit a Maintenance Request</h3>

          {properties.length > 1 && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Property</label>
              <select
                value={form.property}
                onChange={e => setForm(p => ({ ...p, property: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select property...</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-600 mb-1">Issue</label>
            <input
              type="text"
              value={form.issue}
              onChange={e => setForm(p => ({ ...p, issue: e.target.value }))}
              required
              placeholder="e.g. Broken pipe, No electricity..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Description (optional)</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe the issue in more detail..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { k: 'ALL', l: 'All' },
          { k: 'PENDING', l: 'Pending' },
          { k: 'IN_PROGRESS', l: 'In Progress' },
          { k: 'RESOLVED', l: 'Resolved' },
          { k: 'CANCELLED', l: 'Cancelled' },
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

      {/* Request List */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="bi bi-tools text-4xl block mb-3"></i>
          <p>No maintenance requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm p-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800">{r.issue || '—'}</p>
                <p className="text-sm text-gray-500 mt-0.5">{r.property_title || '—'}</p>
                {r.description && <p className="text-sm text-gray-600 mt-1">{r.description}</p>}
                <p className="text-xs text-gray-400 mt-2">
                  {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${STATUS_COLORS[(r.status || '').toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>
                {(r.status || 'pending').replace('_', ' ').toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
