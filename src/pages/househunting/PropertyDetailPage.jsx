import React, { useState, useEffect, useContext } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getPropertyDetail, submitRentalRequest } from '../../services/houseHuntingService'
import { AuthContext } from '../../AuthContext'
import { LoadingSpinner, Badge, FormField, Textarea, ModalActions } from '../../components/ui'

export default function PropertyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getPropertyDetail(id)
      .then(data => {
        setProperty(data.property || data)
      })
      .catch(err => {
        setError('Property not found or no longer available.')
        console.error(err)
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleApply = () => {
    if (!user || user.role !== 'tenant') {
      // Redirect to tenant registration if not logged in
      navigate('/houses/register', { state: { from: `/houses/${id}` } })
      return
    }
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await submitRentalRequest({ property: property.id, message })
      setSuccess('Application submitted successfully! The landlord will review your request.')
      setShowForm(false)
      setMessage('')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to submit application. Please try again.')
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
              <Link to="/houses/register" className="px-4 py-2 text-sm font-semibold text-white rounded-xl btn-primary">
                Sign Up to Apply
              </Link>
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
          {/* Image Header */}
          <div className="h-56 md:h-72 bg-gradient-to-br from-teal-500/30 to-cyan-400/30 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="bi bi-building text-8xl text-teal-500/20"></i>
            </div>
            <div className="absolute top-5 left-5 flex gap-2">
              <Badge status={property?.status || 'AVAILABLE'} />
              {property?.property_type && (
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
                  {property.property_type}
                </span>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-32"></div>
            <div className="absolute bottom-5 left-5 text-white">
              <h1 className="text-3xl font-black">{property?.title || 'Untitled'}</h1>
              <p className="text-white/80 flex items-center gap-1 mt-1">
                <i className="bi bi-geo-alt"></i> {property?.location || 'Location not specified'}
              </p>
            </div>
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

            {/* Apply CTA */}
            {!showForm && !success && (
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">Interested in this property?</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {user?.role === 'tenant'
                        ? 'Submit an application and the landlord will get back to you.'
                        : 'Create a tenant account to apply for this property.'}
                    </p>
                  </div>
                  <button onClick={handleApply} className="btn-primary px-6 py-3 text-sm whitespace-nowrap">
                    <i className="bi bi-envelope-fill mr-2"></i>
                    {user?.role === 'tenant' ? 'Apply Now' : 'Sign Up & Apply'}
                  </button>
                </div>
              </div>
            )}

            {/* Application Form */}
            {showForm && (
              <div className="bg-white rounded-2xl border-2 border-teal-200 shadow-sm p-6 mt-6">
                <p className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <i className="bi bi-envelope-fill text-teal-500"></i>
                  Apply for {property?.title}
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
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

