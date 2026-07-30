import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../AuthContext'
import { getMyRequests, withdrawRequest } from '../../services/houseHuntingService'
import { PageHeader, FilterTabs, Badge, EmptyState, LoadingSpinner, Table, Tr, Td, ActionBtn } from '../../components/ui'

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
]

export default function MyRequestsPage() {
  const { profile } = useContext(AuthContext)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  const load = async () => {
    try {
      const data = await getMyRequests()
      setRequests(data.rental_requests || data.results || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleWithdraw = async (id) => {
    if (!window.confirm('Withdraw this application?')) return
    try {
      await withdrawRequest(id)
      setRequests(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      alert(err.response?.data?.error || 'Cannot withdraw at this time')
    }
  }

  const filtered = requests.filter(r => filter === 'ALL' || r.status === filter)

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title="My Applications"
        subtitle={profile?.full_name}
        action={
          <Link to="/houses" className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
            <i className="bi bi-plus-lg"></i> Browse Properties
          </Link>
        }
      />

      <FilterTabs options={FILTERS} active={filter} onChange={setFilter} />

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="bi-envelope"
          message={filter === 'ALL' ? 'You haven\'t applied for any properties yet.' : `No ${filter.toLowerCase()} applications`}
        />
      ) : (
        <Table
          headers={['Property', 'Location', 'Message', 'Status', 'Date', 'Actions']}
          empty={null}
        >
          {filtered.map(r => (
            <Tr key={r.id}>
              <Td className="font-semibold text-gray-900">{r.property_title || '—'}</Td>
              <Td className="text-gray-400">{r.property_location || '—'}</Td>
              <Td className="max-w-[160px] truncate text-gray-400">{r.message || '—'}</Td>
              <Td><Badge status={r.status} /></Td>
              <Td className="text-gray-400 whitespace-nowrap">
                {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
              </Td>
              <Td>
                {r.status === 'PENDING' && (
                  <ActionBtn variant="red" onClick={() => handleWithdraw(r.id)}>
                    Withdraw
                  </ActionBtn>
                )}
                {r.status === 'APPROVED' && (
                  <span className="text-xs text-green-600 font-medium">🎉 Approved!</span>
                )}
              </Td>
            </Tr>
          ))}
        </Table>
      )}
    </div>
  )
}
