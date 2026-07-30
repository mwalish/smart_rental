import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAvailableProperties } from '../../services/houseHuntingService'
import { LoadingSpinner, Badge } from '../../components/ui'

const PROPERTY_TYPES = ['ALL', 'Apartment', 'House', 'Bedsitter', 'Studio', 'Commercial']

export default function ListingsPage() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
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

  const filtered = properties.filter(p => {
    const matchSearch = !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'ALL' || p.property_type === typeFilter
    const rent = Number(p.rent_per_month) || 0
    const minOk = !priceRange.min || rent >= Number(priceRange.min)
    const maxOk = !priceRange.max || rent <= Number(priceRange.max)
    return matchSearch && matchType && minOk && maxOk
  })

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
            <Link to="/houses/register" className="px-4 py-2 text-sm font-semibold text-teal-700 border-2 border-teal-200 rounded-xl hover:border-teal-400 hover:bg-teal-50 transition-all">
              Sign Up as Tenant
            </Link>
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-white rounded-xl btn-primary">
              Landlord Login
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
            Browse available rental properties across Kenya. No account needed to explore — register only when you're ready to apply.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <i className="bi bi-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by location, property name or description..."
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-left">Property Type</label>
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
                onClick={() => { setSearch(''); setTypeFilter('ALL'); setPriceRange({ min: '', max: '' }) }}
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
                {/* Image placeholder */}
                <div className="h-44 bg-gradient-to-br from-teal-500/20 to-cyan-400/20 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="bi bi-building text-5xl text-teal-500/30"></i>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge status={p.status || 'AVAILABLE'} />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent h-20"></div>
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
                    {p.property_type && (
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full">{p.property_type}</span>
                    )}
                    {p.bedrooms && (
                      <span className="flex items-center gap-1">
                        <i className="bi bi-door-open"></i> {p.bedrooms} bed{p.bedrooms > 1 ? 's' : ''}
                      </span>
                    )}
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
            <Link to="/" className="hover:text-teal-600 transition-colors">Landlord Portal</Link>
            <Link to="/houses/register" className="hover:text-teal-600 transition-colors">Tenant Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

