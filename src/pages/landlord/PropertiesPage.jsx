import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { PageHeader, PrimaryBtn, EmptyState, LoadingSpinner, Modal, FormField, Input, Select, Textarea, ModalActions, Badge } from '../../components/ui'

const EMPTY = { title: '', location: '', rent_per_month: '', status: 'AVAILABLE', description: '' }

export default function PropertiesPage() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const load = async () => {
    try { const r = await api.get('landlord/properties/'); setProperties(r.data) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openForm = (p = null) => {
    setEditing(p)
    setForm(p ? { title: p.title || '', location: p.location || '', rent_per_month: p.rent_per_month || '', status: p.status || 'AVAILABLE', description: p.description || '' } : EMPTY)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      editing ? await api.put(`landlord/properties/${editing.id}/`, form) : await api.post('landlord/properties/', form)
      setShowModal(false); load()
    } catch (err) {
      const d = err.response?.data
      alert(d?.error ? (typeof d.error === 'string' ? d.error : Object.entries(d.error).map(([k,v]) => `${k}: ${v}`).join(' | ')) : 'Failed to save')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property?')) return
    try { await api.delete(`landlord/properties/${id}/`); load() }
    catch { alert('Failed to delete') }
  }

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  return (
    <div className="p-6 animate-fade-up">
      <PageHeader
        title="Properties"
        subtitle={`${properties.length} total`}
        action={<PrimaryBtn onClick={() => openForm()}><i className="bi bi-plus-lg"></i> Add Property</PrimaryBtn>}
      />

      {loading ? <LoadingSpinner /> : properties.length === 0 ? (
        <EmptyState icon="bi-building" message='No properties yet. Click "Add Property" to get started.' />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {properties.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-teal-500 to-cyan-400"></div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{p.title}</h3>
                    <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
                      <i className="bi bi-geo-alt text-xs"></i>{p.location}
                    </p>
                  </div>
                  <Badge status={p.status} />
                </div>
                <div className="flex items-center gap-1.5 mb-4">
                  <i className="bi bi-cash-stack text-teal-500 text-sm"></i>
                  <span className="font-bold text-gray-800">KSh {Number(p.rent_per_month).toLocaleString()}</span>
                  <span className="text-gray-400 text-xs">/month</span>
                </div>
                {p.description && <p className="text-xs text-gray-400 mb-4 line-clamp-2">{p.description}</p>}
                <div className="flex gap-2 pt-3 border-t border-gray-50">
                  <button onClick={() => openForm(p)} className="flex-1 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                    <i className="bi bi-pencil mr-1"></i>Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="flex-1 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                    <i className="bi bi-trash mr-1"></i>Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Property' : 'Add Property'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Property Name"><Input value={form.title} onChange={set('title')} required placeholder="e.g. Sunset Apartments" /></FormField>
            <FormField label="Location"><Input value={form.location} onChange={set('location')} required placeholder="e.g. Westlands, Nairobi" /></FormField>
            <FormField label="Monthly Rent (KSh)"><Input type="number" value={form.rent_per_month} onChange={set('rent_per_month')} required placeholder="0" /></FormField>
            <FormField label="Status">
              <Select value={form.status} onChange={set('status')}>
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
              </Select>
            </FormField>
            <FormField label="Description (optional)"><Textarea rows={3} value={form.description} onChange={set('description')} placeholder="Brief description..." /></FormField>
            <ModalActions onCancel={() => setShowModal(false)} submitLabel={editing ? 'Update Property' : 'Add Property'} />
          </form>
        </Modal>
      )}
    </div>
  )
}
