import React, { useState, useEffect, useContext } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { AuthContext } from '../../AuthContext'
import { toAbsoluteMedia } from '../../config'
import { getMyRequests } from '../../services/houseHuntingService'
import { LoadingSpinner } from '../../components/ui'

const NAV_ITEMS = [
  { to: '/houses/dashboard', label: 'Overview', icon: 'bi-grid-1x2-fill', exact: true },
  { to: '/houses', label: 'Browse Properties', icon: 'bi-building' },
  { to: '/houses/my-requests', label: 'My Applications', icon: 'bi-envelope-fill' },
  { to: '/houses/track-request', label: 'Track Request', icon: 'bi-search' },
]

export default function TenantDashboardPage() {
  const { user, profile, Logout } = useContext(AuthContext)
  const location = useLocation()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyRequests()
      .then(data => {
        setRequests(data.rental_requests || data.results || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

const displayName = profile?.full_name || user?.name || user?.username || 'Tenant'
  // Profile picture helper — renders the uploaded image or a name initial.
  const picSrc = profile?.profile_picture || null
  const isOverview = location.pathname === '/houses/dashboard'

  const isActive = (link) => {
    if (link.exact) return location.pathname === link.to
    return location.pathname.startsWith(link.to)
  }

  const pendingCount = requests.filter(r => r.status === 'PENDING').length
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top Navbar ── */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center shadow">
              <i className="bi bi-house-door-fill text-white text-sm"></i>
            </div>
            <span className="text-lg font-black text-gray-900">Smart<span className="text-teal-600">Rent</span></span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1">
              {NAV_ITEMS.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                    isActive(link)
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <i className={`bi ${link.icon} mr-1.5`}></i>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">{displayName}</p>
                <p className="text-xs text-gray-400">Tenant</p>
              </div>
{picSrc ? (
                <img src={toAbsoluteMedia(picSrc)} alt={displayName} className="w-9 h-9 rounded-full object-cover shadow" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center font-bold text-white text-sm shadow">
                  {displayName[0].toUpperCase()}
                </div>
              )}
              <button onClick={Logout} className="ml-2 p-2 text-gray-400 hover:text-red-500 transition-colors" title="Logout">
                <i className="bi bi-box-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden border-t border-gray-100 px-4 py-2 flex gap-2 overflow-x-auto">
          {NAV_ITEMS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
                isActive(link) ? 'bg-teal-50 text-teal-700' : 'text-gray-500'
              }`}
            >
              <i className={`bi ${link.icon} mr-1`}></i>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isOverview ? (
          <div className="space-y-6 animate-fade-up">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl"></div>
              <div className="relative">
                <p className="text-teal-300 text-sm font-medium mb-1">
                  {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <h2 className="text-2xl font-black text-white mb-1">Welcome, {displayName.split(' ')[0]}! 🏡</h2>
                <p className="text-slate-400 text-sm">Your house-hunting dashboard — track applications and find your next home.</p>
              </div>
            </div>

            {/* Stats */}
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 stat-card">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center mb-3 shadow-md">
                    <i className="bi bi-building text-white text-base"></i>
                  </div>
                  <p className="text-2xl font-black text-gray-900">{requests.length}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">Total Applications</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 stat-card">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center mb-3 shadow-md">
                    <i className="bi bi-hourglass-split text-white text-base"></i>
                  </div>
                  <p className="text-2xl font-black text-gray-900">{pendingCount}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">Pending Review</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 stat-card">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center mb-3 shadow-md">
                    <i className="bi bi-check-circle text-white text-base"></i>
                  </div>
                  <p className="text-2xl font-black text-gray-900">{approvedCount}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">Approved</p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/houses" className="bg-white rounded-2xl p-6 border border-gray-100 stat-card flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center shadow-md shrink-0">
                  <i className="bi bi-building text-white text-lg"></i>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Browse Properties</p>
                  <p className="text-xs text-gray-400 mt-0.5">View all available rental listings</p>
                </div>
              </Link>
              <Link to="/houses/my-requests" className="bg-white rounded-2xl p-6 border border-gray-100 stat-card flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center shadow-md shrink-0">
                  <i className="bi bi-envelope-fill text-white text-lg"></i>
                </div>
                <div>
                  <p className="font-bold text-gray-900">My Applications</p>
                  <p className="text-xs text-gray-400 mt-0.5">Track your rental requests</p>
                </div>
              </Link>
              <Link to="/houses/track-request" className="bg-white rounded-2xl p-6 border border-gray-100 stat-card flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-400 flex items-center justify-center shadow-md shrink-0">
                  <i className="bi bi-search text-white text-lg"></i>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Track Request</p>
                  <p className="text-xs text-gray-400 mt-0.5">Look up a request by phone or email</p>
                </div>
              </Link>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  )
}
