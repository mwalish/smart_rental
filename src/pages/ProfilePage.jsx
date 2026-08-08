import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../AuthContext'
import { getProfile, updateProfile, changePassword } from '../services/authService'
import { toAbsoluteMedia } from '../config'
import { PageHeader } from '../components/ui'

export default function ProfilePage() {
  const { user, profile, setProfile, Logout } = useContext(AuthContext)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'success'|'error', text }
  const [preview, setPreview] = useState(null) // object URL while picking a new file

  // Change-password form state
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMessage, setPwMessage] = useState(null) // { type: 'success'|'error', text }

  const role = user?.role
  const displayName = profile?.full_name || data?.full_name || user?.name || user?.username || 'User'

  const load = async () => {
    setLoading(true)
    try {
      const res = await getProfile()
      setData(res)
    } catch (e) {
      setData({})
      setMessage({ type: 'error', text: 'Could not load your profile.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Current picture source: preview (newly selected) > profile.data > profile(login)
  const currentPic = preview || profile?.profile_picture || (data && data.profile_picture) || ''

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Validate image type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please choose an image file (JPG, PNG, etc).' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image too large — max 5MB.' })
      return
    }
    setMessage(null)
    setPreview(URL.createObjectURL(file))
    // Auto-upload on selection
    uploadFile(file)
  }

  const uploadFile = async (file) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('profile_picture', file)
      const res = await updateProfile(fd)
      // Backend returns { message, profile } — update local profile store
      const updated = res?.profile || res
      if (updated) {
        setProfile({ ...profile, ...updated })
        setData(updated)
      }
      setMessage({ type: 'success', text: 'Profile picture updated!' })
      // Refresh the page so the new picture is reflected across the whole app
      // (sidebar, header, mobile avatars) immediately.
      setTimeout(() => window.location.reload(), 600)
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.error || 'Failed to upload picture. Try again.' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const fd = new FormData()
      const fullName = e.target.full_name?.value
      if (fullName) fd.append('full_name', fullName)
      const phone = e.target.phone?.value
      if (phone) fd.append('phone', phone)
      const res = await updateProfile(fd)
      const updated = res?.profile || res
      if (updated) {
        setProfile({ ...profile, ...updated })
        setData(updated)
      }
      setMessage({ type: 'success', text: 'Profile saved!' })
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.error || 'Failed to save profile.' })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwSaving(true)
    setPwMessage(null)

    // Client-side validation
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setPwMessage({ type: 'error', text: 'Please fill in all password fields.' })
      setPwSaving(false)
      return
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwMessage({ type: 'error', text: 'New password and confirmation do not match.' })
      setPwSaving(false)
      return
    }
    if (pwForm.next.length < 6) {
      setPwMessage({ type: 'error', text: 'New password must be at least 6 characters.' })
      setPwSaving(false)
      return
    }

    try {
      await changePassword({
        old_password: pwForm.current,
        new_password: pwForm.next,
      })
      setPwMessage({ type: 'success', text: 'Password changed successfully! Logging you out — please sign in with your new password.' })
      setPwForm({ current: '', next: '', confirm: '' })
      // Blacklisting invalidates the current tokens — log out after a short delay
      setTimeout(() => {
        Logout()
        navigate('/login')
      }, 1800)
    } catch (err) {
      setPwMessage({
        type: 'error',
        text: err?.response?.data?.error || 'Failed to change password. Check your current password and try again.'
      })
    } finally {
      setPwSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-up">
      <PageHeader title="My Profile" subtitle="View and manage your account details" />

      {/* ── Profile Picture card — picture at the top next to the name ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg border-4 border-white">
              {currentPic ? (
<img src={toAbsoluteMedia(currentPic)} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-white">{displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            {/* Upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-lg hover:bg-teal-700 transition-colors disabled:opacity-60"
              title="Change photo"
            >
              <i className={`bi ${uploading ? 'bi-arrow-repeat animate-spin' : 'bi-camera-fill'}`}></i>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Name / role next to the picture (top) */}
          <div className="min-w-0">
            <h2 className="text-2xl font-black text-gray-900 truncate">{displayName}</h2>
            <p className="text-sm text-gray-500 capitalize mt-0.5">{role?.replace('_', ' ')}</p>
            <p className="text-sm text-gray-400 mt-1">{user?.email}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700"
            >
              <i className="bi bi-cloud-arrow-up"></i>
              {uploading ? 'Uploading...' : 'Change photo'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`mt-5 flex items-start gap-3 p-4 rounded-2xl border text-sm ${
            message.type === 'success'
              ? 'bg-green-50 border-green-100 text-green-700'
              : 'bg-red-50 border-red-100 text-red-700'
          }`}>
            <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'} mt-0.5`}></i>
            <p>{message.text}</p>
          </div>
        )}
      </div>

      {/* ── Basic info ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">Account Information</h3>
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Full Name</label>
            <input
              name="full_name"
              defaultValue={data?.full_name || profile?.full_name || ''}
              className="input-field w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Phone</label>
            <input
              name="phone"
              defaultValue={data?.phone || profile?.phone || ''}
              className="input-field w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Email</label>
            <input
              value={user?.email || ''}
              disabled
              className="input-field w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>
          <div className="sm:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Change Password ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-900 mb-1">Change Password</h3>
        <p className="text-sm text-gray-500 mb-4">You'll be logged out after changing your password.</p>

        {pwMessage && (
          <div className={`mb-4 flex items-start gap-3 p-4 rounded-2xl border text-sm ${
            pwMessage.type === 'success'
              ? 'bg-green-50 border-green-100 text-green-700'
              : 'bg-red-50 border-red-100 text-red-700'
          }`}>
            <i className={`bi ${pwMessage.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'} mt-0.5`}></i>
            <p>{pwMessage.text}</p>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Current Password</label>
            <input
              type="password"
              value={pwForm.current}
              onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
              placeholder="Enter your current password"
              className="input-field w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">New Password</label>
            <input
              type="password"
              value={pwForm.next}
              onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
              placeholder="At least 6 characters"
              className="input-field w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              placeholder="Re-enter new password"
              className="input-field w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
            />
          </div>
          <div className="sm:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={pwSaving}
              className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50"
            >
              {pwSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
