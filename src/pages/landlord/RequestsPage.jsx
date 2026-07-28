import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { PageHeader, SearchBar, FilterTabs, Badge, EmptyState, LoadingSpinner, Table, Tr, Td, ActionBtn } from '../../components/ui'

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
]

export default function RequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('landlord/rental-requests/')
      .then(r => setRequests(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`landlord/rental-requests/${id}/`, { status })
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    } catch (err) { alert(err.response?.data?.error || 'Failed to update') }
  }

  const filtered = requests.filter(r => {
    const q = search.toLowerCase()
    return (filter === 'ALL' || r.status === filter) &&
      (!q || (r.tenant_name || '').toLowerCase().includes(q) || (r.property_title || '').toLowerCase().includes(q))
  })

  const pending = requests.filter(r => r.status === 'PENDING').length

  return (
    <div className="p-6 animate-fade-up">
      <PageHeader
        title="Rental Requests"
        subtitle={pending > 0 ? `${pending} pending review` : `${requests.length} total`}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="sm:w-72">
          <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applicant or property..." />
        </div>
        <FilterTabs options={FILTERS} active={filter} onChange={setFilter} />
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon="bi-envelope" message="No rental requests found." />
      ) : (
        <Table headers={['Applicant', 'Property', 'Message', 'Date', 'Status', 'Actions']}>
          {filtered.map(r => (
            <Tr key={r.id}>
              <Td>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold shrink-0">
                    {(r.tenant_name || '?')[0].toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-900">{r.tenant_name || '—'}</span>
                </div>
              </Td>
              <Td className="text-gray-500">{r.property_title || '—'}</Td>
              <Td className="max-w-[180px] truncate text-gray-400">{r.message || '—'}</Td>
              <Td className="text-gray-400 whitespace-nowrap">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</Td>
              <Td><Badge status={r.status} /></Td>
              <Td>
                {r.status === 'PENDING' && (
                  <div className="flex gap-1.5">
                    <ActionBtn variant="green" onClick={() => updateStatus(r.id, 'APPROVED')}>Approve</ActionBtn>
                    <ActionBtn variant="red" onClick={() => updateStatus(r.id, 'REJECTED')}>Reject</ActionBtn>
                  </div>
                )}
              </Td>
            </Tr>
          ))}
        </Table>
      )}
    </div>
  )
}
