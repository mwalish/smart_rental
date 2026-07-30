import React, { useState, useEffect, useContext } from 'react'
import api from '../../services/api'
import { AuthContext } from '../../AuthContext'
import { PageHeader, EmptyState, LoadingSpinner } from '../../components/ui'

export default function TenantNoticesPage() {
  const { profile } = useContext(AuthContext)
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('core/notices/')
      .then(r => setNotices(r.data.notices || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const NOTICE_COLORS = [
    'from-teal-500 to-cyan-400',
    'from-violet-500 to-purple-400',
    'from-amber-500 to-yellow-400',
    'from-blue-500 to-indigo-400',
    'from-rose-500 to-pink-400',
  ]

  return (
    <div className="p-6 space-y-5 animate-fade-up">
      <PageHeader title="Notices" subtitle={profile?.full_name} />

      {loading ? <LoadingSpinner /> : notices.length === 0 ? (
        <EmptyState icon="bi-megaphone" message="No notices at the moment." />
      ) : (
        <div className="space-y-3">
          {notices.map((n, i) => (
            <div key={n.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${NOTICE_COLORS[i % NOTICE_COLORS.length]} flex items-center justify-center shrink-0 shadow-md`}>
                <i className="bi bi-megaphone-fill text-white text-sm"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-bold text-gray-900">{n.title}</p>
                  {n.target && (
                    <span className="badge bg-teal-50 text-teal-700">{n.target}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{n.message}</p>
                <p className="text-xs text-gray-300 mt-2 flex items-center gap-1">
                  <i className="bi bi-clock text-xs"></i>
                  {n.created_at ? new Date(n.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
