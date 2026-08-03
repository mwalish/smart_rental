import React, { useContext, useState, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { AuthContext } from '../AuthContext'
import api from '../services/api'
import AdminOverviewPage from './admin/AdminOverviewPage'
import { Badge } from '../components/ui'

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

const ADMIN_NAV = [
  { to: '/dashboard', label: 'Overview', icon: 'bi-grid-1x2-fill', exact: true },
  { to: '/dashboard/admin/users', label: 'All Users', icon: 'bi-people-fill' },
  { to: '/dashboard/admin/create-landlord', label: 'Create Landlord', icon: 'bi-person-plus-fill' },
  { to: '/dashboard/admin/leases', label: 'All Leases', icon: 'bi-file-earmark-text-fill' },
  { to: '/dashboard/admin/payments', label: 'All Payments', icon: 'bi-cash-stack' },
  { to: '/dashboard/admin/maintenance', label: 'Maintenance', icon: 'bi-tools' },
  { to: '/dashboard/admin/notices', label: 'Notices', icon: 'bi-megaphone-fill' },
  { to: '/dashboard/admin/rental-requests', label: 'Rental Requests', icon: 'bi-envelope-fill' },
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
  const [recentRequests, setRecentRequests] = useState([])
  const [recentPayments, setRecentPayments] = useState([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.role === 'landlord') {
          const [dashRes, reqRes, payRes] = await Promise.all([
            api.get('landlord/dashboard/'),
            api.get('landlord/rental-requests/'),
            api.get('landlord/payments/')
          ])
          setSummary(dashRes.data.data.summary)
          setRecentRequests((reqRes.data.rental_requests || reqRes.data || []).slice(0, 5))
          setRecentPayments((payRes.data.payments || payRes.data || []).slice(0, 5))
        } else if (user?.role === 'tenant') {
          // Tenants see the same breadth: applications, lease/payments, maintenance
          const [reqRes, payRes, maintRes, leaseRes] = await Promise.all([
            api.get('core/rental-requests/'),
            api.get('core/payments/'),
            api.get('core/maintenance/'),
            api.get('core/leases/')
          ])
          const requests = reqRes.data.rental_requests || reqRes.data || []
          const payments = payRes.data.payments || payRes.data || []
          const maintenance = maintRes.data.maintenance_requests || maintRes.data || []
          const leases = leaseRes.data.leases || leaseRes.data || []
          const activeLease = leases.find(l => l.status === 'ACTIVE') || leases[0] || null
          const totalPaid = payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + Number(p.amount || 0), 0)
          const pendingPay = payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + Number(p.amount || 0), 0)
          setSummary({
            total_applications: requests.length,
            pending_applications: requests.filter(r => r.status === 'PENDING').length,
            approved_applications: requests.filter(r => r.status === 'APPROVED').length,
            rejected_applications: requests.filter(r => r.status === 'REJECTED').length,
            has_lease: !!activeLease,
            monthly_rent: activeLease ? Number(activeLease.monthly_rent) : 0,
            property_title: activeLease?.property?.title || activeLease?.property_title || null,
            total_paid: totalPaid,
            pending_payment: pendingPay,
            open_maintenance: maintenance.filter(m => ['PENDING', 'IN_PROGRESS'].includes(m.status)).length,
            total_maintenance: maintenance.length,
          })
          setRecentRequests(requests.slice(0, 5))
          setRecentPayments(payments.slice(0, 5))
        } else if (user?.role === 'admin') {
          setLoading(false)
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [user])

const navLinks = user?.role === 'admin' ? ADMIN_NAV : user?.role === 'landlord' ? LANDLORD_NAV : TENANT_NAV
  const displayName = profile?.full_name || user?.name || user?.username || 'User'
  const isOverview = location.pathname === '/dashboard'

  // A tenant is only "registered" (linked to a house) once a landlord has
  // registered them (registered_by set) or they hold an active lease.
  // Self-registered tenants (house-hunting) are NOT linked to any house yet.
  const isTenantRegistered =
    user?.role !== 'tenant' ||
    !!(profile?.registered_by_name || profile?.registered_by) ||
    !!(profile?.active_lease || profile?.has_lease)

  const isActive = (link) => {
    if (link.exact) return location.pathname === link.to
    return location.pathname.startsWith(link.to)
  }

const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notifFilter, setNotifFilter] = useState('all') // 'all' | 'tenant' | 'guest'
  // Track which notification ids have been read (persisted in localStorage)
  const [readNotifs, setReadNotifs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('read_notifs') || '[]') } catch { return [] }
  })

  // Persist read notifications
  useEffect(() => {
    try { localStorage.setItem('read_notifs', JSON.stringify(readNotifs)) } catch { /* ignore */ }
  }, [readNotifs])

  const markRead = (id) => {
    setReadNotifs(prev => prev.includes(id) ? prev : [...prev, id])
  }

  const markAllRead = () => {
    setReadNotifs(prev => [...new Set([...prev, ...notifications.map(n => n.id)])])
  }

useEffect(() => {
    // Fetch pending notifications — but ONLY for users who are entitled to them.
    // A self-registered tenant (not registered by a landlord) is not linked to
    // any house, so they must not get tenant notifications.
    if (user?.role === 'tenant' && !isTenantRegistered) {
      setNotifications([])
      return
    }
    const fetchNotifs = async () => {
      try {
        const [reqRes, maintRes, noticeRes] = await Promise.all([
          api.get('landlord/rental-requests/').catch(() => api.get('core/rental-requests/').catch(() => null)),
          api.get('landlord/maintenance/').catch(() => api.get('core/maintenance/').catch(() => null)),
          api.get('core/notices/').catch(() => null),
        ])
        const items = []
        // pending requests — guest (lead) vs tenant determined by whether a tenant is linked
        const requests = reqRes?.data?.rental_requests || reqRes?.data || []
        requests.filter(r => r.status === 'PENDING').forEach(r => {
          const isTenant = !!(r.tenant || r.tenant_id)
          items.push({
            id: `req-${r.id}`,
            type: 'request',
            audience: isTenant ? 'tenant' : 'guest',
            text: `${isTenant ? 'Tenant' : 'Guest'} request from ${r.tenant_name || r.lead_name || 'someone'}`,
            link: '/dashboard/requests',
            time: r.created_at,
          })
        })
        // pending maintenance — tenant
        const maint = maintRes?.data?.maintenance_requests || maintRes?.data || []
        maint.filter(m => m.status === 'PENDING').forEach(m => {
          items.push({ id: `maint-${m.id}`, type: 'maintenance', audience: 'tenant', text: `Maintenance: ${m.title || m.description || 'New request'}`, link: '/dashboard/maintenance', time: m.created_at })
        })
        // recent notices — tenant
        const notices = noticeRes?.data?.notices || noticeRes?.data || []
        notices.slice(0, 3).forEach(n => {
          items.push({ id: `notice-${n.id}`, type: 'notice', audience: 'tenant', text: `Notice: ${n.title}`, link: '/dashboard/notices', time: n.created_at })
        })
        setNotifications(items.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0)).slice(0, 10))
      } catch (e) { /* silent */ }
    }
    fetchNotifs()
  }, [isTenantRegistered])

  // Filter notifications by audience (tenant vs guest)
  const filteredNotifications = notifFilter === 'all'
    ? notifications
    : notifications.filter(n => n.audience === notifFilter)

  // Unread count = notifications not yet marked read
  const unreadCount = notifications.filter(n => !readNotifs.includes(n.id)).length

  // Counts per audience for the tabs
  const tenantCount = notifications.filter(n => n.audience === 'tenant').length
  const guestCount = notifications.filter(n => n.audience === 'guest').length

  // Close notifications on click outside
  useEffect(() => {
    if (!notifOpen) return
    const handler = (e) => {
      if (!e.target.closest('.notif-wrapper')) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [notifOpen])

// Close mobile sidebar on nav
  const handleNav = (to) => {
    setMobileSidebarOpen(false)
    setNotifOpen(false)
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* ── Mobile overlay ── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar (desktop) ── */}
      <aside className={`
        hidden lg:flex flex-col bg-slate-900 transition-all duration-300 shrink-0
        ${sidebarOpen ? 'w-64' : 'w-[72px]'}
      `}>
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
                onClick={() => handleNav(link.to)}
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

      {/* ── Mobile sidebar drawer ── */}
      <aside className={`
        lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col transition-transform duration-300
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <Link to="/dashboard" className="flex items-center gap-2.5" onClick={() => handleNav('/dashboard')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-300 flex items-center justify-center shrink-0 shadow-lg">
              <i className="bi bi-house-door-fill text-white text-sm"></i>
            </div>
            <span className="font-black text-white text-lg">Smart<span className="text-teal-400">Rent</span></span>
          </Link>
          <button onClick={() => setMobileSidebarOpen(false)} className="text-slate-400 hover:text-white transition-colors">
            <i className="bi bi-x-lg text-sm"></i>
          </button>
        </div>
        <div className="mx-3 mt-4 p-3 bg-slate-800 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-300 flex items-center justify-center font-bold text-white text-sm shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{displayName}</p>
            <p className="text-slate-400 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-2">Menu</p>
          {navLinks.map((link) => {
            const active = isActive(link)
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => handleNav(link.to)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group
                  ${active
                    ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-900/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <i className={`bi ${link.icon} text-base shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}></i>
                <span className="text-sm font-medium truncate">{link.label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-300"></div>}
              </Link>
            )
          })}
        </nav>
        <div className="px-3 pb-4 border-t border-slate-800 pt-3">
          <button onClick={Logout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
            <i className="bi bi-box-arrow-right text-base shrink-0"></i>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
<header className="shrink-0 shadow-sm">
          <div className="h-16 bg-white border-b border-gray-100 px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile hamburger */}
              <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors shrink-0">
                <i className="bi bi-list text-lg"></i>
              </button>
              <h1 className="text-lg font-bold text-gray-900 truncate">
                {navLinks.find(l => isActive(l))?.label || 'Dashboard'}
              </h1>
            </div>
<div className="flex items-center gap-3 shrink-0">
            <div className="notif-wrapper relative">
<button onClick={() => setNotifOpen(!notifOpen)} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors relative">
                <i className="bi bi-bell text-base"></i>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
              {/* Notification dropdown */}
              {notifOpen && (
                <div className="fixed sm:absolute top-16 sm:top-full right-0 sm:right-0 left-0 sm:left-auto sm:w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 animate-fade-up max-h-[80vh] flex flex-col">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                    <p className="text-sm font-bold text-gray-900">Notifications</p>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Audience filter tabs: All / Tenants / Guests */}
                  <div className="flex gap-1 px-3 py-2 border-b border-gray-100 shrink-0">
                    {[
                      { key: 'all', label: 'All', count: notifications.length },
                      { key: 'tenant', label: 'Tenants', count: tenantCount },
                      { key: 'guest', label: 'Guests', count: guestCount },
                    ].map(t => (
                      <button
                        key={t.key}
                        onClick={() => setNotifFilter(t.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          notifFilter === t.key
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {t.label}
                        <span className={`text-[10px] px-1.5 rounded-full ${notifFilter === t.key ? 'bg-white/20' : 'bg-gray-200'}`}>{t.count}</span>
                      </button>
                    ))}
                  </div>

                  <div className="overflow-y-auto flex-1">
                    {filteredNotifications.length === 0 ? (
                      <div className="text-center py-10 text-gray-400">
                        <i className="bi bi-bell-slash text-3xl block mb-2 opacity-40"></i>
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {filteredNotifications.map(n => {
                          const isRead = readNotifs.includes(n.id)
                          return (
                            <div
                              key={n.id}
                              className={`flex items-start gap-3 px-4 py-3 transition-colors ${isRead ? 'opacity-50' : 'hover:bg-teal-50'}`}
                            >
                              <Link to={n.link} onClick={() => setNotifOpen(false)} className="flex items-start gap-3 min-w-0 flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                                  n.type === 'request' ? 'bg-violet-100 text-violet-700' :
                                  n.type === 'maintenance' ? 'bg-orange-100 text-orange-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  <i className={`bi ${
                                    n.type === 'request' ? 'bi-envelope' :
                                    n.type === 'maintenance' ? 'bi-tools' :
                                    'bi-megaphone'
                                  } text-sm`}></i>
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase ${
                                      n.audience === 'tenant' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
                                    }`}>
                                      {n.audience === 'tenant' ? 'Tenant' : 'Guest'}
                                    </span>
                                    {!isRead && <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>}
                                  </div>
                                  <p className="text-sm text-gray-700 leading-snug mt-1">{n.text}</p>
                                  {n.time && <p className="text-xs text-gray-400 mt-0.5">{new Date(n.time).toLocaleDateString()}</p>}
                                </div>
                              </Link>
                              {/* Clear button — only shows if unread (red dot) */}
                              {!isRead && (
                                <button
                                  title="Mark as read"
                                  onClick={() => markRead(n.id)}
                                  className="shrink-0 w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                                >
                                  <i className="bi bi-check-lg text-sm"></i>
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <Link
                    to="/dashboard/notices"
                    onClick={() => setNotifOpen(false)}
                    className="block text-center text-sm font-semibold text-teal-600 hover:text-teal-700 px-4 py-3 border-t border-gray-100 shrink-0"
                  >
                    View all notifications
                  </Link>
                </div>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-gray-100">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800 leading-none">{displayName}</p>
                <p className="text-xs text-gray-400 capitalize mt-0.5">{user?.role}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center font-bold text-white text-sm shadow">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>
{/* Mobile avatar only */}
            <div className="sm:hidden w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center font-bold text-white text-sm shadow">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
          </div>

          {/* ── Horizontal Navigation Bar (top nav) ── */}
          <nav className="hidden md:flex bg-white border-b border-gray-100 px-4 sm:px-6 gap-1 overflow-x-auto">
            {navLinks.map(link => {
              const active = isActive(link)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => handleNav(link.to)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors shrink-0
                    ${active
                      ? 'border-teal-500 text-teal-700 bg-teal-50/50'
                      : 'border-transparent text-gray-500 hover:text-teal-600 hover:border-gray-200'
                    }`}
                >
                  <i className={`bi ${link.icon} text-sm ${active ? 'text-teal-600' : 'text-gray-400'}`}></i>
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </header>

{/* Content */}
        <main className="flex-1 overflow-y-auto">
          {isOverview ? (
            <div className="p-4 sm:p-6 space-y-6 animate-fade-up">
              {/* Welcome */}
              <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-5 sm:p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl"></div>
                <div className="relative">
                  <p className="text-teal-300 text-sm font-medium mb-1">
                    {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                  <h2 className="text-xl sm:text-2xl font-black text-white mb-1">Welcome back, {displayName.split(' ')[0]}! 👋</h2>
                  <p className="text-slate-400 text-sm">Here's what's happening with your {user?.role === 'landlord' ? 'properties' : 'rental'} today.</p>
                </div>
              </div>

              {/* ── Unregistered tenant banner ── */}
              {user?.role === 'tenant' && !isTenantRegistered && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <i className="bi bi-hourglass-split text-amber-600 text-lg"></i>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-amber-900">Pending landlord registration</p>
                    <p className="text-sm text-amber-700 mt-0.5">
                      Your account is not yet linked to a house. Once a landlord registers you and assigns a
                      property, you'll get access to payments, maintenance, and notices. You can keep browsing
                      and applying for properties in the meantime.
                    </p>
                    <Link to="/houses" className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-amber-800 hover:text-amber-900">
                      Browse properties <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              )}

              {/* Stats */}
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-28"></div>
                  ))}
                </div>
              ) : user?.role === 'landlord' && summary ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {LANDLORD_STATS.map(s => (
                    <div key={s.key} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 stat-card">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-md`}>
                        <i className={`bi ${s.icon} text-white text-base`}></i>
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-gray-900 break-words">
                        {s.fmt ? `KSh ${Number(summary[s.key]).toLocaleString()}` : summary[s.key]}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 font-medium">{s.label}</p>
                      <p className="text-xs text-gray-300 mt-0.5">{s.sub(summary)}</p>
                    </div>
                  ))}
                </div>
              ) : user?.role === 'admin' ? (
                <AdminOverviewPage />
              ) : user?.role === 'tenant' && summary ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 stat-card">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center mb-3 shadow-md">
                      <i className="bi bi-envelope-fill text-white text-base"></i>
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-gray-900">{summary.total_applications}</p>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">Applications</p>
                    <p className="text-xs text-gray-300 mt-0.5">{summary.pending_applications} pending · {summary.approved_applications} approved</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 stat-card">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center mb-3 shadow-md">
                      <i className="bi bi-house-fill text-white text-base"></i>
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-gray-900 break-words">{summary.has_lease ? (summary.property_title || 'Active').substring(0, 10) : 'None'}</p>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">Current Lease</p>
                    <p className="text-xs text-gray-300 mt-0.5">{summary.has_lease ? `KSh ${Number(summary.monthly_rent).toLocaleString()}/mo` : 'No active lease'}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 stat-card">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center mb-3 shadow-md">
                      <i className="bi bi-cash-stack text-white text-base"></i>
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-gray-900 break-words">KSh {Number(summary.total_paid).toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">Total Paid</p>
                    <p className="text-xs text-gray-300 mt-0.5">{summary.pending_payment ? `KSh ${Number(summary.pending_payment).toLocaleString()} pending` : 'All settled'}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 stat-card">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-400 flex items-center justify-center mb-3 shadow-md">
                      <i className="bi bi-tools text-white text-base"></i>
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-gray-900">{summary.open_maintenance}</p>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">Open Maintenance</p>
                    <p className="text-xs text-gray-300 mt-0.5">{summary.total_maintenance} total requests</p>
                  </div>
                </div>
              ) : user?.role === 'tenant' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: 'bi-house-fill', label: 'My Property', desc: 'View your lease & property details', to: '/dashboard/my-property', color: 'from-teal-500 to-cyan-400' },
                    { icon: 'bi-cash-stack', label: 'My Payments', desc: 'Track rent payments & balance', to: '/dashboard/tenant-payments', color: 'from-amber-500 to-yellow-400' },
                    { icon: 'bi-tools', label: 'Maintenance', desc: 'Submit & track repair requests', to: '/dashboard/maintenance', color: 'from-orange-500 to-red-400' },
                  ].map(c => (
                    <Link key={c.label} to={c.to} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 stat-card flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-md shrink-0`}>
                        <i className={`bi ${c.icon} text-white text-lg`}></i>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900">{c.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{c.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}

              {/* ── Landlord: Occupancy + Portfolio ── */}
              {user?.role === 'landlord' && summary && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Occupancy bar */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 stat-card">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <i className="bi bi-pie-chart-fill text-teal-500"></i> Portfolio Occupancy
                      </p>
                      <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full whitespace-nowrap">
                        {summary.total_properties ? Math.round(summary.occupied_properties / summary.total_properties * 100) : 0}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-1000"
                        style={{ width: `${summary.total_properties ? Math.round(summary.occupied_properties / summary.total_properties * 100) : 0}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-3 text-center gap-2">
                      <div>
                        <p className="text-xl font-black text-gray-900">{summary.total_properties}</p>
                        <p className="text-[11px] text-gray-400">Total Units</p>
                      </div>
                      <div>
                        <p className="text-xl font-black text-teal-600">{summary.occupied_properties}</p>
                        <p className="text-[11px] text-gray-400">Occupied</p>
                      </div>
                      <div>
                        <p className="text-xl font-black text-amber-500">{summary.available_properties}</p>
                        <p className="text-[11px] text-gray-400">Available</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent requests */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 stat-card">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <i className="bi bi-envelope-fill text-violet-500"></i> Recent Rental Requests
                      </p>
                      <Link to="/dashboard/requests" className="text-xs font-semibold text-teal-600 hover:text-teal-700 whitespace-nowrap">View all →</Link>
                    </div>
                    {recentRequests.length === 0 ? (
                      <p className="text-sm text-gray-400 py-6 text-center">No requests yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {recentRequests.map(r => (
                          <div key={r.id} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold shrink-0">
                              {(r.tenant_name || r.lead_name || '?')[0].toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 truncate">{r.tenant_name || r.lead_name || '—'}</p>
                              <p className="text-xs text-gray-400 truncate">{r.property_title || ''}</p>
                            </div>
                            <Badge status={r.status} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Landlord: Recent Payments ── */}
              {user?.role === 'landlord' && recentPayments.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 stat-card">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <i className="bi bi-cash-stack text-green-500"></i> Recent Payments
                    </p>
                    <Link to="/dashboard/payments" className="text-xs font-semibold text-teal-600 hover:text-teal-700 whitespace-nowrap">View all →</Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {recentPayments.map(p => (
                      <div key={p.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <p className="text-sm font-bold text-gray-900">KSh {Number(p.amount).toLocaleString()}</p>
                        <p className="text-xs text-gray-400 truncate">{p.tenant_name || '—'}</p>
                        <div className="mt-1.5"><Badge status={p.status} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick links */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-sm font-bold text-gray-700 mb-4">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {navLinks.filter(l => !l.exact).slice(0, 5).map(l => (
                    <Link key={l.to} to={l.to} className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 text-gray-600 rounded-xl text-sm font-medium transition-colors border border-gray-100 whitespace-nowrap">
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
