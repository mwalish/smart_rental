import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { PageHeader, SearchBar, Badge, EmptyState, LoadingSpinner, Modal, Table, Tr, Td, ActionBtn } from '../../components/ui'

export default function TenantsPage() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextPage, setNextPage] = useState(null)
  const [search, setSearch] = useState('')
  const [viewing, setViewing] = useState(null)

  // landlord/tenants/ is now paginated server-side (page_size=20), returned
  // as { tenants, count, next, previous }. `next` is a full URL — pass it
  // straight to api.get() for "Load more".
  useEffect(() => {
    api.get('landlord/tenants/')
      .then(r => {
        setTenants(r.data.tenants || r.data || [])
        setNextPage(r.data?.next || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const loadMore = async () => {
    if (!nextPage || loadingMore) return
    setLoadingMore(true)
    try {
      const r = await api.get(nextPage)
      setTenants(prev => [...prev, ...(r.data.tenants || r.data || [])])
      setNextPage(r.data?.next || null)
    } catch (e) { console.error(e) } finally { setLoadingMore(false) }
  }

  const filtered = tenants.filter(t => {
    const q = search.toLowerCase()
    return !q || (t.full_name || '').toLowerCase().includes(q) || (t.email || t.email_address || '').toLowerCase().includes(q) || (t.phone_number || t.phone || '').includes(q) || (t.property_title || '').toLowerCase().includes(q)
  })

  return (
    <div className="p-6 animate-fade-up">
      <PageHeader
        title="Tenants"
        subtitle={`${tenants.length} total`}
      />

      <div className="sm:w-72 mb-5">
        <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, phone, property..." />
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon="bi-people" message={tenants.length === 0 ? 'No tenants registered yet. Register a tenant to get started.' : 'No tenants match your search.'} />
      ) : (
        <Table headers={['Name', 'Email', 'Phone', 'Property', 'Status', 'Actions']}>
          {filtered.map(t => (
            <Tr key={t.id}>
              <Td>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {(t.full_name || '?')[0].toUpperCase()}
                  </div>
                  <span className="font-semibold text-gray-900">{t.full_name || '—'}</span>
                </div>
              </Td>
              <Td className="text-gray-500">{t.email || t.email_address || '—'}</Td>
              <Td className="text-gray-500">{t.phone_number || t.phone || '—'}</Td>
              <Td className="text-gray-500">{t.property_title || '—'}</Td>
              <Td><Badge status={t.status || 'ACTIVE'} /></Td>
              <Td>
                <div className="flex gap-1.5">
                  <ActionBtn variant="blue" onClick={() => setViewing(t)}>
                    <i className="bi bi-eye mr-1"></i>View
                  </ActionBtn>
                  <ActionBtn variant="amber" onClick={() => window.location.href = `mailto:${t.email || t.email_address || ''}?subject=SmartRent%20-%20Property%20Update`}>
                    <i className="bi bi-envelope mr-1"></i>Contact
                  </ActionBtn>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      )}

      {nextPage && !loading && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
          >
            {loadingMore ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}

      {/* Tenant Detail Modal */}
      {viewing && (
        <Modal title="Tenant Details" onClose={() => setViewing(null)}>
          <div className="text-center mb-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white text-xl font-bold mx-auto mb-3 shadow-md">
              {(viewing.full_name || '?')[0].toUpperCase()}
            </div>
            <h3 className="text-lg font-black text-gray-900">{viewing.full_name || '—'}</h3>
            {viewing.property_title && <p className="text-sm text-gray-400 mt-0.5">{viewing.property_title}</p>}
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <i className="bi bi-envelope text-teal-500"></i>
              <span className="text-gray-500 w-16 shrink-0 text-xs font-semibold uppercase">Email</span>
              <a href={`mailto:${viewing.email || viewing.email_address}`} className="text-gray-800 font-medium break-all hover:text-teal-600">
                {viewing.email || viewing.email_address || '—'}
              </a>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <i className="bi bi-telephone text-teal-500"></i>
              <span className="text-gray-500 w-16 shrink-0 text-xs font-semibold uppercase">Phone</span>
              <a href={`tel:${viewing.phone_number || viewing.phone}`} className="text-gray-800 font-medium hover:text-teal-600">
                {viewing.phone_number || viewing.phone || '—'}
              </a>
            </div>
            {(viewing.alternative_phone) && (
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <i className="bi bi-telephone-outbound text-teal-500"></i>
                <span className="text-gray-500 w-16 shrink-0 text-xs font-semibold uppercase">Alt Phone</span>
                <a href={`tel:${viewing.alternative_phone}`} className="text-gray-800 font-medium hover:text-teal-600">{viewing.alternative_phone}</a>
              </div>
            )}
            {viewing.id_number && (
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <i className="bi bi-credit-card-2-front text-teal-500"></i>
                <span className="text-gray-500 w-16 shrink-0 text-xs font-semibold uppercase">ID No.</span>
                <span className="text-gray-800 font-medium">{viewing.id_number}</span>
              </div>
            )}
            {viewing.join_date && (
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <i className="bi bi-calendar-check text-teal-500"></i>
                <span className="text-gray-500 w-16 shrink-0 text-xs font-semibold uppercase">Joined</span>
                <span className="text-gray-800 font-medium">{viewing.join_date}</span>
              </div>
            )}
            {viewing.created_at && (
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <i className="bi bi-clock-history text-teal-500"></i>
                <span className="text-gray-500 w-16 shrink-0 text-xs font-semibold uppercase">Added</span>
                <span className="text-gray-800 font-medium">{new Date(viewing.created_at).toLocaleDateString()}</span>
              </div>
            )}
            {viewing.user_email && (
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <i className="bi bi-person-badge text-teal-500"></i>
                <span className="text-gray-500 w-16 shrink-0 text-xs font-semibold uppercase">Account</span>
                <span className="text-gray-800 font-medium">{viewing.user_email}</span>
              </div>
            )}
            {viewing.registered_by_name && (
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <i className="bi bi-person-plus-fill text-teal-500"></i>
                <span className="text-gray-500 w-16 shrink-0 text-xs font-semibold uppercase">Registered By</span>
                <span className="text-gray-800 font-medium">{viewing.registered_by_name}</span>
              </div>
            )}
            {viewing.status && (
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <i className="bi bi-shield-check text-teal-500"></i>
                <span className="text-gray-500 w-16 shrink-0 text-xs font-semibold uppercase">Status</span>
                <span className="text-gray-800 font-medium">{viewing.status}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={() => setViewing(null)} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Close</button>
            <a href={`tel:${viewing.phone_number || viewing.phone}`} className="flex-1 py-2.5 text-sm btn-primary text-center">
              <i className="bi bi-telephone-fill mr-1"></i> Call Tenant
            </a>
          </div>
        </Modal>
      )}
    </div>
  )
}
