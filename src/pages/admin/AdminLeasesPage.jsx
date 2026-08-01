import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { PageHeader, SearchBar, Badge, EmptyState, LoadingSpinner, Table, Tr, Td, FilterTabs } from '../../components/ui'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'EXPIRED', label: 'Expired' },
  { key: 'TERMINATED', label: 'Terminated' },
]

export default function AdminLeasesPage() {
  const [leases, setLeases] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')

  useEffect(() => {
    api.get('core/leases/')
      .then(r => setLeases(r.data.leases || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = leases.filter(l => {
    const matchTab = tab === 'all' || l.status === tab
    const q = search.toLowerCase()
    const matchSearch = !q ||
      l.property_title?.toLowerCase().includes(q) ||
      l.tenant_name?.toLowerCase().includes(q)
    return matchTab && matchSearch
  })

  return (
    <div className="p-6 animate-fade-up">
      <PageHeader title="All Leases" subtitle={`${leases.length} total`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1"><SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by property or tenant..." /></div>
        <FilterTabs options={TABS} active={tab} onChange={setTab} />
      </div>

      {loading ? <LoadingSpinner /> : (
        <Table
          headers={['Tenant', 'Property', 'Monthly Rent', 'Start', 'End', 'Status']}
          empty={filtered.length === 0 && <EmptyState icon="bi-file-earmark-text" message="No leases found." />}
        >
          {filtered.map(l => (
            <Tr key={l.id}>
              <Td>{l.tenant_name || l.tenant || '—'}</Td>
              <Td>{l.property_title || l.property || '—'}</Td>
              <Td>KSh {Number(l.monthly_rent).toLocaleString()}</Td>
              <Td>{l.start_date}</Td>
              <Td>{l.end_date}</Td>
              <Td><Badge status={l.status} /></Td>
            </Tr>
          ))}
        </Table>
      )}
    </div>
  )
}
