import React, { useState } from 'react'
import api from '../../services/api'
import { PageHeader, FormField, Input, ModalActions } from '../../components/ui'

const EMPTY = { full_name: '', email: '', phone_number: '', phone: '', id_number: '', username: '', password: '', password_confirm: '', alternative_phone: '' }

export default function RegisterTenantPage() {
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [showPwd, setShowPwd] = useState(false)

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null); setSuccess(null)
    if (form.password !== form.password_confirm) { setError('Passwords do not match.'); return }
    setSubmitting(true)
    try {
      const payload = { ...form, phone: form.phone || form.phone_number, phone_number: form.phone_number || form.phone, email_address: form.email, username: form.username || form.email.split('@')[0] }
      const res = await api.post('core/landlord/create-tenant/', payload)
      setSuccess(`Tenant "${res.data.tenant?.full_name}" registered! They can now log in with their email and password.`)
      setForm(EMPTY)
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        setError(Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' · '))
      } else { setError('Failed to register tenant.') }
    } finally { setSubmitting(false) }
  }

  return (
    <div className="p-6 max-w-2xl animate-fade-up">
      <PageHeader title="Register New Tenant" subtitle="Create a tenant account on their behalf" />

      {success && (
        <div className="mb-5 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
          <i className="bi bi-check-circle-fill text-green-500 mt-0.5 shrink-0"></i>
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}
      {error && (
        <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <i className="bi bi-exclamation-circle-fill text-red-500 mt-0.5 shrink-0"></i>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Personal Info */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Personal Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Full Name"><Input value={form.full_name} onChange={set('full_name')} required placeholder="Jane Doe" /></FormField>
              <FormField label="ID Number"><Input value={form.id_number} onChange={set('id_number')} required placeholder="12345678" /></FormField>
              <FormField label="Email Address">
                <Input type="email" value={form.email} onChange={set('email')} required placeholder="tenant@email.com" className="sm:col-span-2" />
              </FormField>
              <FormField label="Phone Number">
                <Input value={form.phone_number} onChange={e => setForm(p => ({ ...p, phone_number: e.target.value, phone: e.target.value }))} required placeholder="0712345678" />
              </FormField>
              <FormField label="Alternative Phone (optional)"><Input value={form.alternative_phone} onChange={set('alternative_phone')} placeholder="Optional" /></FormField>
            </div>
          </div>

          {/* Account Info */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Account Credentials</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Username (optional)">
                <Input value={form.username} onChange={set('username')} placeholder="Defaults to email prefix" />
              </FormField>
              <div></div>
              <FormField label="Password">
                <div className="relative">
                  <Input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')} required placeholder="Min 8 characters" />
                  <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600">
                    <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'} text-sm`}></i>
                  </button>
                </div>
              </FormField>
              <FormField label="Confirm Password">
                <Input type={showPwd ? 'text' : 'password'} value={form.password_confirm} onChange={set('password_confirm')} required placeholder="Repeat password" />
              </FormField>
            </div>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
              <i className="bi bi-info-circle text-teal-500"></i>
              Password must be at least 8 characters and not entirely numeric (e.g. Tenant@2024)
            </p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-sm">
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Registering...
                </span>
              ) : <><i className="bi bi-person-plus-fill mr-2"></i>Register Tenant</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
