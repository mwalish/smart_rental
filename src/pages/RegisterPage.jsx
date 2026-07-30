import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [role, setRole] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phoneInput, setPhoneInput] = useState('')

  const passwordsMatch = password && confirmPassword ? password === confirmPassword : null

  const passwordChecks = useMemo(() => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }), [password])

  const passwordStrength = useMemo(() => {
    if (!password) return { pct: 0, label: '', color: '' }
    const score = Object.values(passwordChecks).filter(Boolean).length
    if (score <= 2) return { pct: 40, label: 'Weak', color: 'bg-red-500' }
    if (score <= 4) return { pct: 80, label: 'Medium', color: 'bg-amber-500' }
    return { pct: 100, label: 'Strong', color: 'bg-green-500' }
  }, [passwordChecks, password])

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.startsWith('0')) {
      if (val.length > 4) val = val.slice(0,4) + ' ' + val.slice(4)
      if (val.length > 8) val = val.slice(0,8) + ' ' + val.slice(8)
    }
    setPhoneInput(val.slice(0, 12))
  }

  const normalizePhone = (num) => {
    if (!num) return num
    const cleaned = num.replace(/\D/g, '')
    if (cleaned.startsWith('0')) return `254${cleaned.slice(1)}`
    if (cleaned.startsWith('+')) return cleaned.slice(1)
    if (cleaned.length === 9) return `254${cleaned}`
    return cleaned
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    const fd = new FormData(e.target)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    const data = {
      username: fd.get('name'),
      name: fd.get('name'),
      email: fd.get('email'),
      phone_number: normalizePhone(phoneInput),
      role: fd.get('role'),
      password,
      password_confirm: confirmPassword
    }

    try {
      await api.post('core/register/', data)
      setSuccess('Account created! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const d = err.response?.data
      if (d) {
        if (d.error) {
          setError(
            typeof d.error === 'object'
              ? Object.entries(d.error).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' · ')
              : d.error
          )
        } else {
          setError(Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' · '))
        }
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally { setLoading(false) }
  }

  const ROLES = [
    { val: 'landlord', label: 'Landlord', icon: 'bi-building-fill', desc: 'Manage properties & tenants' },
    { val: 'tenant', label: 'Tenant', icon: 'bi-house-fill', desc: 'View lease, pay rent & more' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-cyan-400/15 rounded-full blur-3xl"></div>
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-300 flex items-center justify-center shadow-xl">
              <i className="bi bi-house-door-fill text-white text-xl"></i>
            </div>
            {/* ✅ Fixed: added closing </span> */}
            <span className="text-3xl font-black text-white">Smart<span className="text-teal-400">Rent</span></span>
          </div>
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">Join<br />SmartRent</h2>
          <p className="text-slate-300 text-lg max-w-xs mx-auto leading-relaxed">
            Kenya's smartest rental management platform. Free to get started.
          </p>
          <div className="mt-10 space-y-3 max-w-xs mx-auto">
            {[
              'Manage properties & tenants',
              'Track M-Pesa payments',
              'Handle maintenance requests',
              'Send notices to tenants',
            ].map(f => (
              <div key={f} className="flex items-center gap-3 text-left">
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
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md py-8 animate-fade-up">

          {/* Mobile logo — ✅ Fixed Link + span closing */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center">
                <i className="bi bi-house-door-fill text-white"></i>
              </div>
              <span className="text-2xl font-black">Smart<span className="text-teal-600">Rent</span></span>
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-black text-gray-900">Create Account</h1>
            <p className="text-gray-500 mt-1">Fill in your details to get started</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
              <i className="bi bi-exclamation-circle-fill text-red-500 mt-0.5 shrink-0"></i>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl">
              <i className="bi bi-check-circle-fill text-green-500 mt-0.5 shrink-0"></i>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-7">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Role selector */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map(r => (
                    <label
                      key={r.val}
                      className={`relative flex flex-col gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all ${role === r.val ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <input type="radio" name="role" value={r.val} required className="sr-only" onChange={() => setRole(r.val)} />
                      <i className={`bi ${r.icon} text-xl ${role === r.val ? 'text-teal-600' : 'text-gray-400'}`}></i>
                      <span className={`text-sm font-bold ${role === r.val ? 'text-teal-700' : 'text-gray-700'}`}>{r.label}</span>
                      <span className="text-xs text-gray-400 leading-tight">{r.desc}</span>
                      {role === r.val && (
                        <i className="bi bi-check-circle-fill text-teal-500 absolute top-2 right-2 text-sm"></i>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><i className="bi bi-person"></i></span>
                  <input type="text" name="name" required placeholder="Your full name"
                    className="input-field w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><i className="bi bi-envelope"></i></span>
                  <input type="email" name="email" required placeholder="you@example.com"
                    className="input-field w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white" />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><i className="bi bi-telephone"></i></span>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={phoneInput}
                    onChange={handlePhoneChange}
                    placeholder="07XX XXX XXX"
                    className="input-field w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Passwords — ✅ All divs properly closed */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      name="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 chars"
                      className="input-field w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600">
                      <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'} text-sm`}></i>
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2 space-y-1.5">
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${passwordStrength.color} transition-all duration-300`} style={{ width: `${passwordStrength.pct}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Strength: <span className={`font-medium ${passwordStrength.label === 'Weak' ? 'text-red-600' : passwordStrength.label === 'Medium' ? 'text-amber-600' : 'text-green-600'}`}>{passwordStrength.label}</span>
                      </p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {[
                          { key: 'length', label: 'Min 8 characters' },
                          { key: 'upper', label: 'Uppercase letter' },
                          { key: 'lower', label: 'Lowercase letter' },
                          { key: 'number', label: 'Number' },
                          { key: 'special', label: 'Special character' },
                        ].map(item => (
                          <div key={item.key} className={`flex items-center gap-1 ${passwordChecks[item.key] ? 'text-green-600' : 'text-gray-400'}`}>
                            <i className={`bi ${passwordChecks[item.key] ? 'bi-check-circle-fill' : 'bi-circle'} text-xs`}></i>
                            {item.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirm</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      name="password2"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat"
                      className={`input-field w-full pl-4 pr-10 py-3 border rounded-xl text-sm bg-gray-50 focus:bg-white ${
                        passwordsMatch === true ? 'border-green-400' : passwordsMatch === false ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />
                    <div className="absolute right-9 top-1/2 -translate-y-1/2">
                      {passwordsMatch === true && <i className="bi bi-check-circle-fill text-green-500 text-sm"></i>}
                      {passwordsMatch === false && <i className="bi bi-x-circle-fill text-red-500 text-sm"></i>}
                    </div>
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600">
                      <i className={`bi ${showConfirm ? 'bi-eye-slash' : 'bi-eye'} text-sm`}></i>
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-sm mt-1 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Creating Account...
                  </span>
                ) : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">Sign in</Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            <Link to="/" className="hover:text-teal-600 transition-colors">← Back to homepage</Link>
          </p>
        </div>
      </div>
    </div>
  )
}