import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { PageHeader, SearchBar, Badge, EmptyState, LoadingSpinner, Table, Tr, Td, FilterTabs, ActionBtn } from '../../components/ui'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'COMPLETED', label: 'Completed' },
]

export default function AdminMaintenancePage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')

  const load = () => {
    api.get('core/maintenance/')
      .then(r => setRequests(r.data.maintenance_requests || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleStatus = async (id, status) => {
    try {
      await api.put(`core/maintenance/${id}/`, { status })
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update')
    }
  }

  const filtered = requests.filter(r => {
    const matchTab = tab === 'all' || r.status === tab
    const q = search.toLowerCase()
    const matchSearch = !q || r.description?.toLowerCase().includes(q) || r.issue_type?.toLowerCase().includes(q)
    return matchTab && matchSearch
  })

  return (
    <div className="p-6 animate-fade-up">
      <PageHeader title="Maintenance Requests" subtitle={`${requests.length} total`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1"><SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by issue or description..." /></div>
        <FilterTabs options={TABS} active={tab} onChange={setTab} />
      </div>

      {loading ? <LoadingSpinner /> : (
        <Table
          headers={['Issue', 'Description', 'Status', 'Date', 'Actions']}
          empty={filtered.length === 0 && <EmptyState icon="bi-tools" message="No maintenance requests found." />}
        >
          {filtered.map(r => (
            <Tr key={r.id}>
              <Td><span className="font-semibold">{r.issue_type || '—'}</span></Td>
              <Td><span className="line-clamp-1 max-w-xs block">{r.description}</span></Td>
              <Td><Badge status={r.status} /></Td>
              <Td>{r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB') : '—'}</Td>
              <Td>
                <div className="flex gap-1">
                  {r.status === 'PENDING' && <ActionBtn variant="blue" onClick={() => handleStatus(r.id, 'IN_PROGRESS')}>Start</ActionBtn>}
                  {r.status === 'IN_PROGRESS' && <ActionBtn variant="green" onClick={() => handleStatus(r.id, 'COMPLETED')}>Complete</ActionBtn>}
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      )}
    </div>
  )
}
