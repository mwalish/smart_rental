import React, { useContext, useState, useEffect } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { AuthContext } from '../AuthContext'
import api from '../services/api'

export default function DashboardPage() {
  const { user, Logout } = useContext(AuthContext)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.role === 'landlord') {
          // ✅ Matches your Django endpoint exactly
          const res = await api.get('landlord/dashboard/')
          // ✅ Backend returns: { message, data: { summary, quick_links } }
          setSummary(res.data.data.summary)
        }
        // Add tenant fetch here once you create tenant endpoint
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [user])

  const getNavLinks = () => {
    switch (user?.role) {
      case 'landlord':
        return [
          { to: '/dashboard', label: 'Overview', icon: 'bi-house-door' },
          { to: '/dashboard/properties', label: 'Properties', icon: 'bi-building' },
          { to: '/dashboard/tenants', label: 'Tenants & Requests', icon: 'bi-people' },
          { to: '/dashboard/payments', label: 'Payments', icon: 'bi-cash-coin' },
          { to: '/dashboard/leases', label: 'Leases', icon: 'bi-file-earmark-text' },
          { to: '/dashboard/meetings', label: 'Meetings', icon: 'bi-calendar-event' },
        ]
      case 'tenant':
        return [
          { to: '/dashboard', label: 'Overview', icon: 'bi-house-door' },
          { to: '/dashboard/my-property', label: 'My Property', icon: 'bi-building' },
          { to: '/dashboard/payments', label: 'My Payments', icon: 'bi-cash-coin' },
          { to: '/dashboard/maintenance', label: 'Requests', icon: 'bi-wrench' },
        ]
      default:
        return []
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-md transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <i className="bi bi-house-door text-teal-600 text-xl"></i>
            {sidebarOpen && <span className="font-bold text-teal-600">SmartRent</span>}
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-teal-600">
            <i className="bi bi-list"></i>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {getNavLinks().map((link, idx) => (
            <Link
              key={idx}
              to={link.to}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors"
            >
              <i className={`bi ${link.icon} text-lg`}></i>
              {sidebarOpen && <span className="font-medium">{link.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={Logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <i className="bi bi-box-arrow-right"></i>
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dashboard Stats */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}!</h2>
            <p className="text-gray-600 mt-1">Here’s what’s happening with your properties today.</p>
          </div>

          {loading ? (
            <p className="col-span-full text-center text-gray-500 py-12">Loading dashboard data...</p>
          ) : user?.role === 'landlord' && summary ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm">Total Properties</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{summary.total_properties}</p>
                <p className="text-xs text-gray-500 mt-1">{summary.available_properties} available • {summary.occupied_properties} occupied</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm">Active Leases</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{summary.active_leases}</p>
                <p className="text-xs text-gray-500 mt-1">{summary.expired_leases} expired</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm">Rental Requests</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{summary.pending_rental_requests} pending</p>
                <p className="text-xs text-gray-500 mt-1">{summary.approved_rental_requests} approved</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm">Total Income</p>
                <p className="text-3xl font-bold text-teal-600 mt-2">KSh {summary.total_income_received.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm">This Month</p>
                <p className="text-3xl font-bold text-green-600 mt-2">KSh {summary.current_month_income.toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">No data available or access denied.</p>
          )}

          <Outlet />
        </main>
      </div>
    </div>
  )
}