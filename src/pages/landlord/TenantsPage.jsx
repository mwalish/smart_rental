import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { PageHeader, SearchBar, Badge, EmptyState, LoadingSpinner, Table, Tr, Td, ActionBtn } from '../../components/ui'

export default function TenantsPage() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('landlord/tenants/')
      .then(r => setTenants(r.data.tenants || r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

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
                  <ActionBtn variant="blue">
                    <i className="bi bi-eye mr-1"></i>View
                  </ActionBtn>
                  <ActionBtn variant="amber">
                    <i className="bi bi-envelope mr-1"></i>Contact
                  </ActionBtn>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      )}
    </div>
  )
}
