import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { PageHeader, SearchBar, Badge, EmptyState, LoadingSpinner, Table, Tr, Td, FilterTabs, ActionBtn } from '../../components/ui'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'FAILED', label: 'Failed' },
]

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')

  const load = () => {
    api.get('core/payments/')
      .then(r => { setPayments(r.data.payments || []); setSummary(r.data.summary) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleVerify = async (id, status) => {
    try {
      await api.put(`core/payments/${id}/verify/`, { status })
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to verify payment')
    }
  }

  const filtered = payments.filter(p => {
    const matchTab = tab === 'all' || p.status === tab
    const q = search.toLowerCase()
    const matchSearch = !q || String(p.id).includes(q) || p.method?.toLowerCase().includes(q)
    return matchTab && matchSearch
  })

  return (
    <div className="p-6 animate-fade-up">
      <PageHeader title="All Payments" subtitle={`${payments.length} total`} />

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Total Collected', value: `KSh ${Number(summary.total_paid).toLocaleString()}`, color: 'text-green-600' },
            { label: 'Pending', value: `KSh ${Number(summary.total_pending).toLocaleString()}`, color: 'text-amber-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1"><SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID or method..." /></div>
        <FilterTabs options={TABS} active={tab} onChange={setTab} />
      </div>

      {loading ? <LoadingSpinner /> : (
        <Table
          headers={['ID', 'Amount', 'Method', 'Status', 'Date', 'Actions']}
          empty={filtered.length === 0 && <EmptyState icon="bi-cash-stack" message="No payments found." />}
        >
          {filtered.map(p => (
            <Tr key={p.id}>
              <Td>#{p.id}</Td>
              <Td>KSh {Number(p.amount).toLocaleString()}</Td>
              <Td>{p.method}</Td>
              <Td><Badge status={p.status} /></Td>
              <Td>{p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB') : '—'}</Td>
              <Td>
                {p.status === 'PENDING' && (
                  <div className="flex gap-1">
                    <ActionBtn variant="green" onClick={() => handleVerify(p.id, 'COMPLETED')}>Verify</ActionBtn>
                    <ActionBtn variant="red" onClick={() => handleVerify(p.id, 'FAILED')}>Fail</ActionBtn>
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
