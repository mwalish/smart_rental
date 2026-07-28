import React, { useState, useEffect, useContext } from 'react'
import api from '../../services/api'
import { AuthContext } from '../../AuthContext'
import { LoadingSpinner, Badge } from '../../components/ui'

export default function MyPropertyPage() {
  const { profile } = useContext(AuthContext)
  const [lease, setLease] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('core/leases/')
      .then(r => {
        const leases = r.data.leases || []
        setLease(leases.find(l => l.status === 'ACTIVE') || leases[0] || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6"><LoadingSpinner /></div>

  return (
    <div className="p-6 space-y-5 animate-fade-up">

      {/* Tenant Profile Card */}
      {profile && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-teal-500 to-cyan-400"></div>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                {(profile.full_name || 'T')[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">{profile.full_name}</h2>
                <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <i className="bi bi-person-badge text-teal-500"></i> Tenant
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: 'bi-card-text', label: 'ID Number', val: profile.id_number },
                { icon: 'bi-telephone', label: 'Phone', val: profile.phone },
                { icon: 'bi-envelope', label: 'Email', val: profile.email_address },
                { icon: 'bi-telephone-plus', label: 'Alt. Phone', val: profile.alternative_phone },
                { icon: 'bi-calendar-check', label: 'Joined', val: profile.join_date },
              ].filter(f => f.val).map(f => (
                <div key={f.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                    <i className={`bi ${f.icon} text-teal-500`}></i>{f.label}
                  </p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{f.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lease / Property Card */}
      {!lease ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          <i className="bi bi-building text-5xl block mb-3 opacity-30"></i>
          <p className="text-sm">No active lease found. Contact your landlord.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-400"></div>
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg font-black text-gray-900">{lease.property?.title || '—'}</h3>
                <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
                  <i className="bi bi-geo-alt text-violet-500"></i>{lease.property?.location || '—'}
                </p>
              </div>
              <Badge status={lease.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
              {[
                { icon: 'bi-cash-stack', label: 'Monthly Rent', val: `KSh ${Number(lease.monthly_rent).toLocaleString()}`, color: 'text-teal-600' },
                { icon: 'bi-calendar-check', label: 'Lease Start', val: lease.start_date || '—', color: 'text-gray-800' },
                { icon: 'bi-calendar-x', label: 'Lease End', val: lease.end_date || '—', color: 'text-gray-800' },
                { icon: 'bi-person-fill', label: 'Landlord', val: lease.landlord_name || '—', color: 'text-gray-800' },
              ].map(f => (
                <div key={f.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                    <i className={`bi ${f.icon} text-violet-500`}></i>{f.label}
                  </p>
                  <p className={`text-sm font-bold ${f.color}`}>{f.val}</p>
                </div>
              ))}
            </div>

            {lease.property?.description && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-400 mb-1">Property Description</p>
                <p className="text-sm text-gray-600">{lease.property.description}</p>
              </div>
            )}

            {lease.terms && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
                  <i className="bi bi-file-earmark-text"></i> Lease Terms
                </p>
                <p className="text-sm text-amber-800 whitespace-pre-line">{lease.terms}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
