import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { PageHeader, PrimaryBtn, EmptyState, LoadingSpinner, Modal, FormField, Input, Select, Textarea, ModalActions, ActionBtn, Badge } from '../../components/ui'

const EMPTY = { title: '', message: '', target: 'ALL' }

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    api.get('core/notices/')
      .then(r => setNotices(r.data.notices || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('core/notices/', form)
      setShowModal(false); setForm(EMPTY); load()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create notice')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return
    try { await api.delete(`core/notices/${id}/`); load() }
    catch { alert('Failed to delete') }
  }

  return (
    <div className="p-6 animate-fade-up">
      <PageHeader
        title="Notices"
        subtitle={`${notices.length} total`}
        action={<PrimaryBtn onClick={() => { setForm(EMPTY); setShowModal(true) }}><i className="bi bi-plus-lg"></i> New Notice</PrimaryBtn>}
      />

      {loading ? <LoadingSpinner /> : notices.length === 0 ? (
        <EmptyState icon="bi-megaphone" message="No notices yet." />
      ) : (
        <div className="space-y-3">
          {notices.map(n => (
            <div key={n.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-gray-900">{n.title}</p>
                  <Badge status={n.target} />
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{n.message}</p>
                <p className="text-xs text-gray-300 mt-1">{n.created_at ? new Date(n.created_at).toLocaleDateString('en-GB') : ''}</p>
              </div>
              <ActionBtn variant="red" onClick={() => handleDelete(n.id)}>Delete</ActionBtn>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="New Notice" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Title"><Input value={form.title} onChange={set('title')} required placeholder="Notice title" /></FormField>
            <FormField label="Target">
              <Select value={form.target} onChange={set('target')}>
                <option value="ALL">All Users</option>
                <option value="ALL TENANTS">All Tenants</option>
              </Select>
            </FormField>
            <FormField label="Message"><Textarea rows={4} value={form.message} onChange={set('message')} required placeholder="Notice content..." /></FormField>
            <ModalActions onCancel={() => setShowModal(false)} submitLabel="Post Notice" submitting={submitting} />
          </form>
        </Modal>
      )}
    </div>
  )
}
