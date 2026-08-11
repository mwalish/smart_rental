
import React, { useState } from 'react'
import api from '../../services/api'
import {
  PageHeader,
  FormField,
  Input,
  ModalActions
} from '../../components/ui'


const EMPTY = {
  email: '',
  username: '',
  phone_number: '',
  password: '',
  password_confirm: '',
  full_name: '',
  id_number: '',
  mpesa_number: '',
  address: '',
  business_name: '',
  license_number: ''
}


export default function AdminCreateLandlordPage() {
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')


  const set = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value
    }))
  }


  const handleSubmit = async (e) => {
    e.preventDefault()

    setSubmitting(true)
    setError('')
    setSuccess('')


    // -----------------------------
    // FRONTEND VALIDATION
    // -----------------------------

    if (form.password !== form.password_confirm) {
      setError('Passwords do not match.')
      setSubmitting(false)
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      setSubmitting(false)
      return
    }

    if (!form.full_name.trim()) {
      setError('Full name is required.')
      setSubmitting(false)
      return
    }

    if (!form.id_number.trim()) {
      setError('ID number is required.')
      setSubmitting(false)
      return
    }

    if (!form.mpesa_number.trim()) {
      setError('M-Pesa number is required.')
      setSubmitting(false)
      return
    }

    if (!form.address.trim()) {
      setError('Address is required.')
      setSubmitting(false)
      return
    }

    if (!form.license_number.trim()) {
      setError('License number is required.')
      setSubmitting(false)
      return
    }


    // -----------------------------
    // PAYLOAD
    // -----------------------------

    const payload = {
      email: form.email.trim(),
      username: form.username.trim(),
      phone_number: form.phone_number.trim(),

      password: form.password,
      password_confirm: form.password_confirm,

      full_name: form.full_name.trim(),
      id_number: form.id_number.trim(),
      mpesa_number: form.mpesa_number.trim(),
      address: form.address.trim(),
      business_name: form.business_name.trim(),
      license_number: form.license_number.trim()
    }


    console.log(
      'Creating landlord:',
      JSON.stringify(payload, null, 2)
    )


    try {

      const response = await api.post(
        'core/admin/create-landlord/',
        payload
      )


      console.log(
        'Landlord created successfully:',
        response.data
      )


      setSuccess('Landlord account created successfully.')

      setForm(EMPTY)

    } catch (err) {

      console.error('Create landlord error:', err)

      const data = err?.response?.data

      console.error('Backend response:', data)


      let message = 'Failed to create landlord.'


      if (data) {

        if (data.password_confirm) {
          message = Array.isArray(data.password_confirm)
            ? data.password_confirm.join(', ')
            : data.password_confirm

        } else if (data.password) {
          message = Array.isArray(data.password)
            ? data.password.join(', ')
            : data.password

        } else if (data.email) {
          message = Array.isArray(data.email)
            ? data.email.join(', ')
            : data.email

        } else if (data.username) {
          message = Array.isArray(data.username)
            ? data.username.join(', ')
            : data.username

        } else if (data.phone_number) {
          message = Array.isArray(data.phone_number)
            ? data.phone_number.join(', ')
            : data.phone_number

        } else if (data.full_name) {
          message = Array.isArray(data.full_name)
            ? data.full_name.join(', ')
            : data.full_name

        } else if (data.id_number) {
          message = Array.isArray(data.id_number)
            ? data.id_number.join(', ')
            : data.id_number

        } else if (data.mpesa_number) {
          message = Array.isArray(data.mpesa_number)
            ? data.mpesa_number.join(', ')
            : data.mpesa_number

        } else if (data.address) {
          message = Array.isArray(data.address)
            ? data.address.join(', ')
            : data.address

        } else if (data.business_name) {
          message = Array.isArray(data.business_name)
            ? data.business_name.join(', ')
            : data.business_name

        } else if (data.license_number) {
          message = Array.isArray(data.license_number)
            ? data.license_number.join(', ')
            : data.license_number

        } else if (data.detail) {
          message = data.detail

        } else if (data.message) {
          message = data.message

        } else if (typeof data === 'string') {
          message = data

        } else if (typeof data === 'object') {
          message = Object.entries(data)
            .map(([key, value]) => {
              const formatted = Array.isArray(value)
                ? value.join(', ')
                : String(value)

              return `${key}: ${formatted}`
            })
            .join(' | ')
        }
      }


      setError(message)

    } finally {
      setSubmitting(false)
    }
  }


  return (
    <div className="p-6 animate-fade-up max-w-2xl ">

      <PageHeader
        title="Create Landlord"
        subtitle="Register a new landlord account"
      />


      {/* SUCCESS MESSAGE */}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
          {success}
        </div>
      )}


      {/* ERROR MESSAGE */}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}


      <div className="bg-white rounded-2xl border border-gray-100 p-6 item-center">

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ============================= */}
          {/* ACCOUNT CREDENTIALS */}
          {/* ============================= */}

          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Account Credentials
          </p>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <FormField label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={set('email')}
                required
                placeholder="landlord@email.com"
              />
            </FormField>


            <FormField label="Username">
              <Input
                value={form.username}
                onChange={set('username')}
                required
                placeholder="username"
              />
            </FormField>


            <FormField label="Phone Number">
              <Input
                value={form.phone_number}
                onChange={set('phone_number')}
                required
                placeholder="0712345678"
              />
            </FormField>


            <FormField label="Password">
              <Input
                type="password"
                value={form.password}
                onChange={set('password')}
                required
                minLength={6}
                placeholder="Min 6 characters"
              />
            </FormField>


            <FormField label="Confirm Password">
              <Input
                type="password"
                value={form.password_confirm}
                onChange={set('password_confirm')}
                required
                minLength={6}
                placeholder="Repeat password"
              />
            </FormField>

          </div>


          {/* ============================= */}
          {/* LANDLORD PROFILE */}
          {/* ============================= */}

          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-4 mb-2">
            Landlord Profile
          </p>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <FormField label="Full Name">
              <Input
                value={form.full_name}
                onChange={set('full_name')}
                required
                placeholder="Full legal name"
              />
            </FormField>


            <FormField label="ID Number">
              <Input
                value={form.id_number}
                onChange={set('id_number')}
                required
                placeholder="National ID"
              />
            </FormField>


            <FormField label="M-Pesa Number">
              <Input
                value={form.mpesa_number}
                onChange={set('mpesa_number')}
                required
                placeholder="0712345678"
              />
            </FormField>


            <FormField label="Business Name">
              <Input
                value={form.business_name}
                onChange={set('business_name')}
                placeholder="Optional"
              />
            </FormField>


            <FormField label="Address">
              <Input
                value={form.address}
                onChange={set('address')}
                required
                placeholder="Physical address"
              />
            </FormField>


            <FormField label="License Number">
              <Input
                value={form.license_number}
                onChange={set('license_number')}
                required
                placeholder="License number"
              />
            </FormField>

          </div>


          {/* ============================= */}
          {/* BUTTONS */}
          {/* ============================= */}

          <ModalActions
            onCancel={() => {
              setForm(EMPTY)
              setError('')
              setSuccess('')
            }}
            submitLabel="Create Landlord"
            submitting={submitting}
          />

        </form>

      </div>

    </div>
  )
}