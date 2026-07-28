import React, { useState, useEffect, useContext } from 'react'
import api from '../../services/api'
import { AuthContext } from '../../AuthContext'

export default function TenantNoticesPage() {
  const { profile } = useContext(AuthContext)
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('core/notices/')
        setNotices(res.data.notices || [])
      } catch (err) {
        console.error('Failed to load notices:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <p className="p-6 text-center text-gray-500">Loading...</p>

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Notices</h2>
          {profile?.full_name && <p className="text-sm text-gray-500 mt-0.5">{profile.full_name}</p>}
        </div>
      </div>

      {notices.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <i className="bi bi-megaphone text-4xl block mb-3"></i>
          <p>No notices at the moment.</p>
        </div>
      ) : (
        notices.map(n => (
          <div key={n.id} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-2">
              <i className="bi bi-megaphone text-teal-600"></i>
              <p className="font-semibold text-gray-800">{n.title}</p>
            </div>
            <p className="text-sm text-gray-600">{n.message}</p>
            <p className="text-xs text-gray-400 mt-3">
              {n.created_at ? new Date(n.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
            </p>
          </div>
        ))
      )}
    </div>
  )
}
