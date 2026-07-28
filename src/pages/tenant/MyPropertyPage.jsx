import React, { useState, useEffect, useContext } from 'react'
import api from '../../services/api'
import { AuthContext } from '../../AuthContext'

export default function MyPropertyPage() {
  const { profile } = useContext(AuthContext)
  const [lease, setLease] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('core/leases/')
        const leases = res.data.leases || []
        const active = leases.find(l => l.status === 'ACTIVE') || leases[0] || null
        setLease(active)
      } catch (err) {
        console.error('Failed to load lease:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <p className="p-6 text-center text-gray-500">Loading...</p>

  if (!lease) return (
    <div className="p-6 text-center py-16 text-gray-500">
      <i className="bi bi-building text-4xl block mb-3"></i>
      <p>No active lease found. Contact your landlord.</p>
    </div>
  )

  const property = lease.property || {}
  const statusColor = lease.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
    lease.status === 'EXPIRED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">My Property</h2>

      {/* Tenant Info Card */}
      {profile && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h4 className="font-semibold text-gray-700 mb-3">Tenant Details</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Full Name</p>
              <p className="font-semibold text-gray-800">{profile.full_name || '—'}</p>
            </div>
            <div>
              <p className="text-gray-400">ID Number</p>
              <p className="font-semibold text-gray-800">{profile.id_number || '—'}</p>
            </div>
            <div>
              <p className="text-gray-400">Phone</p>
              <p className="font-semibold text-gray-800">{profile.phone || '—'}</p>
            </div>
            <div>
              <p className="text-gray-400">Email</p>
              <p className="font-semibold text-gray-800">{profile.email_address || '—'}</p>
            </div>
            {profile.alternative_phone && (
              <div>
                <p className="text-gray-400">Alt. Phone</p>
                <p className="font-semibold text-gray-800">{profile.alternative_phone}</p>
              </div>
            )}
            <div>
              <p className="text-gray-400">Joined</p>
              <p className="font-semibold text-gray-800">{profile.join_date || '—'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Property Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{property.title || '—'}</h3>
            <p className="text-gray-500 text-sm mt-1">
              <i className="bi bi-geo-alt mr-1"></i>{property.location || '—'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {lease.status}
          </span>
        </div>
        {property.description && (
          <p className="text-sm text-gray-600 mb-4">{property.description}</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Monthly Rent</p>
            <p className="font-semibold text-gray-800">KSh {Number(lease.monthly_rent).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400">Lease Start</p>
            <p className="font-semibold text-gray-800">{lease.start_date || '—'}</p>
          </div>
          <div>
            <p className="text-gray-400">Lease End</p>
            <p className="font-semibold text-gray-800">{lease.end_date || '—'}</p>
          </div>
        </div>
      </div>

      {/* Lease Terms */}
      {lease.terms && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h4 className="font-semibold text-gray-700 mb-2">Lease Terms</h4>
          <p className="text-sm text-gray-600 whitespace-pre-line">{lease.terms}</p>
        </div>
      )}
    </div>
  )
}
