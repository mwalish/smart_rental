import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAvailableProperties } from '../../services/houseHuntingService'
import { LoadingSpinner, Badge } from '../../components/ui'

const PROPERTY_TYPES = ['ALL', 'Apartment', 'House', 'Bedsitter', 'Studio', 'Commercial']

// Common Kenyan areas used for location autocomplete suggestions
const KENYAN_AREAS = [
  'Nairobi', 'Westlands', 'Kilimani', 'Lavington', 'Kileleshwa', 'Langata', 'South B',
  'South C', 'Embakasi', 'Ruiru', 'Thika', 'Juja', 'Kitisuru', 'Karen', 'Runda',
  'Muthaiga', 'Parklands', 'Ngara', 'Donholm', 'Buruburu', 'Umoja', 'Kasarani',
  'Kiambu', 'Mombasa', 'Nyali', 'Bamburi', 'Kisumu', 'Milimani', 'Eldoret',
  'Nakuru', 'Naivasha', 'Machakos', 'Athi River', 'Kitengela', 'Nyeri', 'Kakamega',
]

export default function ListingsPage() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    getAvailableProperties()
      .then(data => {
        setProperties(Array.isArray(data) ? data : data.properties || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Build unique location suggestions from property data + common Kenyan areas
  const allLocations = () => {
    const fromProps = properties
      .map(p => p.location)
      .filter(Boolean)
      .map(l => l.trim())
    const combined = [...new Set([...KENYAN_AREAS, ...fromProps])]
    return combined.sort((a, b) => a.localeCompare(b))
  }

  const handleLocationChange = (val) => {
    setLocation(val)
    const q = val.toLowerCase()
    if (!q) { setLocationSuggestions([]); return }
    const matches = allLocations().filter(l => l.toLowerCase().includes(q)).slice(0, 8)
    setLocationSuggestions(matches)
  }

  const pickLocation = (val) => {
    setLocation(val)
    setLocationSuggestions([])
  }

  const filtered = properties.filter(p => {
    const matchSearch = !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    const matchLocation = !location || (p.location || '').toLowerCase().includes(location.toLowerCase())
    const matchType = typeFilter === 'ALL' || (p.property_type || '').toLowerCase() === typeFilter.toLowerCase()
    const rent = Number(p.rent_per_month) || 0
    const minOk = !priceRange.min || rent >= Number(priceRange.min)
    const maxOk = !priceRange.max || rent <= Number(priceRange.max)
    return matchSearch && matchLocation && matchType && minOk && maxOk
  })

  // Helper: resolve photo for a property (backend photo/photos field OR locally uploaded base64)
  const getPhoto = (p) => {
    if (p?.photo) return p.photo
    if (p?.photos && Array.isArray(p.photos) && p.photos.length) return p.photos[0]
    if (p?.image) return p.image
    const local = localStorage.getItem(`prop_img_${p?.id}`)
    return local || null
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
            <Link to="/houses/register" className="hidden sm:block text-sm font-semibold text-teal-700 border-2 border-teal-200 px-4 py-2 rounded-xl hover:border-teal-400 hover:bg-teal-50 transition-all">
              <i className="bi bi-person-plus mr-1"></i>Create Account
            </Link>
            <Link to="/login" className="px-5 py-2 text-sm font-semibold text-white rounded-xl btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 py-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Find Your <span className="gradient-text">Next Home</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
            Browse available rental houses across Kenya — free. Create an account and sign in to unlock full details & contact landlords directly.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <i className="bi bi-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by property name or description..."
                className="w-full pl-14 pr-24 py-4 rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 text-base focus:outline-none focus:border-teal-400 transition-all"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                <i className="bi bi-sliders"></i>
                Filters
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="max-w-2xl mx-auto mt-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 animate-fade-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-left">Location</label>
                  <div className="relative">
                    <i className="bi bi-geo-alt absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                    <input
                      type="text"
                      value={location}
                      onChange={e => handleLocationChange(e.target.value)}
                      onFocus={e => handleLocationChange(e.target.value)}
                      placeholder="e.g. Westlands"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/20 border border-white/20 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-teal-400"
                    />
                    {locationSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl overflow-hidden z-30 text-left animate-fade-in">
                        {locationSuggestions.map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => pickLocation(s)}
                            className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 flex items-center gap-2 transition-colors"
                          >
                            <i className="bi bi-geo-alt text-teal-500 text-xs"></i> {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-left">House Type</label>
                  <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/20 border border-white/20 text-white text-sm focus:outline-none focus:border-teal-400"
                  >
                    {PROPERTY_TYPES.map(t => (
                      <option key={t} value={t} className="text-gray-900">{t === 'ALL' ? 'All Types' : t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-left">Min Rent (KSh)</label>
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={e => setPriceRange(p => ({ ...p, min: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/20 border border-white/20 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-left">Max Rent (KSh)</label>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={e => setPriceRange(p => ({ ...p, max: e.target.value }))}
                    placeholder="Any"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/20 border border-white/20 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>
              <button
                onClick={() => { setSearch(''); setLocation(''); setLocationSuggestions([]); setTypeFilter('ALL'); setPriceRange({ min: '', max: '' }) }}
                className="mt-3 text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <i className="bi bi-arrow-counterclockwise"></i> Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Results ── */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {loading ? 'Searching...' : `${filtered.length} property${filtered.length !== 1 ? 'ies' : 'y'} available`}
          </p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <i className="bi bi-building text-6xl block mb-4 opacity-30"></i>
            <p className="text-lg font-medium">No properties found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(p => (
              <Link
                key={p.id}
                to={`/houses/${p.id}`}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
              >
                {/* Property image (uploaded photo or placeholder) */}
                <div className="h-44 bg-gradient-to-br from-teal-500/20 to-cyan-400/20 relative overflow-hidden">
                  {getPhoto(p) ? (
                    <img
                      src={getPhoto(p)}
                      alt={p.title || 'Property'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <i className="bi bi-building text-5xl text-teal-500/30"></i>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge status={p.status || 'AVAILABLE'} />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-20"></div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="text-lg font-bold">KSh {Number(p.rent_per_month).toLocaleString()}</p>
                    <p className="text-xs text-white/80">per month</p>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-teal-600 transition-colors truncate">
                    {p.title || 'Untitled Property'}
                  </h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                    <i className="bi bi-geo-alt text-teal-500"></i>
                    {p.location || 'Location not specified'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {(p.property_type || p.house_type) && (
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full">{p.property_type || p.house_type}</span>
                    )}
                    {p.bedrooms && (
                      <span className="flex items-center gap-1">
                        <i className="bi bi-door-open"></i> {p.bedrooms} bed{p.bedrooms > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {/* Locked indicator for non-authenticated browsers */}
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-600">
                    <i className="bi bi-lock-fill text-xs"></i>
                    Details unlock after sign-up
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100 py-8 px-6 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>© 2025 SmartRent. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/houses/register" className="hover:text-teal-600 transition-colors">Create Account</Link>
            <Link to="/" className="hover:text-teal-600 transition-colors">Landlord Portal</Link>
            <Link to="/login" className="hover:text-teal-600 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

