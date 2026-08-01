import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { PageHeader, SearchBar, FilterTabs, Badge, EmptyState, LoadingSpinner, Table, Tr, Td, ActionBtn } from '../../components/ui'

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'COMPLETED', label: 'Completed' },
]

export default function LandlordMaintenancePage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('core/maintenance/')
      .then(r => setRequests(r.data.maintenance_requests || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id, status) => {
    try {
      await api.put(`core/maintenance/${id}/`, { status })
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    } catch (err) { alert(err.response?.data?.error || 'Failed to update') }
  }
  const deleteReq = async (id) => {
    if (!window.confirm('Delete this request?')) return
    try { await api.delete(`core/maintenance/${id}/`); setRequests(prev => prev.filter(r => r.id !== id)) }
    catch (err) { alert(err.response?.data?.error || 'Cannot delete') }
  }

  const filtered = requests.filter(r => {
    const q = search.toLowerCase()
    const matchStatus = filter === 'ALL' || r.status?.toUpperCase() === filter
    const matchSearch = !q || (r.tenant_name || '').toLowerCase().includes(q) || (r.property_title || '').toLowerCase().includes(q) || (r.issue || '').toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  return (
    <div className="p-6 animate-fade-up">
      <PageHeader title="Maintenance Requests" subtitle={`${requests.length} total requests`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="sm:w-72">
          <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tenant, property, issue..." />
        </div>
        <FilterTabs options={FILTERS} active={filter} onChange={setFilter} />
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon="bi-tools" message="No maintenance requests found." />
      ) : (
        <Table headers={['Tenant', 'Property', 'Issue', 'Date', 'Status', 'Actions']}>
          {filtered.map(r => (
            <Tr key={r.id}>
              <Td>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold shrink-0">
                    {(r.tenant_name || '?')[0].toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-900">{r.tenant_name || '—'}</span>
                </div>
              </Td>
              <Td className="text-gray-500">{r.property_title || '—'}</Td>
              <Td className="max-w-[200px] truncate font-medium">{r.issue || '—'}</Td>
              <Td className="text-gray-400 whitespace-nowrap">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</Td>
              <Td><Badge status={r.status || 'pending'} /></Td>
              <Td>
                <div className="flex gap-1.5 flex-wrap">
                  {r.status !== 'IN_PROGRESS' && r.status !== 'COMPLETED' && <ActionBtn variant="blue" onClick={() => updateStatus(r.id, 'IN_PROGRESS')}>Start</ActionBtn>}
                  {r.status !== 'COMPLETED' && <ActionBtn variant="green" onClick={() => updateStatus(r.id, 'COMPLETED')}>Complete</ActionBtn>}
                  <ActionBtn variant="red" onClick={() => deleteReq(r.id)}>Delete</ActionBtn>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      )}
    </div>
  )
}

