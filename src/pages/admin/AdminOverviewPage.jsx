import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { LoadingSpinner } from '../../components/ui'

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('core/admin/dashboard/')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const cards = [
    { label: 'Total Properties', value: stats?.overview?.total_properties, icon: 'bi-building-fill', color: 'from-teal-500 to-cyan-400', sub: `${stats?.properties?.occupied} occupied · ${stats?.properties?.vacant} vacant` },
    { label: 'Landlords', value: stats?.overview?.total_landlords, icon: 'bi-person-badge-fill', color: 'from-violet-500 to-purple-400', sub: 'Registered landlords' },
    { label: 'Tenants', value: stats?.overview?.total_tenants, icon: 'bi-people-fill', color: 'from-blue-500 to-indigo-400', sub: 'Registered tenants' },
    { label: 'Active Leases', value: stats?.overview?.active_leases, icon: 'bi-file-earmark-text-fill', color: 'from-green-500 to-emerald-400', sub: `${stats?.overview?.occupancy_rate_percent}% occupancy rate` },
    { label: 'Revenue Collected', value: `KSh ${Number(stats?.payments?.total_collected || 0).toLocaleString()}`, icon: 'bi-cash-stack', color: 'from-amber-500 to-yellow-400', sub: `KSh ${Number(stats?.payments?.total_pending || 0).toLocaleString()} pending` },
    { label: 'Pending Maintenance', value: stats?.pending_actions?.maintenance, icon: 'bi-tools', color: 'from-orange-500 to-red-400', sub: 'Open requests' },
    { label: 'Rental Requests', value: stats?.pending_actions?.rental_requests, icon: 'bi-envelope-fill', color: 'from-pink-500 to-rose-400', sub: 'Awaiting review' },
]

  return (
    <div className="p-6 space-y-6 animate-fade-up">
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl"></div>
        <div className="relative">
          <p className="text-teal-300 text-sm font-medium mb-1">System Overview</p>
          <h2 className="text-2xl font-black text-white mb-1">Admin Dashboard 🛡️</h2>
          <p className="text-slate-400 text-sm">Full system visibility across all landlords, tenants, and properties.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl p-5 border border-gray-100 stat-card">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-3 shadow-md`}>
              <i className={`bi ${c.icon} text-white text-base`}></i>
            </div>
            <p className="text-2xl font-black text-gray-900">{c.value ?? '—'}</p>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">{c.label}</p>
            <p className="text-xs text-gray-300 mt-0.5">{c.sub}</p>
</div>
        ))}
      </div>
    </div>
  )
}
