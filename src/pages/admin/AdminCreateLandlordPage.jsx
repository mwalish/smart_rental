import React, { useState } from 'react'
import api from '../../services/api'
import { PageHeader, FormField, Input, ModalActions } from '../../components/ui'

const EMPTY = { email: '', username: '', phone_number: '', password: '', password_confirm: '', full_name: '', id_number: '', mpesa_number: '', address: '', business_name: '', license_number: '' }

export default function AdminCreateLandlordPage() {
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true); setError(''); setSuccess('')
    try {
      await api.post('core/admin/create-landlord/', { ...form, role: 'landlord' })
      setSuccess('Landlord account created successfully.')
      setForm(EMPTY)
    } catch (err) {
      const d = err.response?.data
      setError(d?.error ? (typeof d.error === 'string' ? d.error : JSON.stringify(d.error)) : 'Failed to create landlord.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 animate-fade-up max-w-2xl">
      <PageHeader title="Create Landlord" subtitle="Register a new landlord account" />

      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account Credentials</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Email"><Input type="email" value={form.email} onChange={set('email')} required placeholder="landlord@email.com" /></FormField>
            <FormField label="Username"><Input value={form.username} onChange={set('username')} required placeholder="username" /></FormField>
            <FormField label="Phone Number"><Input value={form.phone_number} onChange={set('phone_number')} required placeholder="0712345678" /></FormField>
            <FormField label="Password"><Input type="password" value={form.password} onChange={set('password')} required placeholder="Min 6 characters" /></FormField>
            <FormField label="Confirm Password"><Input type="password" value={form.password_confirm} onChange={set('password_confirm')} required placeholder="Repeat password" /></FormField>
          </div>

          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-4 mb-2">Landlord Profile</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Full Name"><Input value={form.full_name} onChange={set('full_name')} placeholder="Full legal name" /></FormField>
            <FormField label="ID Number"><Input value={form.id_number} onChange={set('id_number')} placeholder="National ID" /></FormField>
            <FormField label="M-Pesa Number"><Input value={form.mpesa_number} onChange={set('mpesa_number')} placeholder="0712345678" /></FormField>
            <FormField label="Business Name"><Input value={form.business_name} onChange={set('business_name')} placeholder="Optional" /></FormField>
            <FormField label="Address"><Input value={form.address} onChange={set('address')} placeholder="Physical address" /></FormField>
            <FormField label="License Number"><Input value={form.license_number} onChange={set('license_number')} placeholder="Optional" /></FormField>
          </div>

          <ModalActions onCancel={() => setForm(EMPTY)} submitLabel="Create Landlord" submitting={submitting} />
        </form>
      </div>
    </div>
  )
}
