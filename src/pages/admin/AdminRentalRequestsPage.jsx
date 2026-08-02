import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { convertLeadToTenant } from '../../services/houseHuntingService'
import { PageHeader, SearchBar, FilterTabs, Badge, EmptyState, LoadingSpinner, Modal, Table, Tr, Td, ActionBtn } from '../../components/ui'

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
]

export default function AdminRentalRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [converting, setConverting] = useState(false)
  const [convertedInfo, setConvertedInfo] = useState(null)

  useEffect(() => {
    api.get('core/rental-requests/')
      .then(r => setRequests(r.data.rental_requests || r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(`core/rental-requests/${id}/`, { status })
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status, ...(res.data?.rental_request || {}) } : r))
      // If approval auto-converted a lead into a tenant, show the result
      if (res.data?.rental_request?.converted_tenant) {
        setConvertedInfo(res.data.rental_request.converted_tenant)
        setNotice(res.data.rental_request.converted_tenant.message)
      } else if (status === 'APPROVED') {
        setNotice(`Request #${id} approved — applicant now has tenant privileges.`)
      }
    } catch (err) { alert(err.response?.data?.error || 'Failed to update') }
  }

  const handleConvert = async (r) => {
    if (!window.confirm(
      r.tenant
        ? `This request is already linked to tenant "${r.tenant_name || r.lead_name}".`
        : `Grant the existing account (or create one if none) for "${r.lead_name || r.tenant_name || 'this applicant'}" tenant privileges?`
    )) return
    setConverting(true)
    try {
      const res = await convertLeadToTenant(r.id, 'admin')
      setConvertedInfo(res)
      setNotice(res.message)
      const fresh = await api.get('core/rental-requests/')
      setRequests(fresh.data.rental_requests || fresh.data || [])
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to convert to tenant')
    } finally {
      setConverting(false)
    }
  }

  const filtered = requests.filter(r => {
    const q = search.toLowerCase()
    return (filter === 'ALL' || r.status === filter) &&
      (!q || (r.tenant_name || r.lead_name || '').toLowerCase().includes(q) || (r.property_title || '').toLowerCase().includes(q) || (r.lead_phone || '').includes(q))
  })

  const pending = requests.filter(r => r.status === 'PENDING').length

  return (
    <div className="p-6 animate-fade-up">
      <PageHeader
        title="Rental Requests"
        subtitle={pending > 0 ? `${pending} pending review` : `${requests.length} total`}
      />

      {notice && (
        <div className="mb-5 flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl animate-fade-in">
          <i className="bi bi-check-circle-fill text-green-500"></i>
          <p className="text-sm text-green-700 font-medium">{notice}</p>
          <button onClick={() => setNotice('')} className="ml-auto text-green-500 hover:text-green-700">
            <i className="bi bi-x-lg text-sm"></i>
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="sm:w-72">
          <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applicant or property..." />
        </div>
        <FilterTabs options={FILTERS} active={filter} onChange={setFilter} />
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon="bi-envelope" message="No rental requests found." />
      ) : (
        <Table headers={['Applicant', 'Contact', 'Property', 'Message', 'Date', 'Status', 'Actions']}>
          {filtered.map(r => (
            <Tr key={r.id}>
              <Td>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold shrink-0">
                    {(r.tenant_name || r.lead_name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">{r.tenant_name || r.lead_name || '—'}</span>
                    <div className="text-xs text-gray-400 mt-0.5 space-y-0.5">
                      {r.tenant_id_number && <p className="flex items-center gap-1"><i className="bi bi-credit-card-2-front"></i>ID: {r.tenant_id_number}</p>}
                    </div>
                  </div>
                </div>
              </Td>
              <Td>
                <div className="text-xs text-gray-500 space-y-1">
                  {(r.tenant_phone || r.lead_phone) && <p className="flex items-center gap-1"><i className="bi bi-telephone text-teal-500"></i>{r.tenant_phone || r.lead_phone}</p>}
                  {(r.tenant_email || r.lead_email) && <p className="flex items-center gap-1"><i className="bi bi-envelope text-teal-500"></i>{r.tenant_email || r.lead_email}</p>}
                  {!r.tenant_phone && !r.lead_phone && !r.tenant_email && !r.lead_email && <span className="text-gray-300">—</span>}
                </div>
              </Td>
              <Td className="text-gray-500">{r.property_title || '—'}</Td>
              <Td className="max-w-[180px] truncate text-gray-400">{r.message || '—'}</Td>
              <Td className="text-gray-400 whitespace-nowrap">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</Td>
              <Td><Badge status={r.status} /></Td>
              <Td>
                <div className="flex gap-1.5 flex-wrap">
                  {r.tenant ? (
                    <span className="inline-flex px-2 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-100 rounded-lg whitespace-nowrap">
                      <i className="bi bi-person-check-fill mr-1"></i>Tenant account
                    </span>
                  ) : (
                    <ActionBtn variant="amber" onClick={() => handleConvert(r)} disabled={converting}>
                      <i className="bi bi-person-plus-fill mr-1"></i>Grant Tenant Privileges
                    </ActionBtn>
                  )}
                  {r.status === 'PENDING' && (
                    <>
                      <ActionBtn variant="green" onClick={() => updateStatus(r.id, 'APPROVED')}>Approve</ActionBtn>
                      <ActionBtn variant="red" onClick={() => updateStatus(r.id, 'REJECTED')}>Reject</ActionBtn>
                    </>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      )}

      {/* Conversion result modal */}
      {convertedInfo && (
        <Modal title="Tenant Privileges Granted" onClose={() => setConvertedInfo(null)}>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-teal-50 border border-teal-100 rounded-2xl">
              <i className="bi bi-person-check-fill text-2xl text-teal-600 mt-0.5"></i>
              <div>
                <p className="font-bold text-gray-900">{convertedInfo.tenant?.full_name || 'Tenant'}</p>
                <p className="text-sm text-teal-700 mt-0.5">{convertedInfo.message}</p>
              </div>
            </div>

            {convertedInfo.reused_existing ? (
              <div className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
                <i className="bi bi-key-fill text-teal-500 mr-1"></i>
                Existing account reused — they keep their current email &amp; password and can now log in and manage their applications.
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <p className="font-bold text-gray-700 flex items-center gap-1.5">
                  <i className="bi bi-shield-lock-fill text-teal-500"></i> Share these login details
                </p>
                <div className="space-y-1.5">
                  <p className="flex items-center gap-2 text-gray-600">
                    <span className="w-24 text-gray-400"><i className="bi bi-envelope mr-1 text-xs"></i>Email</span>
                    <span className="font-medium">{convertedInfo.login_email}</span>
                  </p>
                  <p className="flex items-center gap-2 text-gray-600">
                    <span className="w-24 text-gray-400"><i className="bi bi-telephone mr-1 text-xs"></i>Phone</span>
                    <span className="font-medium">{convertedInfo.login_phone}</span>
                  </p>
                  <p className="flex items-center gap-2 text-gray-600">
                    <span className="w-24 text-gray-400"><i className="bi bi-key mr-1 text-xs"></i>Password</span>
                    <span className="font-mono font-semibold text-teal-700">{convertedInfo.generated_password}</span>
                  </p>
                </div>
                <p className="text-xs text-gray-400 pt-2 border-t border-gray-200">
                  They can sign in at the house-hunting portal and track this application.
                </p>
              </div>
            )}
            <button className="btn-primary w-full py-2.5 text-sm" onClick={() => setConvertedInfo(null)}>
              Done
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

