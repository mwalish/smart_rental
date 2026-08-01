import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { FormField, ModalActions } from '../../components/ui'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.target)
    const payload = {
      full_name: formData.get('full_name'),
      email: formData.get('email'),
      phone_number: formData.get('phone'),
      id_number: formData.get('id_number'),
      role: 'tenant',
      password: formData.get('password'),
      password_confirm: formData.get('password_confirm'),
    }

    try {
      // Public tenant self-registration — reuses existing backend endpoint
      await api.post('core/house-hunting/register/', payload)
      // On success, take them to login to complete the committed-user flow
      navigate('/login', { state: { registered: true, email: payload.email } })
    } catch (err) {
      const d = err.response?.data
      const extract = (obj) => {
        if (!obj) return 'Registration failed. Please try again.'
        if (typeof obj === 'string') return obj
        if (obj.error) return typeof obj.error === 'string' ? obj.error : extract(obj.error)
        const first = Object.values(obj)[0]
        if (Array.isArray(first)) return first[0]
        if (typeof first === 'string') return first
        return extract(first)
      }
      setError(extract(d))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-cyan-400/15 rounded-full blur-3xl"></div>
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-300 flex items-center justify-center shadow-xl">
              <i className="bi bi-house-door-fill text-white text-xl"></i>
            </div>
            <span className="text-3xl font-black text-white">Smart<span className="text-teal-400">Rent</span></span>
          </div>
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">Find Your<br />Next Home</h2>
          <p className="text-slate-300 text-lg max-w-xs mx-auto leading-relaxed">
            Browse houses for free. Create an account and log in to see full property details and contact landlords directly.
          </p>
          <div className="mt-10 space-y-3 max-w-xs mx-auto text-left">
            {[
              'Browse available houses for free',
              'Create your tenant account',
              'Log in to view landlord contact',
              'Apply & message landlords directly',
            ].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-500/30 flex items-center justify-center shrink-0">
                  <i className="bi bi-check text-teal-400 text-xs font-bold"></i>
                </div>
                <span className="text-slate-300 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center">
                <i className="bi bi-house-door-fill text-white"></i>
              </div>
              <span className="text-2xl font-black">Smart<span className="text-teal-600">Rent</span></span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900">Create Account</h1>
            <p className="text-gray-500 mt-1">Join as a tenant to browse & apply for houses</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            {error && (
              <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                <i className="bi bi-exclamation-circle-fill text-red-500 mt-0.5 flex-shrink-0"></i>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    name="full_name"
                    required
                    placeholder="John Doe"
                    className="input-field w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@example.com"
                    className="input-field w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="bi bi-telephone"></i>
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="0712345678"
                    className="input-field w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ID Number *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="bi bi-credit-card-2-front"></i>
                  </span>
                  <input
                    type="text"
                    name="id_number"
                    required
                    placeholder="e.g. 12345678"
                    className="input-field w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="Min 8 characters"
                    className="input-field w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="bi bi-lock-fill"></i>
                  </span>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="password_confirm"
                    required
                    placeholder="Re-enter password"
                    className="input-field w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                  >
                    <i className={`bi ${showConfirm ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-base mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <i className="bi bi-person-plus-fill"></i> Create Account
                  </span>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">Sign In</Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            <Link to="/" className="hover:text-teal-600 transition-colors">← Back to homepage</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

