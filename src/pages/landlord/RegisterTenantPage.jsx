import React, { useState } from 'react'
import api from '../../services/api'

const EMPTY_FORM = {
  full_name: '',
  email: '',
  phone_number: '',
  phone: '',
  id_number: '',
  username: '',
  password: '',
  password_confirm: '',
  alternative_phone: '',
}

export default function RegisterTenantPage() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (form.password !== form.password_confirm) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        ...form,
        // phone and phone_number should both be set
        phone: form.phone || form.phone_number,
        phone_number: form.phone_number || form.phone,
        email_address: form.email,
        username: form.username || form.email.split('@')[0],
      }
      const res = await api.post('core/landlord/create-tenant/', payload)
      setSuccess(`Tenant "${res.data.tenant?.full_name}" registered successfully! They can now log in with their email and password.`)
      setForm(EMPTY_FORM)
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        // Flatten serializer errors
        const msgs = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ')
        setError(msgs)
      } else {
        setError('Failed to register tenant.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Register New Tenant</h2>

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={set('full_name')}
              required
              placeholder="Jane Doe"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
            <input
              type="text"
              value={form.id_number}
              onChange={set('id_number')}
              required
              placeholder="12345678"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            required
            placeholder="tenant@email.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={form.phone_number}
              onChange={(e) => {
                setForm(p => ({ ...p, phone_number: e.target.value, phone: e.target.value }))
              }}
              required
              placeholder="0712345678"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alternative Phone</label>
            <input
              type="text"
              value={form.alternative_phone}
              onChange={set('alternative_phone')}
              placeholder="Optional"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username <span className="text-gray-400 font-normal">(optional — defaults to email prefix)</span>
          </label>
          <input
            type="text"
            value={form.username}
            onChange={set('username')}
            placeholder="janedoe"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                required
                placeholder="Min 8 characters"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600"
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password_confirm}
              onChange={set('password_confirm')}
              required
              placeholder="Repeat password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Password must be at least 8 characters and not entirely numeric.
        </p>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50"
        >
          {submitting ? 'Registering...' : 'Register Tenant'}
        </button>
      </form>
    </div>
  )
}
