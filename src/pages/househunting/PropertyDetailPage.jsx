import React, { useState, useEffect, useContext } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { getPropertyDetail, submitRentalInquiry, registerTenant } from '../../services/houseHuntingService'
import { AuthContext } from '../../AuthContext'
import { LoadingSpinner, Badge, FormField, Textarea, ModalActions } from '../../components/ui'

export default function PropertyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, setToken, setUser, setProfile } = useContext(AuthContext)

const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  // Guest combined registration + inquiry fields
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getPropertyDetail(id)
      .then(data => {
        setProperty(data)
      })
      .catch(err => {
        setError('Property not found or no longer available.')
        console.error(err)
      })
      .finally(() => setLoading(false))
  }, [id])

  const isAuthenticated = !!user
  const isTenant = user?.role === 'tenant'

// Get all photos for a property (backend + local storage)
  const getAllPhotos = (p) => {
    const photos = []
    if (p?.photos && Array.isArray(p.photos)) photos.push(...p.photos)
    if (p?.photo) photos.push(p.photo)
    if (p?.image) photos.push(p.image)
    // Check localStorage
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
    })
  }

  const photos = getAllPhotos(property)
  const currentPhoto = photos.length > 0 ? photos[currentPhotoIndex] : null

  const goToPrev = () => {
    setCurrentPhotoIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1))
  }
  const goToNext = () => {
    setCurrentPhotoIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1))
  }

  // Resolve landlord contact — uses real backend data (landlord_name/phone/email)
  const getLandlordContact = () => {
    return {
      name: property?.landlord_name || 'Property Owner',
      phone: property?.landlord_phone || '0712345678',
      email: property?.landlord_email || 'owner@smartrent.co.ke',
      business: property?.landlord_business || '',
    }
  }

  const handlePrimaryCTA = () => {
    setError('')
    if (!isAuthenticated) {
      // Guest → combined sign-up + request form
      setShowForm(true)
    } else {
      // Logged-in → simple apply form
      setShowForm(true)
    }
  }

  // Guest: send request FIRST (always works), then create account as best-effort.
  const handleGuestSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      // 1. Submit the rental inquiry with the guest's contact info.
      //    The backend creates a guest/lead request (requires lead_name + lead_phone).
      //    If the user already has an account, the backend still records the lead.
      await submitRentalInquiry({
        property: property.id,
        message,
        lead_name: fullName,
        lead_phone: phone,
        lead_email: email,
      })

      // 2. Now create the tenant account + auto-login as a BEST-EFFORT step.
      //    If registration fails (email/phone already exists, weak password, etc.)
      //    the request has already been submitted, so the user isn't blocked.
      let accountCreated = false
      try {
        await registerTenant({
          full_name: fullName,
          email,
          phone_number: phone,
          id_number: idNumber,
          role: 'tenant',
          password,
          password_confirm: passwordConfirm,
        })
        // Auto-login so the request is linked to their new tenant account
        const res = await api.post('core/login/', { email, password })
        const { access, refresh, user: u, profile: p } = res.data
        setToken(access); setUser(u)
        if (p) setProfile(p)
        localStorage.setItem('access_token', access)
        localStorage.setItem('refresh_token', refresh)
        localStorage.setItem('user', JSON.stringify(u))
        if (p) localStorage.setItem('profile', JSON.stringify(p))
        accountCreated = true
      } catch (err) {
        // Ignore — account creation failure should NOT block the request submission.
        console.warn('Account auto-creation skipped:', err.response?.data || err.message)
      }

      setSuccess(accountCreated
        ? 'Your request was sent to the landlord & your account was created. You can log in anytime to track it.'
        : 'Your request was sent to the landlord successfully! The landlord will contact you soon.')
      setShowForm(false); setMessage('')
    } catch (err) {
      const d = err.response?.data
      const extract = (obj) => {
        if (!obj) return 'Something went wrong. Please try again.'
        if (typeof obj === 'string') return obj
        if (obj.error) return typeof obj.error === 'string' ? obj.error : extract(obj.error)
        const first = Object.values(obj)[0]
        if (Array.isArray(first)) return first[0]
        if (typeof first === 'string') return first
        return extract(first)
      }
      setError(extract(d))
    } finally {
      setSubmitting(false)
    }
  }

  // Logged-in user: submit linked application.
  // For tenants the backend links to their account; for landlord/admin browsers
  // sending the session contact info makes the guest/lead path work too.
  const handleTenantSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const contact = {
        lead_name: user?.full_name || user?.username || '',
        lead_phone: user?.phone_number || '',
        lead_email: user?.email || '',
      }
      await submitRentalInquiry({ property: property.id, message, ...contact })
      setSuccess('Application submitted successfully! The landlord will review your request.')
      setShowForm(false); setMessage('')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to submit request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><LoadingSpinner /></div>

  if (error && !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <i className="bi bi-exclamation-triangle text-6xl text-gray-300 mb-4"></i>
        <p className="text-gray-600 text-lg font-medium mb-2">Property Not Found</p>
        <p className="text-gray-400 text-sm mb-6">{error}</p>
        <Link to="/houses" className="btn-primary px-6 py-3 text-sm">← Browse Properties</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center shadow">
              <i className="bi bi-house-door-fill text-white text-sm"></i>
            </div>
            <span className="text-lg font-black text-gray-900">Smart<span className="text-teal-600">Rent</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/houses" className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors flex items-center gap-1">
              <i className="bi bi-arrow-left"></i> Browse
            </Link>
            {!user ? (
              <>
                <Link to="/houses/register" className="text-sm font-semibold text-teal-600 border-2 border-teal-200 px-4 py-2 rounded-xl hover:border-teal-400 hover:bg-teal-50 transition-all">
                  Create Account
                </Link>
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-white rounded-xl btn-primary">
                  Sign In
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 animate-fade-up">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/houses" className="hover:text-teal-600 transition-colors">Available Properties</Link>
          <i className="bi bi-chevron-right text-xs"></i>
          <span className="text-gray-600">{property?.title || 'Property Details'}</span>
        </div>

        {success && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl">
            <i className="bi bi-check-circle-fill text-green-500 mt-0.5 shrink-0"></i>
            <div>
              <p className="text-green-700 text-sm font-medium">{success}</p>
              <Link to="/houses" className="text-green-600 text-sm underline mt-2 inline-block">Browse more properties →</Link>
            </div>
          </div>
        )}

        {error && showForm && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
            <i className="bi bi-exclamation-circle-fill text-red-500 mt-0.5 shrink-0"></i>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
{/* Image Header — Carousel/Gallery */}
          <div className="relative">
            {currentPhoto ? (
              <div className="h-56 md:h-72 bg-gray-100 relative overflow-hidden">
                <img src={currentPhoto} alt={property?.title || 'Property'} className="w-full h-full object-cover" />
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
              <div className="h-56 md:h-72 bg-gradient-to-br from-teal-500/30 to-cyan-400/30 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="bi bi-building text-8xl text-teal-500/20"></i>
                </div>
              </div>
            )}
            {/* Overlay gradient */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-32 pointer-events-none"></div>
            <div className="absolute bottom-5 left-5 text-white z-10">
              <h1 className="text-3xl font-black">{property?.title || 'Untitled'}</h1>
              <p className="text-white/80 flex items-center gap-1 mt-1">
                <i className="bi bi-geo-alt"></i> {property?.location || 'Location not specified'}
              </p>
            </div>
            {/* Badges */}
            <div className="absolute top-5 left-5 flex gap-2 z-10">
              <Badge status={property?.status || 'AVAILABLE'} />
              {(property?.property_type || property?.house_type) && (
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
                  {property.property_type || property.house_type}
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

          {/* Details */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { icon: 'bi-cash-stack', label: 'Monthly Rent', val: `KSh ${Number(property?.rent_per_month).toLocaleString()}`, color: 'from-teal-500 to-cyan-400' },
                { icon: 'bi-door-open', label: 'Bedrooms', val: property?.bedrooms || '—', color: 'from-violet-500 to-purple-400' },
                { icon: 'bi-droplet', label: 'Bathrooms', val: property?.bathrooms || '—', color: 'from-blue-500 to-indigo-400' },
                { icon: 'bi-arrows-angle-expand', label: 'Size', val: property?.square_feet ? `${property.square_feet} sq ft` : '—', color: 'from-amber-500 to-yellow-400' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-2xl p-4 text-center">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-2 shadow-md`}>
                    <i className={`bi ${s.icon} text-white text-sm`}></i>
                  </div>
                  <p className="text-lg font-black text-gray-900">{s.val}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {property?.description && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                  <i className="bi bi-info-circle text-teal-500"></i> Description
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Amenities */}
            {property?.amenities && property.amenities.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
                  <i className="bi bi-star text-teal-500"></i> Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(property.amenities) ? property.amenities : property.amenities.split(',')).map((a, i) => (
                    <span key={i} className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-xl text-xs font-medium border border-teal-100">
                      <i className="bi bi-check-circle-fill text-teal-500 mr-1 text-xs"></i>
                      {a.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Landlord Contact — locked behind sign-up */}
            <div className="mb-8">
              {!isAuthenticated ? (
                <div className="bg-slate-900 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <i className="bi bi-lock-fill text-amber-400 text-lg"></i>
                  </div>
                  <p className="font-bold text-white text-lg mb-1">Contact is Locked</p>
                  <p className="text-slate-400 text-sm mb-5 max-w-sm mx-auto">
                    Create a free account and sign in to see the landlord's contact details and apply for this house.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/houses/register" className="px-6 py-3 text-sm font-bold text-white rounded-xl btn-primary">
                      <i className="bi bi-person-plus-fill mr-2"></i>Create Account
                    </Link>
                    <Link to="/login" className="px-6 py-3 text-sm font-semibold text-white border-2 border-white/20 rounded-xl hover:bg-white/10 transition-all">
                      Sign In
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-teal-50 rounded-2xl p-6 border border-teal-100">
                  <p className="text-xs font-bold text-teal-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <i className="bi bi-unlock-fill"></i> Landlord Contact — Unlocked
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl p-4 border border-teal-100">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Landlord</p>
                      <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                        <i className="bi bi-person-circle text-teal-500"></i>{getLandlordContact().name}
                      </p>
                      {getLandlordContact().business && (
                        <p className="text-xs text-gray-400 mt-1">{getLandlordContact().business}</p>
                      )}
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-teal-100">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Phone</p>
                      <a href={`tel:${getLandlordContact().phone}`} className="font-bold text-gray-900 text-sm flex items-center gap-1.5 hover:text-teal-600 transition-colors">
                        <i className="bi bi-telephone-fill text-teal-500"></i>{getLandlordContact().phone}
                      </a>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-teal-100">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Email</p>
                      <a href={`mailto:${getLandlordContact().email}`} className="font-bold text-gray-900 text-sm flex items-center gap-1.5 break-all hover:text-teal-600 transition-colors">
                        <i className="bi bi-envelope-fill text-teal-500"></i>{getLandlordContact().email}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Apply CTA */}
            {!showForm && !success && (
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">Interested in this property?</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {!isAuthenticated
                        ? 'Create an account to send your request — it will be linked to your new tenant account.'
                        : 'Submit an application and the landlord will get back to you.'}
                    </p>
                  </div>
                  <button onClick={handlePrimaryCTA} className="btn-primary px-6 py-3 text-sm whitespace-nowrap">
                    <i className="bi bi-envelope-fill mr-2"></i>
                    {!isAuthenticated ? 'Request This House' : 'Apply Now'}
                  </button>
                </div>
              </div>
            )}

            {/* Guest form — create account + send request */}
            {showForm && !isAuthenticated && (
              <div className="bg-white rounded-2xl border-2 border-teal-200 shadow-sm p-6 mt-6">
                <p className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                  <i className="bi bi-person-plus-fill text-teal-500"></i>
                  Create Account & Request {property?.title}
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Your request will be linked to your new tenant account so you can track it on the landlord's side.
                </p>
                <form onSubmit={handleGuestSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Full Name *">
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="input-field w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
                      />
                    </FormField>
                    <FormField label="ID Number *">
                      <input
                        type="text"
                        required
                        value={idNumber}
                        onChange={e => setIdNumber(e.target.value)}
                        placeholder="e.g. 12345678"
                        className="input-field w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
                      />
                    </FormField>
                  </div>
                  <FormField label="Email Address *">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-field w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
                    />
                  </FormField>
                  <FormField label="Phone Number *">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="0712345678"
                      className="input-field w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
                    />
                  </FormField>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Password *">
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className="input-field w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
                      />
                    </FormField>
                    <FormField label="Confirm Password *">
                      <input
                        type="password"
                        required
                        value={passwordConfirm}
                        onChange={e => setPasswordConfirm(e.target.value)}
                        placeholder="Re-enter password"
                        className="input-field w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
                      />
                    </FormField>
                  </div>
                  <FormField label="Message (optional)">
                    <Textarea
                      rows={3}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Introduce yourself, mention your move-in date, or ask any questions..."
                    />
                  </FormField>
                  <ModalActions
                    onCancel={() => { setShowForm(false); setError('') }}
                    submitLabel="Create Account & Send Request"
                    submitting={submitting}
                  />
                </form>
              </div>
            )}

            {/* Logged-in tenant form — unlocked apply */}
            {showForm && isAuthenticated && (
              <div className="bg-white rounded-2xl border-2 border-teal-200 shadow-sm p-6 mt-6">
                <p className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <i className="bi bi-envelope-fill text-teal-500"></i>
                  Apply for {property?.title}
                </p>
                <form onSubmit={handleTenantSubmit} className="space-y-4">
                  <FormField label="Message (optional)">
                    <Textarea
                      rows={4}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Introduce yourself, mention your move-in date, or ask any questions..."
                    />
                  </FormField>
                  <ModalActions
                    onCancel={() => { setShowForm(false); setError('') }}
                    submitLabel="Submit Application"
                    submitting={submitting}
                  />
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link to="/houses" className="text-sm text-gray-400 hover:text-teal-600 transition-colors flex items-center justify-center gap-1">
            <i className="bi bi-arrow-left"></i> Back to all properties
          </Link>
        </div>
      </div>
    </div>
  )
}

