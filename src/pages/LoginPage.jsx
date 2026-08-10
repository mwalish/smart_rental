import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../AuthContext'
import api from '../services/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setToken, setUser, setProfile } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')

    const formData = new FormData(e.target)
    const credentials = { email: formData.get('email'), password: formData.get('password') }

    try {
      const res = await api.post('core/login/', credentials)
      const { access, refresh, user, profile } = res.data
      setToken(access)
      setUser(user)
      if (profile) setProfile(profile)
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      localStorage.setItem('user', JSON.stringify(user))
      if (profile) localStorage.setItem('profile', JSON.stringify(profile))
      // tenants now land on the full dashboard portal (same as landlord/admin)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Login failed. Check your email and password.')
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
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">Welcome<br />Back!</h2>
          <p className="text-slate-300 text-lg max-w-xs mx-auto leading-relaxed">Your rental management dashboard is just one sign-in away.</p>

          <div className="mt-12 grid grid-cols-2 gap-4 max-w-sm mx-auto">
            {[
              { icon: 'bi-building', label: 'Properties', val: '500+' },
              { icon: 'bi-people-fill', label: 'Tenants', val: '1,200+' },
              { icon: 'bi-cash-stack', label: 'Processed', val: 'KSh 50M+' },
              { icon: 'bi-star-fill', label: 'Satisfaction', val: '98%' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
                <i className={`bi ${s.icon} text-teal-400 text-xl mb-1 block`}></i>
                <p className="text-white font-bold text-lg">{s.val}</p>
                <p className="text-slate-400 text-xs">{s.label}</p>
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
            <h1 className="text-3xl font-black text-gray-900">Sign In</h1>
            <p className="text-gray-500 mt-1">Enter your credentials to access your dashboard</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            {error && (
              <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                <i className="bi bi-exclamation-circle-fill text-red-500 mt-0.5 flex-shrink-0"></i>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@example.com"
                    className="input-field w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="••••••••"
                    className="input-field w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
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

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-teal-600 accent-teal-600" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm font-semibold text-teal-600 hover:text-teal-700">Forgot password?</Link>
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
                    Signing In...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              New here?{' '}
              <Link to="/houses/register" className="font-semibold text-teal-600 hover:text-teal-700">
                Create a free tenant account
              </Link>
            </p>

            <p className="text-center text-sm text-gray-500 mt-3">
              Account access is provided by your landlord or system admin.
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
