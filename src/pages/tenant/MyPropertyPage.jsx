import React, { useState, useEffect, useContext } from 'react'
import api from '../../services/api'
import { AuthContext } from '../../AuthContext'
import { toAbsoluteMedia } from '../../config'
import { LoadingSpinner, Badge } from '../../components/ui'

/**
 * Resolve a photo URL to an absolute URL — media files stored as relative
 * paths (e.g. "/media/properties/xyz.jpg") must be prefixed with MEDIA_URL.
 * Base64 data URLs and full http(s) URLs pass through unchanged.
 */
const resolvePhoto = (src) => {
  if (!src) return ''
  if (src.startsWith('data:')) return src
  if (src.startsWith('http')) return src
  return toAbsoluteMedia(src)
}

/**
 * Get ALL photos for a property — combines backend fields (photos/photo/image)
 * with any locally-stored uploads (same logic as landlord PropertiesPage).
 * Each photo is resolved to an absolute URL so relative media paths work.
 */
const getAllPhotos = (p) => {
  const photos = []
  if (p?.photos && Array.isArray(p.photos)) photos.push(...p.photos)
  if (p?.photo) photos.push(p.photo)
  if (p?.image) photos.push(p.image)
  try {
    const raw = localStorage.getItem(`prop_photos_${p?.id}`)
    if (raw) {
      const local = JSON.parse(raw)
      if (Array.isArray(local)) photos.push(...local)
    }
  } catch {}
  // Deduplicate by first 50 chars
  const seen = new Set()
  return photos.filter(ph => {
    const key = ph?.substring(0, 50)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).map(resolvePhoto)
}

/** Normalize amenities — accepts array or comma-separated string */
const parseAmenities = (amenities) => {
  if (!amenities) return []
  if (Array.isArray(amenities)) return amenities.map(a => a.trim())
  return amenities.split(',').map(a => a.trim())
}

export default function MyPropertyPage() {
  const { profile } = useContext(AuthContext)
  const [lease, setLease] = useState(null)
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        // 1. Get the tenant's lease
        const r = await api.get('core/leases/')
        const leases = r.data.leases || []
        const activeLease = leases.find(l => l.status === 'ACTIVE') || leases[0] || null
        setLease(activeLease)

        // 2. Fetch the FULL property detail (photos, amenities, etc.) using the
        //    dedicated detail endpoint — the lease response only includes a
        //    minimal nested property object (id/title/location).
        const propertyId = activeLease?.property?.id || activeLease?.property
        if (propertyId) {
          try {
            const pr = await api.get(`core/properties/${propertyId}/`)
            setProperty(pr.data)
          } catch (e) {
            console.error('Failed to load property details:', e)
            // Fall back to whatever the lease serializer included
            setProperty(activeLease?.property || null)
          }
        } else {
          setProperty(activeLease?.property || null)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="p-6"><LoadingSpinner /></div>

  // Use the full property object fetched from the detail endpoint
  const shownProperty = property || lease?.property || null
  const photos = getAllPhotos(shownProperty)
  const currentPhoto = photos.length > 0 ? photos[currentPhotoIndex] : null

  const goToPrev = () => {
    setCurrentPhotoIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1))
  }
  const goToNext = () => {
    setCurrentPhotoIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1))
  }

  const monthlyRent = shownProperty?.rent_per_month ?? lease?.monthly_rent
  const amenities = parseAmenities(shownProperty?.amenities)

  return (
    <div className="p-6 space-y-5 animate-fade-up">

      {/* ── Tenant Profile Card ── */}
      {profile && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-teal-500 to-cyan-400"></div>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                {(profile.full_name || 'T')[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">{profile.full_name}</h2>
                <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <i className="bi bi-person-badge text-teal-500"></i> Tenant
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: 'bi-card-text', label: 'ID Number', val: profile.id_number },
                { icon: 'bi-telephone', label: 'Phone', val: profile.phone },
                { icon: 'bi-envelope', label: 'Email', val: profile.email_address },
                { icon: 'bi-telephone-plus', label: 'Alt. Phone', val: profile.alternative_phone },
                { icon: 'bi-calendar-check', label: 'Joined', val: profile.join_date },
              ].filter(f => f.val).map(f => (
                <div key={f.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                    <i className={`bi ${f.icon} text-teal-500`}></i>{f.label}
                  </p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{f.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── No lease state ── */}
      {!lease ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          <i className="bi bi-building text-5xl block mb-3 opacity-30"></i>
          <p className="text-sm">No active lease found. Contact your landlord.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* ════ PROPERTY CARD — full details like the landlord's view ════ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-400"></div>

            {/* ── Property Photo / Hero ── */}
            <div className="relative">
              {currentPhoto ? (
                <div className="h-56 md:h-72 bg-gray-100 relative overflow-hidden">
                  <img src={currentPhoto} alt={shownProperty?.title || 'Property'} className="w-full h-full object-cover" />
                  {/* Prev/Next arrows */}
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={goToPrev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
                      >
                        <i className="bi bi-chevron-left text-gray-700 text-sm"></i>
                      </button>
                      <button
                        onClick={goToNext}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
                      >
                        <i className="bi bi-chevron-right text-gray-700 text-sm"></i>
                      </button>
                    </>
                  )}
                  {/* Photo count badge */}
                  {photos.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 z-10">
                      <i className="bi bi-images"></i> {currentPhotoIndex + 1} / {photos.length}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-44 md:h-56 bg-gradient-to-br from-violet-500/20 to-purple-400/20 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="bi bi-building text-7xl text-violet-500/20"></i>
                  </div>
                </div>
              )}

              {/* Overlay gradient + title */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-32 pointer-events-none"></div>
              <div className="absolute bottom-4 left-5 right-5 text-white z-10">
                <h3 className="text-2xl font-black truncate">{shownProperty?.title || '—'}</h3>
                <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
                  <i className="bi bi-geo-alt"></i> {shownProperty?.location || '—'}
                </p>
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2 z-10">
                <Badge status={lease.status} />
                {(shownProperty?.property_type || shownProperty?.house_type) && (
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
                    {shownProperty.property_type || shownProperty.house_type}
                  </span>
                )}
              </div>

              {/* Dot indicators */}
              {photos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {photos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPhotoIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentPhotoIndex ? 'bg-white w-5' : 'bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Property Stats (rent / beds / baths / size) — same as landlord ── */}
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { icon: 'bi-cash-stack', label: 'Monthly Rent', val: monthlyRent != null ? `KSh ${Number(monthlyRent).toLocaleString()}` : '—', color: 'from-teal-500 to-cyan-400' },
                  { icon: 'bi-door-open', label: 'Bedrooms', val: shownProperty?.bedrooms ?? '—', color: 'from-violet-500 to-purple-400' },
                  { icon: 'bi-droplet', label: 'Bathrooms', val: shownProperty?.bathrooms ?? '—', color: 'from-blue-500 to-indigo-400' },
                  { icon: 'bi-arrows-angle-expand', label: 'Size', val: shownProperty?.square_feet ? `${Number(shownProperty.square_feet).toLocaleString()} sq ft` : '—', color: 'from-amber-500 to-yellow-400' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-2xl p-4 text-center">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-2 shadow-md`}>
                      <i className={`bi ${s.icon} text-white text-sm`}></i>
                    </div>
                    <p className="text-lg font-black text-gray-900 break-words">{s.val}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* ── Property Description ── */}
              {shownProperty?.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <i className="bi bi-info-circle text-violet-500"></i> Description
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{shownProperty.description}</p>
                </div>
              )}

              {/* ── Amenities ── */}
              {amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
                    <i className="bi bi-star text-violet-500"></i> Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((a, i) => (
                      <span key={i} className="px-3 py-1.5 bg-violet-50 text-violet-700 rounded-xl text-xs font-medium border border-violet-100">
                        <i className="bi bi-check-circle-fill text-violet-500 mr-1 text-xs"></i>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Lease Details ── */}
              <div className="border-t border-gray-100 pt-5">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
                  <i className="bi bi-file-earmark-text text-violet-500"></i> Lease Details
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { icon: 'bi-calendar-check', label: 'Lease Start', val: lease.start_date || '—', color: 'text-gray-800' },
                    { icon: 'bi-calendar-x', label: 'Lease End', val: lease.end_date || '—', color: 'text-gray-800' },
                    { icon: 'bi-person-fill', label: 'Landlord', val: lease.landlord_name || shownProperty?.landlord_name || '—', color: 'text-gray-800' },
                    { icon: 'bi-cash-stack', label: 'Rent / Month', val: monthlyRent != null ? `KSh ${Number(monthlyRent).toLocaleString()}` : '—', color: 'text-teal-600' },
                  ].map(f => (
                    <div key={f.label} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                        <i className={`bi ${f.icon} text-violet-500`}></i>{f.label}
                      </p>
                      <p className={`text-sm font-bold ${f.color}`}>{f.val}</p>
                    </div>
                  ))}
                </div>

                {/* Landlord contact */}
                {(shownProperty?.landlord_phone || shownProperty?.landlord_email) && (
                  <div className="mt-4 bg-teal-50 rounded-xl p-4 border border-teal-100">
                    <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <i className="bi bi-person-circle"></i> Landlord Contact
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
                      {shownProperty.landlord_phone && (
                        <a href={`tel:${shownProperty.landlord_phone}`} className="text-gray-700 hover:text-teal-600 transition-colors flex items-center gap-1.5">
                          <i className="bi bi-telephone-fill text-teal-500 text-xs"></i>{shownProperty.landlord_phone}
                        </a>
                      )}
                      {shownProperty.landlord_email && (
                        <a href={`mailto:${shownProperty.landlord_email}`} className="text-gray-700 hover:text-teal-600 transition-colors flex items-center gap-1.5 break-all">
                          <i className="bi bi-envelope-fill text-teal-500 text-xs"></i>{shownProperty.landlord_email}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Lease Terms ── */}
              {lease.terms && (
                <div className="mt-5 bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
                    <i className="bi bi-file-earmark-text"></i> Lease Terms
                  </p>
                  <p className="text-sm text-amber-800 whitespace-pre-line">{lease.terms}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}