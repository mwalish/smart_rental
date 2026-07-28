import React, { useState, useEffect } from 'react'
import api from '../../services/api'

const EMPTY_FORM = { title: '', message: '', target: 'ALL' }

export default function NoticesPage() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    try {
      const res = await api.get('core/notices/')
      setNotices(res.data.notices || [])
    } catch (err) {
      console.error('Failed to load notices:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const openForm = (notice = null) => {
    if (notice) {
      setEditing(notice)
      setForm({ title: notice.title || '', message: notice.message || '', target: notice.target || 'ALL' })
    } else {
      setEditing(null)
      setForm(EMPTY_FORM)
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await api.put(`core/notices/${editing.id}/`, form)
        setNotices(prev => prev.map(n => n.id === editing.id ? { ...n, ...form } : n))
      } else {
        const res = await api.post('core/notices/', form)
        setNotices(prev => [res.data.notice, ...prev])
      }
      setShowModal(false)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save notice')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return
    try {
      await api.delete(`core/notices/${id}/`)
      setNotices(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete notice')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Notices</h2>
        <button
          onClick={() => openForm()}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
        >
          <i className="bi bi-plus-lg"></i> New Notice
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : notices.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="bi bi-megaphone text-4xl block mb-3"></i>
          <p>No notices yet. Create one to notify your tenants.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map(n => (
            <div key={n.id} className="bg-white rounded-xl shadow-sm p-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-800">{n.title}</p>
                  <span className="px-2 py-0.5 rounded text-xs bg-teal-50 text-teal-700">{n.target}</span>
                </div>
                <p className="text-sm text-gray-600">{n.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => openForm(n)}
                  className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">{editing ? 'Edit Notice' : 'New Notice'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. Water Outage Notice"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Write your notice here..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <select
                  value={form.target}
                  onChange={e => setForm(p => ({ ...p, target: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="ALL">All</option>
                  <option value="ALL TENANTS">All Tenants</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editing ? 'Update' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
