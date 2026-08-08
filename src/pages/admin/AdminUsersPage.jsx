import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { toAbsoluteMedia } from '../../config'
import { PageHeader, SearchBar, Badge, EmptyState, LoadingSpinner, Table, Tr, Td, FilterTabs } from '../../components/ui'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'admin', label: 'Admins' },
  { key: 'landlord', label: 'Landlords' },
  { key: 'tenant', label: 'Tenants' },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')

  useEffect(() => {
    api.get('core/admin/users/')
      .then(r => setUsers(r.data.users || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u => {
    const matchTab = tab === 'all' || u.role === tab
    const q = search.toLowerCase()
    const matchSearch = !q || u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.phone_number?.includes(q)
    return matchTab && matchSearch
  })

  return (
    <div className="p-6 animate-fade-up">
      <PageHeader title="All Users" subtitle={`${users.length} total system users`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1"><SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email, username or phone..." /></div>
        <FilterTabs options={TABS} active={tab} onChange={setTab} />
      </div>

      {loading ? <LoadingSpinner /> : (
        <Table
          headers={['User', 'Role', 'Phone', 'Joined', 'Status']}
          empty={filtered.length === 0 && <EmptyState icon="bi-people" message="No users found." />}
        >
          {filtered.map(u => (
            <Tr key={u.id}>
              <Td>
                <div className="flex items-center gap-3">
                  {u.profile_picture ? (
<img src={toAbsoluteMedia(u.profile_picture)} alt={u.full_name || u.username} className="w-8 h-8 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-300 flex items-center justify-center font-bold text-white text-xs shrink-0">
                      {(u.full_name || u.username || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{u.full_name || u.username}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>
              </Td>
              <Td><Badge status={u.role?.toUpperCase()} /></Td>
              <Td>{u.phone_number || '—'}</Td>
              <Td>{new Date(u.date_joined).toLocaleDateString('en-GB')}</Td>
              <Td>
                <span className={`badge ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {u.is_active ? 'Active' : 'Inactive'}
                </span>
              </Td>
            </Tr>
          ))}
        </Table>
      )}
    </div>
  )
}
