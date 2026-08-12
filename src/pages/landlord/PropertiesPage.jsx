import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { PageHeader, PrimaryBtn, EmptyState, LoadingSpinner, Modal, FormField, Input, Select, Textarea, ModalActions, Badge } from '../../components/ui'

const EMPTY = { title: '', location: '', rent_per_month: '', bedrooms: 1, bathrooms: 1, square_feet: '', status: 'AVAILABLE', description: '' }

/** Get locally stored photos array for a property */
const getStoredPhotos = (id) => {
  try {
    const raw = localStorage.getItem(`prop_photos_${id}`)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

/** Save photos array to localStorage */
const saveStoredPhotos = (id, photos) => {
  localStorage.setItem(`prop_photos_${id}`, JSON.stringify(photos))
}

/** Get the first photo (or null) for a property — checks both backend photos field and localStorage */
const getFirstPhoto = (p) => {
  // Backend photos JSONField (array of base64)
  if (p?.photos && Array.isArray(p.photos) && p.photos.length > 0) return p.photos[0]
  // Legacy single photo field
  if (p?.photo) return p.photo
  // Local storage
  const local = getStoredPhotos(p?.id)
  if (local.length > 0) return local[0]
  return null
}

/** Get all photos for a property (backend + local combined) */
const getAllPhotos = (p) => {
  const photos = []
  if (p?.photos && Array.isArray(p.photos)) photos.push(...p.photos)
  if (p?.photo) photos.push(p.photo)
  const local = getStoredPhotos(p?.id)
  photos.push(...local)
  return photos
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [photos, setPhotos] = useState([]) // array of base64 strings for new uploads
  const [photoPreviews, setPhotoPreviews] = useState([]) // previews for display
  const [applicants, setApplicants] = useState({}) // property_id -> applicant list
  const [showApplicants, setShowApplicants] = useState(null) // property object
  const [uploadingFor, setUploadingFor] = useState(null) // property id being uploaded to
  const [uploadPhotos, setUploadPhotos] = useState([]) // photos being uploaded
  const [uploadPreviews, setUploadPreviews] = useState([]) // previews for upload
  const [uploading, setUploading] = useState(false)
  const [uploadNotice, setUploadNotice] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async (fetchApplicants = true) => {
    try {
      const r = await api.get('landlord/properties/')
      const list = r.data || []
      setProperties(list)
      // Fetch applicants for each property (only on initial load to keep updates fast)
      if (fetchApplicants) {
        const appMap = {}
        await Promise.all(list.map(async (p) => {
          try {
            const ar = await api.get(`landlord/properties/${p.id}/applicants/`)
            appMap[p.id] = ar.data.applicants || []
          } catch (e) { appMap[p.id] = [] }
        }))
        setApplicants(appMap)
      }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openForm = (p = null) => {
    setEditing(p)
    setForm(p ? { title: p.title || '', location: p.location || '', rent_per_month: p.rent_per_month || '', bedrooms: p.bedrooms || 1, bathrooms: p.bathrooms || 1, square_feet: p.square_feet || '', status: p.status || 'AVAILABLE', description: p.description || '' } : EMPTY)
    // Preload locally-stored photos for this property
    const existing = p ? getStoredPhotos(p.id) : []
    setPhotos([])
    setPhotoPreviews(existing)
    setShowModal(true)
  }

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const newPreviews = []
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        newPreviews.push(reader.result)
        if (newPreviews.length === files.length) {
          setPhotoPreviews(prev => [...prev, ...newPreviews])
          setPhotos(prev => [...prev, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index) => {
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      let savedId = editing?.id
      const payload = { ...form }
      // Only send NEWLY uploaded photos in the payload. Existing photos are
      // already stored on the backend — re-sending them as base64 makes the
      // update request very slow (base64 images are large).
      if (photos.length > 0) {
        const existingPhotos = (editing?.photos && Array.isArray(editing.photos)) ? editing.photos : []
        payload.photos = [...existingPhotos, ...photos]
      }
      if (editing) {
        await api.put(`landlord/properties/${editing.id}/`, payload)
      } else {
        const r = await api.post('landlord/properties/', payload)
        savedId = r.data?.data?.id || r.data?.id
      }
      // Also persist photos locally for fast display
      if (photoPreviews.length > 0 && savedId) {
        saveStoredPhotos(savedId, photoPreviews)
      }
      setShowModal(false); load(false)
    } catch (err) {
      const d = err.response?.data
      alert(d?.error ? (typeof d.error === 'string' ? d.error : Object.entries(d.error).map(([k, v]) => `${k}: ${v}`).join(' | ')) : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property?')) return
    try {
      await api.delete(`landlord/properties/${id}/`)
      localStorage.removeItem(`prop_photos_${id}`)
      load(false)
    }
    catch { alert('Failed to delete') }
  }

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const viewApplicants = (p) => setShowApplicants(p)

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
          {properties.map(p => {
            const allPhotos = getAllPhotos(p)
            const firstPhoto = getFirstPhoto(p)
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {firstPhoto ? (
                  <div className="h-36 bg-gray-100 relative">
                    <img src={firstPhoto} alt={p.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3"><Badge status={p.status} /></div>
                    {allPhotos.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <i className="bi bi-images"></i> {allPhotos.length}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-2 bg-gradient-to-r from-teal-500 to-cyan-400"></div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{p.title}</h3>
                      <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
                        <i className="bi bi-geo-alt text-xs"></i>{p.location}
                      </p>
                    </div>
                    {!firstPhoto && <Badge status={p.status} />}
                  </div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <i className="bi bi-cash-stack text-teal-500 text-sm"></i>
                    <span className="font-bold text-gray-800">KSh {Number(p.rent_per_month).toLocaleString()}</span>
                    <span className="text-gray-400 text-xs">/month</span>
                  </div>

                  {/* Beds / Baths / Size */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-3">
                    {p.bedrooms != null && (
                      <span className="flex items-center gap-1.5">
                        <i className="bi bi-door-open text-teal-500 text-sm"></i>
                        {p.bedrooms} bed{p.bedrooms > 1 ? 's' : ''}
                      </span>
                    )}
                    {p.bathrooms != null && (
                      <span className="flex items-center gap-1.5">
                        <i className="bi bi-droplet text-blue-500 text-sm"></i>
                        {p.bathrooms} bath{p.bathrooms > 1 ? 's' : ''}
                      </span>
                    )}
                    {p.square_feet && (
                      <span className="flex items-center gap-1.5">
                        <i className="bi bi-arrows-angle-expand text-amber-500 text-sm"></i>
                        {Number(p.square_feet).toLocaleString()} sq ft
                      </span>
                    )}
                  </div>

                  {p.description && <p className="text-xs text-gray-400 mb-4 line-clamp-2">{p.description}</p>}

                  {/* Applicants summary */}
                  <button
                    onClick={() => viewApplicants(p)}
                    className="w-full flex items-center justify-between px-3 py-2.5 mb-4 bg-violet-50 hover:bg-violet-100 rounded-xl transition-colors text-left"
                  >
                    <span className="text-xs font-semibold text-violet-700 flex items-center gap-1.5">
                      <i className="bi bi-people-fill"></i> Applicants
                    </span>
                    <span className="text-xs font-bold text-violet-700 bg-white px-2 py-0.5 rounded-full shadow-sm">
                      {(applicants[p.id] || []).length}
                    </span>
                  </button>

                  {/* Recent applicants preview */}
                  {(applicants[p.id] || []).length > 0 && (
                    <div className="mb-4 space-y-1.5">
                      {(applicants[p.id] || []).slice(0, 2).map(a => (
                        <div key={a.id} className="flex items-center gap-2 text-xs bg-gray-50 rounded-lg px-2.5 py-1.5">
                          <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-[10px] font-bold shrink-0">
                            {(a.tenant_name || a.lead_name || '?')[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-700 truncate">{a.tenant_name || a.lead_name || 'Anonymous'}</span>
                          <span className="ml-auto text-gray-400 shrink-0">{a.tenant_phone || a.lead_phone || ''}</span>
                        </div>
                      ))}
                    </div>
                  )}

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
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Property' : 'Add Property'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-2">

            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1.5">Property Name</label>
              <Input
                value={form.title}
                onChange={set('title')}
                required
                placeholder="e.g. Sunset Apartments"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
              <Input
                value={form.location}
                onChange={set('location')}
                required
                placeholder="e.g. Westlands, Nairobi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Rent (KSh)</label>
              <Input
                type="number"
                value={form.rent_per_month}
                onChange={set('rent_per_month')}
                required
                placeholder="0"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bedrooms</label>
                <Input type="number" min="0" value={form.bedrooms} onChange={set('bedrooms')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bathrooms</label>
                <Input type="number" min="0" value={form.bathrooms} onChange={set('bathrooms')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Size (sq ft)</label>
                <Input type="number" min="0" value={form.square_feet} onChange={set('square_feet')} placeholder="850" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Property Photos</label>
              <div className="space-y-3">
                {photoPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {photoPreviews.map((src, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border">
                        <img src={src} className="w-full h-full object-cover" alt="" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl cursor-pointer hover:bg-teal-100 text-sm font-medium">
                  <i className="bi bi-upload"></i>
                  {photoPreviews.length ? 'Add More Photos' : 'Upload Photos'}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotosChange} />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <Select value={form.status} onChange={set('status')}>
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={set('description')}
                placeholder="Brief description of the property..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Saving...
                  </>
                ) : (editing ? 'Update Property' : 'Add Property')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Applicants Modal */}
      {showApplicants && (
        <Modal title={`Applicants — ${showApplicants.title}`} onClose={() => setShowApplicants(null)}>
          {(() => {
            const list = applicants[showApplicants.id] || []
            if (list.length === 0) {
              return <EmptyState icon="bi-people" message="No one has applied for this property yet." />
            }
            return (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {list.map(a => (
                  <div key={a.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold shrink-0">
                        {(a.tenant_name || a.lead_name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{a.tenant_name || a.lead_name || 'Anonymous'}</p>
                        <p className="text-[11px] text-gray-400">{a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}</p>
                      </div>
                      <div className="ml-auto"><Badge status={a.status} /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-gray-600">
                      {(a.tenant_phone || a.lead_phone) && (
                        <p className="flex items-center gap-1.5">
                          <i className="bi bi-telephone text-teal-500"></i>
                          <a href={`tel:${a.tenant_phone || a.lead_phone}`} className="hover:text-teal-600">{a.tenant_phone || a.lead_phone}</a>
                        </p>
                      )}
                      {(a.tenant_email || a.lead_email) && (
                        <p className="flex items-center gap-1.5 truncate">
                          <i className="bi bi-envelope text-teal-500"></i>
                          <a href={`mailto:${a.tenant_email || a.lead_email}`} className="hover:text-teal-600 truncate">{a.tenant_email || a.lead_email}</a>
                        </p>
                      )}
                      {a.tenant_id_number && (
                        <p className="flex items-center gap-1.5"><i className="bi bi-credit-card-2-front text-teal-500"></i>ID: {a.tenant_id_number}</p>
                      )}
                    </div>
                    {a.message && <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg p-2.5 italic">{a.message}</p>}
                  </div>
                ))}
              </div>
            )
          })()}
        </Modal>
      )}
    </div>
  )
}
