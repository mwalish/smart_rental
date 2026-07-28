import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function MeetingsPage() {
  const navigate = useNavigate()
  const [meetings, setMeetings] = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    property: '',
    date_time: '',
    notes: '',
    status: 'SCHEDULED'
  })

  const loadData = async () => {
    try {
      const [meetRes, propRes] = await Promise.all([
        api.get('landlord/meetings/'),
        api.get('landlord/properties/')
      ])
      setMeetings(meetRes.data.meetings || meetRes.data)
      setProperties(propRes.data)
    } catch (err) {
      console.error('Failed to load data:', err)
      alert('Could not load meetings or properties')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const openForm = (meeting = null) => {
    if (meeting) {
      setEditing(meeting)
      setFormData({
        title: meeting.title || '',
        property: meeting.property?.id || meeting.property || '',
        date_time: meeting.date_time ? new Date(meeting.date_time).toISOString().slice(0, 16) : '',
        notes: meeting.notes || '',
        status: meeting.status || 'SCHEDULED'
      })
    } else {
      setEditing(null)
      setFormData({ title: '', property: '', date_time: '', notes: '', status: 'SCHEDULED' })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        date_time: new Date(formData.date_time).toISOString()
      }
      if (editing) {
        await api.put(`landlord/meetings/${editing.id}/`, payload)
        alert('Meeting updated successfully!')
      } else {
        await api.post('landlord/meetings/', payload)
        alert('Meeting scheduled successfully!')
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      console.error(err)
      let msg = 'Failed to save meeting'
      if (err.response?.data) {
        const d = err.response.data
        msg = d.message || d.error || JSON.stringify(d)
      }
      alert(msg)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this meeting?')) return
    try {
      await api.delete(`landlord/meetings/${id}/`)
      alert('Meeting cancelled')
      loadData()
    } catch (err) {
      console.error(err)
      alert('Failed to cancel meeting')
    }
  }

  return (
    <div className="p-6">
      <button 
        onClick={() => navigate('/dashboard')} 
        className="mb-4 flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
      >
        <i className="bi bi-arrow-left"></i> Back to Dashboard
      </button>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Scheduled Meetings & Viewings</h2>
        <button 
          onClick={() => openForm()} 
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
        >
          <i className="bi bi-plus-lg"></i> Schedule Meeting
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading meetings...</p>
      ) : meetings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="bi bi-calendar-event text-4xl mb-4"></i>
          <p>No meetings scheduled yet. Schedule your first meeting or viewing.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Meeting Title</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Property</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">New Applicant</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Date & Time</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="p-4 text-center text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map(m => (
                <tr key={m.id} className="border-t border-gray-100">
                  <td className="p-4 font-medium">{m.title || 'Applicant Viewing'}</td>
                  <td className="p-4">{m.property?.title || m.property_title || m.property}</td>
                  <td className="p-4 font-medium text-gray-700">New Applicant</td>
                  <td className="p-4 text-sm">{m.date_time_formatted || new Date(m.date_time).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      m.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                      m.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>{m.status}</span>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <button 
                      onClick={() => openForm(m)} 
                      className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(m.id)} 
                      className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">{editing ? 'Edit Meeting' : 'New Meeting'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title / Purpose</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                  placeholder="e.g. Property Viewing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                <select
                  value={formData.property}
                  onChange={e => setFormData({...formData, property: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select Property</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.title} — {p.location}</option>
                  ))}
                </select>
              </div>

              {/* ✅ SAME BORDER + PADDING AS ALL OTHER FIELDS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Applicant</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-medium">
                  New Applicant
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.date_time}
                  onChange={e => setFormData({...formData, date_time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Location</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  {editing ? 'Update Meeting' : 'Schedule Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
// import React, { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import api from '../../services/api'

// export default function MeetingsPage() {
//   const navigate = useNavigate()
//   const [meetings, setMeetings] = useState([])
//   const [properties, setProperties] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [showModal, setShowModal] = useState(false)
//   const [editing, setEditing] = useState(null)
//   const [formData, setFormData] = useState({
//     title: '',
//     property: '',
//     date_time: '',
//     notes: '',
//     status: 'SCHEDULED'
//   })

//   const loadData = async () => {
//     try {
//       const [meetRes, propRes] = await Promise.all([
//         api.get('landlord/meetings/'),
//         api.get('landlord/properties/')
//       ])
//       setMeetings(meetRes.data.meetings || meetRes.data)
//       setProperties(propRes.data)
//     } catch (err) {
//       console.error('Failed to load data:', err)
//       alert('Could not load meetings or properties')
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => { loadData() }, [])

//   const openForm = (meeting = null) => {
//     if (meeting) {
//       setEditing(meeting)
//       setFormData({
//         title: meeting.title || '',
//         property: meeting.property?.id || meeting.property || '',
//         date_time: meeting.date_time ? new Date(meeting.date_time).toISOString().slice(0, 16) : '',
//         notes: meeting.notes || '',
//         status: meeting.status || 'SCHEDULED'
//       })
//     } else {
//       setEditing(null)
//       setFormData({ title: '', property: '', date_time: '', notes: '', status: 'SCHEDULED' })
//     }
//     setShowModal(true)
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     try {
//       const payload = {
//         ...formData,
//         date_time: new Date(formData.date_time).toISOString()
//       }
//       if (editing) {
//         await api.put(`landlord/meetings/${editing.id}/`, payload)
//         alert('Meeting updated successfully!')
//       } else {
//         await api.post('landlord/meetings/', payload)
//         alert('Meeting scheduled successfully!')
//       }
//       setShowModal(false)
//       loadData()
//     } catch (err) {
//       console.error(err)
//       let msg = 'Failed to save meeting'
//       if (err.response?.data) {
//         const d = err.response.data
//         msg = d.message || d.error || JSON.stringify(d)
//       }
//       alert(msg)
//     }
//   }

//   const handleDelete = async (id) => {
//     if (!window.confirm('Cancel this meeting?')) return
//     try {
//       await api.delete(`landlord/meetings/${id}/`)
//       alert('Meeting cancelled')
//       loadData()
//     } catch (err) {
//       console.error(err)
//       alert('Failed to cancel meeting')
//     }
//   }

//   return (
//     <div className="p-6">
//       <button 
//         onClick={() => navigate('/dashboard')} 
//         className="mb-4 flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
//       >
//         <i className="bi bi-arrow-left"></i> Back to Dashboard
//       </button>

//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">Scheduled Meetings & Viewings</h2>
//         <button 
//           onClick={() => openForm()} 
//           className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
//         >
//           <i className="bi bi-plus-lg"></i> Schedule Meeting
//         </button>
//       </div>

//       {loading ? (
//         <p className="text-center text-gray-500">Loading meetings...</p>
//       ) : meetings.length === 0 ? (
//         <div className="text-center py-12 text-gray-500">
//           <i className="bi bi-calendar-event text-4xl mb-4"></i>
//           <p>No meetings scheduled yet. Schedule your first meeting or viewing.</p>
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="p-4 text-left text-sm font-medium text-gray-600">Meeting Title</th>
//                 <th className="p-4 text-left text-sm font-medium text-gray-600">Property</th>
//                 <th className="p-4 text-left text-sm font-medium text-gray-600">New Applicant</th>
//                 <th className="p-4 text-left text-sm font-medium text-gray-600">Date & Time</th>
//                 <th className="p-4 text-left text-sm font-medium text-gray-600">Status</th>
//                 <th className="p-4 text-center text-sm font-medium text-gray-600">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {meetings.map(m => (
//                 <tr key={m.id} className="border-t border-gray-100">
//                   <td className="p-4 font-medium">{m.title || 'Applicant Viewing'}</td>
//                   <td className="p-4">{m.property?.title || m.property_title || m.property}</td>
//                   <td className="p-4 font-medium text-gray-700">New Applicant</td>
//                   <td className="p-4 text-sm">{m.date_time_formatted || new Date(m.date_time).toLocaleString()}</td>
//                   <td className="p-4">
//                     <span className={`px-2 py-1 rounded text-xs font-medium ${
//                       m.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
//                       m.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
//                       'bg-red-100 text-red-700'
//                     }`}>{m.status}</span>
//                   </td>
//                   <td className="p-4 flex justify-center gap-2">
//                     <button 
//                       onClick={() => openForm(m)} 
//                       className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
//                     >
//                       Edit
//                     </button>
//                     <button 
//                       onClick={() => handleDelete(m.id)} 
//                       className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
//                     >
//                       Cancel
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {showModal && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
//             <h3 className="text-xl font-bold mb-4">{editing ? 'Edit Meeting' : 'New Meeting'}</h3>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title / Purpose</label>
//                 <input
//                   type="text"
//                   value={formData.title}
//                   onChange={e => setFormData({...formData, title: e.target.value})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                   required
//                   placeholder="e.g. Property Viewing"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
//                 <select
//                   value={formData.property}
//                   onChange={e => setFormData({...formData, property: e.target.value})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                   required
//                 >
//                   <option value="">Select Property</option>
//                   {properties.map(p => (
//                     <option key={p.id} value={p.id}>{p.title} — {p.location}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* ✅ No input — just plain label */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Applicant</label>
//                 <p className="px-3 py-2 text-gray-700 font-medium">New Applicant</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
//                 <input
//                   type="datetime-local"
//                   value={formData.date_time}
//                   onChange={e => setFormData({...formData, date_time: e.target.value})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//                 <select
//                   value={formData.status}
//                   onChange={e => setFormData({...formData, status: e.target.value})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                 >
//                   <option value="SCHEDULED">Scheduled</option>
//                   <option value="COMPLETED">Completed</option>
//                   <option value="CANCELLED">Cancelled</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Location</label>
//                 <textarea
//                   value={formData.notes}
//                   onChange={e => setFormData({...formData, notes: e.target.value})}
//                   rows="2"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                 ></textarea>
//               </div>

//               <div className="flex gap-3 pt-2">
//                 <button
//                   type="button"
//                   onClick={() => setShowModal(false)}
//                   className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
//                 >
//                   {editing ? 'Update Meeting' : 'Schedule Meeting'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
// import React, { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import api from '../../services/api'

// export default function MeetingsPage() {
//   const navigate = useNavigate()
//   const [meetings, setMeetings] = useState([])
//   const [properties, setProperties] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [showModal, setShowModal] = useState(false)
//   const [editing, setEditing] = useState(null)
//   const [formData, setFormData] = useState({
//     title: '',
//     property: '', // ✅ Will hold ONLY the ID number
//     tenant: '',
//     date_time: '',
//     notes: '',
//     status: 'SCHEDULED'
//   })

//   const loadData = async () => {
//     try {
//       const [meetRes, propRes] = await Promise.all([
//         api.get('landlord/meetings/'),
//         api.get('landlord/properties/')
//       ])
//       setMeetings(meetRes.data.meetings || meetRes.data)
//       setProperties(propRes.data)
//     } catch (err) {
//       console.error('Failed to load data:', err)
//       alert('Could not load meetings or properties')
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => { loadData() }, [])

//   const openForm = (meeting = null) => {
//     if (meeting) {
//       setEditing(meeting)
//       setFormData({
//         title: meeting.title || '',
//         property: meeting.property?.id || meeting.property || '', // ✅ Only ID
//         tenant: meeting.tenant || '',
//         date_time: meeting.date_time ? new Date(meeting.date_time).toISOString().slice(0, 16) : '',
//         notes: meeting.notes || '',
//         status: meeting.status || 'SCHEDULED'
//       })
//     } else {
//       setEditing(null)
//       setFormData({ title: '', property: '', tenant: '', date_time: '', notes: '', status: 'SCHEDULED' })
//     }
//     setShowModal(true)
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     try {
//       const payload = {
//         ...formData,
//         date_time: new Date(formData.date_time).toISOString()
//       }
//       if (editing) {
//         await api.put(`landlord/meetings/${editing.id}/`, payload)
//         alert('Meeting updated successfully!')
//       } else {
//         await api.post('landlord/meetings/', payload)
//         alert('Meeting scheduled successfully!')
//       }
//       setShowModal(false)
//       loadData()
//     } catch (err) {
//       console.error(err)
//       // ✅ FIXED: Show clean error message, not [object Object]
//       let msg = 'Failed to save meeting'
//       if (err.response?.data) {
//         const d = err.response.data
//         msg = d.message || d.error || JSON.stringify(d)
//       }
//       alert(msg)
//     }
//   }

//   const handleDelete = async (id) => {
//     if (!window.confirm('Cancel this meeting?')) return
//     try {
//       await api.delete(`landlord/meetings/${id}/`)
//       alert('Meeting cancelled')
//       loadData()
//     } catch (err) {
//       console.error(err)
//       alert('Failed to cancel meeting')
//     }
//   }

//   return (
//     <div className="p-6">
//       <button 
//         onClick={() => navigate('/dashboard')} 
//         className="mb-4 flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
//       >
//         <i className="bi bi-arrow-left"></i> Back to Dashboard
//       </button>

//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">Scheduled Meetings & Viewings</h2>
//         <button 
//           onClick={() => openForm()} 
//           className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
//         >
//           <i className="bi bi-plus-lg"></i> Schedule Meeting
//         </button>
//       </div>

//       {loading ? (
//         <p className="text-center text-gray-500">Loading meetings...</p>
//       ) : meetings.length === 0 ? (
//         <div className="text-center py-12 text-gray-500">
//           <i className="bi bi-calendar-event text-4xl mb-4"></i>
//           <p>No meetings scheduled yet. Schedule your first meeting or viewing.</p>
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="p-4 text-left text-sm font-medium text-gray-600">Meeting Title</th>
//                 <th className="p-4 text-left text-sm font-medium text-gray-600">Property</th>
//                 <th className="p-4 text-left text-sm font-medium text-gray-600">New Applicant</th>
//                 <th className="p-4 text-left text-sm font-medium text-gray-600">Date & Time</th>
//                 <th className="p-4 text-left text-sm font-medium text-gray-600">Status</th>
//                 <th className="p-4 text-center text-sm font-medium text-gray-600">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {meetings.map(m => (
//                 <tr key={m.id} className="border-t border-gray-100">
//                   <td className="p-4 font-medium">{m.title || 'Applicant Viewing'}</td>
//                   <td className="p-4">{m.property?.title || m.property_title || m.property}</td>
//                   <td className="p-4">{m.tenant || 'New Applicant'}</td>
//                   <td className="p-4 text-sm">{m.date_time_formatted || new Date(m.date_time).toLocaleString()}</td>
//                   <td className="p-4">
//                     <span className={`px-2 py-1 rounded text-xs font-medium ${
//                       m.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
//                       m.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
//                       'bg-red-100 text-red-700'
//                     }`}>{m.status}</span>
//                   </td>
//                   <td className="p-4 flex justify-center gap-2">
//                     <button 
//                       onClick={() => openForm(m)} 
//                       className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
//                     >
//                       Edit
//                     </button>
//                     <button 
//                       onClick={() => handleDelete(m.id)} 
//                       className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
//                     >
//                       Cancel
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {showModal && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
//             <h3 className="text-xl font-bold mb-4">{editing ? 'Edit Meeting' : 'New Meeting'}</h3>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title / Purpose</label>
//                 <input
//                   type="text"
//                   value={formData.title}
//                   onChange={e => setFormData({...formData, title: e.target.value})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                   required
//                   placeholder="e.g. Property Viewing"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
//                 <select
//                   value={formData.property}
//                   onChange={e => setFormData({...formData, property: e.target.value})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                   required
//                 >
//                   <option value="">Select Property</option>
//                   {/* ✅ Sends ID, shows name/location — exactly like your Leases page */}
//                   {properties.map(p => (
//                     <option key={p.id} value={p.id}>{p.title} — {p.location}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">New Applicant</label>
//                 <input
//                   type="text"
//                   value={formData.tenant}
//                   onChange={e => setFormData({...formData, tenant: e.target.value})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                   placeholder="Enter name or leave blank"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
//                 <input
//                   type="datetime-local"
//                   value={formData.date_time}
//                   onChange={e => setFormData({...formData, date_time: e.target.value})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//                 <select
//                   value={formData.status}
//                   onChange={e => setFormData({...formData, status: e.target.value})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                 >
//                   <option value="SCHEDULED">Scheduled</option>
//                   <option value="COMPLETED">Completed</option>
//                   <option value="CANCELLED">Cancelled</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Location</label>
//                 <textarea
//                   value={formData.notes}
//                   onChange={e => setFormData({...formData, notes: e.target.value})}
//                   rows="2"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                 ></textarea>
//               </div>

//               <div className="flex gap-3 pt-2">
//                 <button
//                   type="button"
//                   onClick={() => setShowModal(false)}
//                   className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
//                 >
//                   {editing ? 'Update Meeting' : 'Schedule Meeting'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

