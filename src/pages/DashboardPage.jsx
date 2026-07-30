import React, { useContext, useState, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { AuthContext } from '../AuthContext'
import api from '../services/api'

const LANDLORD_NAV = [
  { to: '/dashboard', label: 'Overview', icon: 'bi-grid-1x2-fill', exact: true },
  { to: '/dashboard/properties', label: 'Properties', icon: 'bi-building-fill' },
  { to: '/dashboard/tenants', label: 'Tenants', icon: 'bi-people-fill' },
  { to: '/dashboard/maintenance', label: 'Maintenance', icon: 'bi-tools' },
  { to: '/dashboard/requests', label: 'Rental Requests', icon: 'bi-envelope-fill' },
  { to: '/dashboard/payments', label: 'Payments', icon: 'bi-cash-stack' },
  { to: '/dashboard/leases', label: 'Leases', icon: 'bi-file-earmark-text-fill' },
  { to: '/dashboard/meetings', label: 'Meetings', icon: 'bi-calendar2-check-fill' },
  { to: '/dashboard/notices', label: 'Notices', icon: 'bi-megaphone-fill' },
  { to: '/dashboard/register-tenant', label: 'Register Tenant', icon: 'bi-person-plus-fill' },
]

const TENANT_NAV = [
  { to: '/dashboard', label: 'Overview', icon: 'bi-grid-1x2-fill', exact: true },
  { to: '/dashboard/my-property', label: 'My Property', icon: 'bi-house-fill' },
  { to: '/dashboard/tenant-payments', label: 'My Payments', icon: 'bi-cash-stack' },
  { to: '/dashboard/maintenance', label: 'Maintenance', icon: 'bi-tools' },
  { to: '/dashboard/my-requests', label: 'Rental Requests', icon: 'bi-envelope-fill' },
  { to: '/dashboard/my-notices', label: 'Notices', icon: 'bi-megaphone-fill' },
]

const LANDLORD_STATS = [
  { key: 'total_properties', label: 'Properties', icon: 'bi-building-fill', color: 'from-teal-500 to-cyan-400', sub: (s) => `${s.available_properties} available · ${s.occupied_properties} occupied` },
  { key: 'active_leases', label: 'Active Leases', icon: 'bi-file-earmark-text-fill', color: 'from-violet-500 to-purple-400', sub: (s) => `${s.expired_leases} expired` },
  { key: 'pending_rental_requests', label: 'Pending Requests', icon: 'bi-envelope-fill', color: 'from-amber-500 to-yellow-400', sub: (s) => `${s.approved_rental_requests} approved` },
  { key: 'total_income_received', label: 'Total Income', icon: 'bi-cash-stack', color: 'from-green-500 to-emerald-400', sub: () => 'All time', fmt: true },
  { key: 'current_month_income', label: 'This Month', icon: 'bi-graph-up-arrow', color: 'from-blue-500 to-indigo-400', sub: () => 'Current month', fmt: true },
]

export default function DashboardPage() {
  const { user, profile, Logout } = useContext(AuthContext)
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.role === 'landlord') {
          const res = await api.get('landlord/dashboard/')
          setSummary(res.data.data.summary)
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [user])

  const navLinks = user?.role === 'landlord' ? LANDLORD_NAV : TENANT_NAV
  const displayName = profile?.full_name || user?.name || user?.username || 'User'
  const isOverview = location.pathname === '/dashboard'

  const isActive = (link) => {
    if (link.exact) return location.pathname === link.to
    return location.pathname.startsWith(link.to)
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-[72px]'} bg-slate-900 flex flex-col transition-all duration-300 shrink-0`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-300 flex items-center justify-center shrink-0 shadow-lg">
              <i className="bi bi-house-door-fill text-white text-sm"></i>
            </div>
            {sidebarOpen && <span className="font-black text-white text-lg truncate">Smart<span className="text-teal-400">Rent</span></span>}
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-white transition-colors shrink-0 ml-1">
            <i className={`bi ${sidebarOpen ? 'bi-chevron-left' : 'bi-chevron-right'} text-sm`}></i>
          </button>
        </div>

        {/* User pill */}
        {sidebarOpen && (
          <div className="mx-3 mt-4 p-3 bg-slate-800 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-300 flex items-center justify-center font-bold text-white text-sm shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{displayName}</p>
              <p className="text-slate-400 text-xs capitalize">{user?.role}</p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarOpen && <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-2">Menu</p>}
          {navLinks.map((link) => {
            const active = isActive(link)
            return (
              <Link
                key={link.to}
                to={link.to}
                title={!sidebarOpen ? link.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group
                  ${active
                    ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-900/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <i className={`bi ${link.icon} text-base shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}></i>
                {sidebarOpen && <span className="text-sm font-medium truncate">{link.label}</span>}
                {active && sidebarOpen && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-300"></div>}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4 border-t border-slate-800 pt-3">
          <button
            onClick={Logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
            title={!sidebarOpen ? 'Logout' : undefined}
          >
            <i className="bi bi-box-arrow-right text-base shrink-0"></i>
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between shrink-0 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {navLinks.find(l => isActive(l))?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors relative">
              <i className="bi bi-bell text-base"></i>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800 leading-none">{displayName}</p>
                <p className="text-xs text-gray-400 capitalize mt-0.5">{user?.role}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center font-bold text-white text-sm shadow">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {isOverview ? (
            <div className="p-6 space-y-6 animate-fade-up">
              {/* Welcome */}
              <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl"></div>
                <div className="relative">
                  <p className="text-teal-300 text-sm font-medium mb-1">
                    {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                  <h2 className="text-2xl font-black text-white mb-1">Welcome back, {displayName.split(' ')[0]}! 👋</h2>
                  <p className="text-slate-400 text-sm">Here's what's happening with your {user?.role === 'landlord' ? 'properties' : 'rental'} today.</p>
                </div>
              </div>

              {/* Stats */}
              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-28"></div>
                  ))}
                </div>
              ) : user?.role === 'landlord' && summary ? (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {LANDLORD_STATS.map(s => (
                    <div key={s.key} className="bg-white rounded-2xl p-5 border border-gray-100 stat-card">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-md`}>
                        <i className={`bi ${s.icon} text-white text-base`}></i>
                      </div>
                      <p className="text-2xl font-black text-gray-900">
                        {s.fmt ? `KSh ${Number(summary[s.key]).toLocaleString()}` : summary[s.key]}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 font-medium">{s.label}</p>
                      <p className="text-xs text-gray-300 mt-0.5">{s.sub(summary)}</p>
                    </div>
                  ))}
                </div>
              ) : user?.role === 'tenant' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: 'bi-house-fill', label: 'My Property', desc: 'View your lease & property details', to: '/dashboard/my-property', color: 'from-teal-500 to-cyan-400' },
                    { icon: 'bi-cash-stack', label: 'My Payments', desc: 'Track rent payments & balance', to: '/dashboard/tenant-payments', color: 'from-amber-500 to-yellow-400' },
                    { icon: 'bi-tools', label: 'Maintenance', desc: 'Submit & track repair requests', to: '/dashboard/maintenance', color: 'from-orange-500 to-red-400' },
                  ].map(c => (
                    <Link key={c.label} to={c.to} className="bg-white rounded-2xl p-6 border border-gray-100 stat-card flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-md shrink-0`}>
                        <i className={`bi ${c.icon} text-white text-lg`}></i>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{c.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{c.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}

              {/* Quick links */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-sm font-bold text-gray-700 mb-4">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {navLinks.filter(l => !l.exact).slice(0, 5).map(l => (
                    <Link key={l.to} to={l.to} className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 text-gray-600 rounded-xl text-sm font-medium transition-colors border border-gray-100">
                      <i className={`bi ${l.icon} text-sm`}></i>
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  )
}
