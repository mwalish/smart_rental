import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function LandlordMaintenancePage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const [activeFilter, setActiveFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // ✅ EXACT PATH: baseURL = /api/ → add core/maintenance/
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('core/maintenance/')
        console.log('✅ SUCCESS! Data:', res.data)
        setRequests(res.data.maintenance_requests || [])
      } catch (err) {
        console.error('❌ Error:', err)
        console.error('❌ Called URL:', err.config?.baseURL + err.config?.url)
        alert('Check you are logged in — path is now correct!')
        
        
      }
       finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const filtered = requests.filter(r => {
    const tenant = String(r.tenant_name || '').toLowerCase()
    const property = String(r.property_title || '').toLowerCase()
    const issue = String(r.issue || '').toLowerCase()
    const q = searchQuery.toLowerCase()
    const matchStatus = activeFilter === 'ALL' || String(r.status||'').toUpperCase() === activeFilter
    const matchSearch = !searchQuery || tenant.includes(q) || property.includes(q) || issue.includes(q)
    return matchStatus && matchSearch
  })

  // ✅ Update: core/maintenance/<id>/
  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`core/maintenance/${id}/`, { status: newStatus })
      setRequests(p => p.map(r => r.id === id ? {...r, status: newStatus} : r))
      alert(`Marked as ${newStatus.replace('_',' ')}`)
    } catch (err) {
      alert(err.response?.data?.error || 'Update failed')
    }
  }

  // ✅ Delete: core/maintenance/<id>/
  const deleteRequest = async (id) => {
    if (!window.confirm('Delete permanently?')) return
    try {
      await api.delete(`core/maintenance/${id}/`)
      setRequests(p => p.filter(r => r.id !== id))
      alert('Deleted')
    } catch (err) {
      alert(err.response?.data?.error || 'Delete not allowed')
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={()=>navigate('/landlord/dashboard')} className="px-3 py-1.5 text-sm bg-gray-100 rounded">← Back</button>
        <h2 className="text-2xl font-bold">Maintenance Requests</h2>
      </div>

      <div className="flex justify-center mb-4">
        <div className="w-full sm:max-w-md">
          <div className="relative">
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input type="text" placeholder="Search tenant, property or issue..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {[{k:'ALL',l:'All'},{k:'PENDING',l:'Pending'},{k:'IN_PROGRESS',l:'In Progress'},{k:'RESOLVED',l:'Resolved'},{k:'CANCELLED',l:'Cancelled'}].map(f=>(
          <button key={f.k} onClick={()=>setActiveFilter(f.k)} className={`px-4 py-1.5 rounded text-sm font-medium ${activeFilter===f.k?'bg-teal-600 text-white':'bg-gray-100'}`}>{f.l}</button>
        ))}
      </div>

      {loading?<p className="text-center">Loading...</p>:filtered.length===0?(
        <div className="text-center py-12 text-gray-500"><i className="bi bi-tools text-4xl mb-3"></i><p>No maintenance requests yet.</p></div>
      ):(
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50"><tr><th className="p-4 text-left">Tenant</th><th className="p-4 text-left">Property</th><th className="p-4 text-left">Issue</th><th className="p-4 text-left">Status</th><th className="p-4 text-center">Actions</th></tr></thead>
            <tbody>
              {filtered.map(r=>(
                <tr key={r.id} className="border-t">
                  <td className="p-4 font-medium">{r.tenant_name||'—'}</td>
                  <td className="p-4">{r.property_title||'—'}</td>
                  <td className="p-4 max-w-xs truncate">{r.issue||'—'}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${String(r.status||'').toLowerCase()==='resolved'?'bg-green-100 text-green-700':String(r.status||'').toLowerCase()==='in_progress'?'bg-blue-100 text-blue-700':String(r.status||'').toLowerCase()==='pending'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>{(r.status||'Pending').replace('_',' ').toUpperCase()}</span></td>
                  <td className="p-4 flex justify-center gap-1 flex-wrap">
                    {String(r.status||'').toLowerCase()!=='in_progress'&&<button onClick={()=>updateStatus(r.id,'in_progress')} className="px-2 py-1 text-xs bg-blue-50 rounded">Start</button>}
                    {String(r.status||'').toLowerCase()!=='resolved'&&<button onClick={()=>updateStatus(r.id,'resolved')} className="px-2 py-1 text-xs bg-green-50 rounded">Resolve</button>}
                    {String(r.status||'').toLowerCase()!=='cancelled'&&<button onClick={()=>updateStatus(r.id,'cancelled')} className="px-2 py-1 text-xs bg-gray-50 rounded">Cancel</button>}
                    <button onClick={()=>deleteRequest(r.id)} className="px-2 py-1 text-xs bg-red-50 rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
// import React, { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import api from '../../services/api'

// export default function LandlordMaintenancePage() {
//   const navigate = useNavigate()
//   const [requests, setRequests] = useState([])
//   const [loading, setLoading] = useState(true)

//   const [activeFilter, setActiveFilter] = useState('ALL')
//   const [searchQuery, setSearchQuery] = useState('')

//   // Fetch requests — backend auto-filters to your properties
//   useEffect(() => {
//     const fetch = async () => {
//       try {
//         const res = await api.get('maintenance/')
//         setRequests(res.data.maintenance_requests || [])
//       } catch (err) {
//         console.error('Load error:', err)
//         alert('Could not load maintenance requests')
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetch()
//   }, [])

//   // Search + filter
//   const filtered = requests.filter(r => {
//     const tenant = (r.tenant_name || '').toLowerCase()
//     const property = (r.property_title || '').toLowerCase()
//     const issue = (r.issue || '').toLowerCase()
//     const q = searchQuery.toLowerCase()

//     const matchStatus = activeFilter === 'ALL' || r.status?.toUpperCase() === activeFilter
//     const matchSearch = !searchQuery || tenant.includes(q) || property.includes(q) || issue.includes(q)
//     return matchStatus && matchSearch
//   })

//   // Update status
//   const updateStatus = async (id, newStatus) => {
//     try {
//       await api.put(`maintenance/${id}/`, { status: newStatus })
//       setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
//       alert(`Marked as ${newStatus.replace('_', ' ')}`)
//     } catch (err) {
//       alert(err.response?.data?.error || 'Update failed')
//     }
//   }

//   // Delete request
//   const deleteRequest = async (id) => {
//     if (!window.confirm('Delete this request permanently?')) return
//     try {
//       await api.delete(`maintenance/${id}/`)
//       setRequests(prev => prev.filter(r => r.id !== id))
//       alert('Deleted')
//     } catch (err) {
//       alert(err.response?.data?.error || 'Delete not allowed')
//     }
//   }

//   return (
//     <div className="p-6">
//       {/* ✅ Back Button + Page Title */}
//       <div className="flex items-center gap-4 mb-6">
//         <button 
//           onClick={() => navigate('/landlord/dashboard')} 
//           className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-1"
//         >
//           ← Back
//         </button>
//         <h2 className="text-2xl font-bold">Maintenance Requests</h2>
//       </div>

//       {/* Centered Search */}
//       <div className="flex justify-center mb-4">
//         <div className="w-full sm:max-w-md">
//           <div className="relative">
//             <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
//             <input
//               type="text"
//               placeholder="Search tenant, property or issue..."
//               value={searchQuery}
//               onChange={e => setSearchQuery(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Centered Filters */}
//       <div className="flex flex-wrap justify-center gap-2 mb-6">
//         {[
//           { key: 'ALL', label: 'All' },
//           { key: 'PENDING', label: 'Pending' },
//           { key: 'IN_PROGRESS', label: 'In Progress' },
//           { key: 'RESOLVED', label: 'Resolved' },
//           { key: 'CANCELLED', label: 'Cancelled' }
//         ].map(f => (
//           <button
//             key={f.key}
//             onClick={() => setActiveFilter(f.key)}
//             className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
//               activeFilter === f.key ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//             }`}
//           >
//             {f.label}
//           </button>
//         ))}
//       </div>

//       {loading ? (
//         <p className="text-center text-gray-500">Loading...</p>
//       ) : filtered.length === 0 ? (
//         <div className="text-center py-12 text-gray-500">
//           <i className="bi bi-tools text-4xl mb-3"></i>
//           <p>No maintenance requests yet.</p>
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="p-4 text-left text-sm font-medium text-gray-600">Tenant</th>
//                 <th className="p-4 text-left text-sm font-medium text-gray-600">Property</th>
//                 <th className="p-4 text-left text-sm font-medium text-gray-600">Issue</th>
//                 <th className="p-4 text-left text-sm font-medium text-gray-600">Status</th>
//                 <th className="p-4 text-center text-sm font-medium text-gray-600">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map(r => (
//                 <tr key={r.id} className="border-t border-gray-100">
//                   <td className="p-4 font-medium">{r.tenant_name || '—'}</td>
//                   <td className="p-4">{r.property_title || '—'}</td>
//                   <td className="p-4 max-w-xs truncate">{r.issue || '—'}</td>
//                   <td className="p-4">
//                     <span className={`px-2 py-1 rounded text-xs font-medium ${
//                       (r.status || '').toLowerCase() === 'resolved' ? 'bg-green-100 text-green-700' :
//                       (r.status || '').toLowerCase() === 'in_progress' ? 'bg-blue-100 text-blue-700' :
//                       (r.status || '').toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-700' :
//                       'bg-red-100 text-red-700'
//                     }`}>
//                       {(r.status || 'Pending').replace('_', ' ').toUpperCase()}
//                     </span>
//                   </td>
//                   <td className="p-4 flex justify-center gap-1 flex-wrap">
//                     {(r.status || '').toLowerCase() !== 'in_progress' && (
//                       <button onClick={() => updateStatus(r.id, 'in_progress')} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100">Start</button>
//                     )}
//                     {(r.status || '').toLowerCase() !== 'resolved' && (
//                       <button onClick={() => updateStatus(r.id, 'resolved')} className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100">Resolve</button>
//                     )}
//                     {(r.status || '').toLowerCase() !== 'cancelled' && (
//                       <button onClick={() => updateStatus(r.id, 'cancelled')} className="px-2 py-1 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100">Cancel</button>
//                     )}
//                     <button onClick={() => deleteRequest(r.id)} className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100">Delete</button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   )
// }
// import React, { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import api from '../../services/api'

// export default function RentalRequestsPage() {
//   const navigate = useNavigate()
//   const [requests, setRequests] = useState([])
//   const [loading, setLoading] = useState(true)

//   const loadData = async () => {
//     try {
//       const res = await api.get('landlord/rental-requests/')
//       setRequests(res.data)
//     } catch (err) {
//       console.error('Failed to load requests:', err)
//       alert('Could not load requests')
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => { loadData() }, [])

//   const updateStatus = async (id, status) => {
//     if (!window.confirm(`Mark as ${status}?`)) return
//     try {
//       await api.patch(`landlord/rental-requests/${id}/`, { status })
//       alert(`Request ${status.toLowerCase()}!`)
//       loadData()
//     } catch (err) {
//       console.error(err)
//       alert('Failed to update status')
//     }
//   }

//   return (
//     <div className="p-6">
//       <button onClick={() => navigate('/dashboard')} className="mb-4 flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium">
//         <i className="bi bi-arrow-left"></i> Back to Dashboard
//       </button>
//       <h2 className="text-2xl font-bold text-gray-800 mb-6">Rental Requests</h2>

//       {loading ? <p className="text-center text-gray-500">Loading...</p> : requests.length === 0 ? (
//         <div className="text-center py-12 text-gray-500"><i className="bi bi-envelope text-4xl mb-4"></i><p>No rental requests yet.</p></div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="p-4 text-left text-sm font-medium text-gray-600">Applicant</th>
//                 <th className="p-4 text-left text-sm font-medium text-gray-600">Property</th>
//                 <th className="p-4 text-left text-sm font-medium text-gray-600">Message</th>
//                 <th className="p-4 text-left text-sm font-medium text-gray-600">Status</th>
//                 <th className="p-4 text-center text-sm font-medium text-gray-600">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {requests.map(r => (
//                 <tr key={r.id} className="border-t border-gray-100">
//                   <td className="p-4 font-medium">{r.tenant_name || 'N/A'}</td>
//                   <td className="p-4">{r.property_title || 'N/A'}</td>
//                   <td className="p-4 text-sm max-w-[200px] truncate">{r.message || '—'}</td>
//                   <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-medium ${
//                     r.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
//                     r.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
//                   }`}>{r.status_display || r.status}</span></td>
//                   <td className="p-4 flex justify-center gap-2">
//                     {r.status === 'PENDING' && (
//                       <>
//                         <button onClick={() => updateStatus(r.id, 'APPROVED')} className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded">Approve</button>
//                         <button onClick={() => updateStatus(r.id, 'REJECTED')} className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded">Reject</button>
//                       </>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   )
// }
// import React, { useState, useEffect } from 'react'
// import api from '../../services/api'

// export default function RequestsPage() {
//   const [reqs, setReqs] = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const fetch = async () => {
//       try {
//         const res = await api.get('landlord/rental-requests/')
//         setReqs(res.data)
//       } catch (e) { console.error(e) }
//       finally { setLoading(false) }
//     }
//     fetch()
//   }, [])

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-bold mb-6">Maintenance & Requests</h2>
//       {loading ? <p>Loading...</p> : <div className="grid gap-4">{reqs.map(r => (
//         <div key={r.id} className="bg-white p-5 rounded-xl shadow-sm">
//           <h3 className="font-semibold">{r.title}</h3>
//           <p className="text-gray-600">{r.description}</p>
//           <span className={`text-xs px-2 py-1 rounded ${r.status==='pending'?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'}`}>{r.status}</span>
//         </div>
//       ))}</div>}
//     </div>
//   )
// }