import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { trackRequestStatus } from '../../services/houseHuntingService'
import { LoadingSpinner } from '../../components/ui'

const STATUS_STYLES = {
  PENDING: { badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', label: 'Pending' },
  APPROVED: { badge: 'bg-green-100 text-green-700', dot: 'bg-green-500', label: 'Approved' },
  REJECTED: { badge: 'bg-red-100 text-red-700', dot: 'bg-red-500', label: 'Rejected' },
}

export default function TrackRequestPage() {
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState(null) // null = not searched yet
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setRequests(null)
    if (!phone.trim() && !email.trim()) {
      setError('Please enter your phone number or email to look up your request.')
      return
    }
    setLoading(true)
    try {
      const data = await trackRequestStatus({ phone: phone.trim(), email: email.trim() })
      setRequests(data.requests || [])
      if (data.message) setMessage(data.message)
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to look up your request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center shadow">
              <i className="bi bi-house-door-fill text-white text-sm"></i>
            </div>
            <span className="text-lg font-black text-gray-900">Smart<span className="text-teal-600">Rent</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/houses" className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors flex items-center gap-1">
              <i className="bi bi-arrow-left"></i> Browse
            </Link>
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-white rounded-xl btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 py-14 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            Track Your <span className="gradient-text">Request</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Submitted a rental inquiry without an account? Enter the phone number or email you used to see the current status of your request.
          </p>
        </div>
      </section>

      {/* ── Lookup Form ── */}
      <section className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 0712345678"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-teal-400"
              />
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-300 text-xs font-semibold uppercase">
              <span className="flex-1 h-px bg-gray-200"></span> or <span className="flex-1 h-px bg-gray-200"></span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. you@example.com"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-teal-400"
              />
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                <i className="bi bi-exclamation-circle-fill text-red-500 mt-0.5 shrink-0"></i>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-sm disabled:opacity-60">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Looking up...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <i className="bi bi-search"></i> Check Request Status
                </span>
              )}
            </button>
          </form>
        </div>

        {/* ── Results ── */}
        {loading && (
          <div className="mt-8"><LoadingSpinner /></div>
        )}

        {!loading && requests && requests.length === 0 && (
          <div className="mt-8 bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <i className="bi bi-inbox text-3xl text-gray-400"></i>
            </div>
            <p className="text-gray-700 font-semibold">{message || 'No requests found.'}</p>
            <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
              Double-check the phone number or email you entered. If you used a different contact when submitting, try that instead.
            </p>
            <Link to="/houses" className="btn-primary inline-block mt-6 px-6 py-2.5 text-sm">
              Browse Properties <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        )}

        {!loading && requests && requests.length > 0 && (
          <div className="mt-8 space-y-4">
            <p className="text-sm text-gray-500">
              Found <span className="font-bold text-gray-900">{requests.length}</span> request{requests.length !== 1 ? 's' : ''} for the contact you provided.
            </p>
            {requests.map(r => {
              const st = STATUS_STYLES[r.status] || { badge: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400', label: r.status_display || r.status }
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${st.dot} shrink-0`}></span>
                        <h3 className="font-bold text-gray-900 text-lg truncate">{r.property_title || 'Property'}</h3>
                      </div>
                      <p className="text-sm text-gray-400 flex items-center gap-1 mb-3">
                        <i className="bi bi-geo-alt text-teal-500"></i>
                        {r.property_location || 'Location not specified'}
                      </p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${st.badge}`}>
                        <i className="bi bi-shield-check mr-1"></i>{st.label}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Submitted</p>
                      <p className="text-gray-700 font-medium">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : '—'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Landlord</p>
                      <p className="text-gray-700 font-medium">{r.landlord_name || '—'}</p>
                    </div>
                  </div>

                  {r.message && (
                    <div className="mt-3 bg-teal-50 border border-teal-100 rounded-xl p-3">
                      <p className="text-[11px] font-semibold text-teal-700 uppercase tracking-wide mb-1">Your message</p>
                      <p className="text-sm text-gray-600 italic">"{r.message}"</p>
                    </div>
                  )}
                  {r.landlord_notes && (
                    <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
                      <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide mb-1">Landlord's note</p>
                      <p className="text-sm text-gray-700">{r.landlord_notes}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100 py-8 px-6 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>© 2025 SmartRent. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/houses" className="hover:text-teal-600 transition-colors">Browse Properties</Link>
            <Link to="/houses/register" className="hover:text-teal-600 transition-colors">Create Account</Link>
            <Link to="/login" className="hover:text-teal-600 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
