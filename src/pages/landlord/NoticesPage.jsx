import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { PageHeader, PrimaryBtn, EmptyState, LoadingSpinner, Modal, FormField, Input, Select, Textarea, ModalActions } from '../../components/ui'

const EMPTY = { title: '', message: '', target: 'ALL' }

export default function NoticesPage() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try { const r = await api.get('core/notices/'); setNotices(r.data.notices || []) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openForm = (n = null) => {
    setEditing(n)
    setForm(n ? { title: n.title || '', message: n.message || '', target: n.target || 'ALL' } : EMPTY)
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
        const r = await api.post('core/notices/', form)
        setNotices(prev => [r.data.notice, ...prev])
      }
      setShowModal(false)
    } catch (err) { alert(err.response?.data?.error || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return
    try { await api.delete(`core/notices/${id}/`); setNotices(prev => prev.filter(n => n.id !== id)) }
    catch (err) { alert(err.response?.data?.error || 'Failed to delete') }
  }

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const TARGET_COLORS = { ALL: 'bg-teal-50 text-teal-700', 'ALL TENANTS': 'bg-violet-50 text-violet-700' }

  return (
    <div className="p-6 animate-fade-up">
      <PageHeader
        title="Notices"
        subtitle={`${notices.length} published`}
        action={<PrimaryBtn onClick={() => openForm()}><i className="bi bi-plus-lg"></i> New Notice</PrimaryBtn>}
      />

      {loading ? <LoadingSpinner /> : notices.length === 0 ? (
        <EmptyState icon="bi-megaphone" message="No notices yet. Create one to notify your tenants." />
      ) : (
        <div className="space-y-3">
          {notices.map(n => (
            <div key={n.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shrink-0 shadow-md">
                <i className="bi bi-megaphone-fill text-white text-sm"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-bold text-gray-900">{n.title}</p>
                  <span className={`badge ${TARGET_COLORS[n.target] || 'bg-gray-100 text-gray-600'}`}>{n.target}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{n.message}</p>
                <p className="text-xs text-gray-300 mt-2 flex items-center gap-1">
                  <i className="bi bi-clock text-xs"></i>
                  {n.created_at ? new Date(n.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openForm(n)} className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-600 transition-colors">
                  <i className="bi bi-pencil text-xs"></i>
                </button>
                <button onClick={() => handleDelete(n.id)} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 transition-colors">
                  <i className="bi bi-trash text-xs"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Notice' : 'New Notice'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Title"><Input value={form.title} onChange={set('title')} required placeholder="e.g. Water Outage Notice" /></FormField>
            <FormField label="Message"><Textarea rows={4} value={form.message} onChange={set('message')} required placeholder="Write your notice here..." /></FormField>
            <FormField label="Target Audience">
              <Select value={form.target} onChange={set('target')}>
                <option value="ALL">All</option>
                <option value="ALL TENANTS">All Tenants</option>
              </Select>
            </FormField>
            <ModalActions onCancel={() => setShowModal(false)} submitLabel={saving ? 'Saving...' : editing ? 'Update Notice' : 'Publish Notice'} submitting={saving} />
          </form>
        </Modal>
      )}
    </div>
  )
}
