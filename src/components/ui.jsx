// Shared UI primitives for dashboard pages
import { useEffect } from 'react'

export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
    <div className="min-w-0">
      <h2 className="text-xl font-black text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    {action && (
      <div className="w-full sm:w-auto flex justify-center sm:justify-end shrink-0">
        {action}
      </div>
    )}
  </div>
)

export const PrimaryBtn = ({ onClick, children, disabled, type = 'button', className = '' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`btn-primary px-5 py-2.5 text-sm flex items-center justify-center gap-2 whitespace-nowrap ${className}`}
  >
    {children}
  </button>
)

export const SecondaryBtn = ({ onClick, children, className = '' }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors whitespace-nowrap ${className}`}
  >
    {children}
  </button>
)

export const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="relative">
    <i className="bi bi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="input-field w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
    />
  </div>
)

export const FilterTabs = ({ options, active, onChange }) => (
  <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
    {options.map(o => (
      <button
        key={o.key}
        onClick={() => onChange(o.key)}
        className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
          active === o.key
            ? 'bg-slate-900 text-white shadow-sm'
            : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
)

export const Badge = ({ status }) => {
  const map = {
    ACTIVE: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-green-100 text-green-700',
    APPROVED: 'bg-green-100 text-green-700',
    resolved: 'bg-green-100 text-green-700',
    PENDING: 'bg-amber-100 text-amber-700',
    pending: 'bg-amber-100 text-amber-700',
    SCHEDULED: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    FAILED: 'bg-red-100 text-red-700',
    REJECTED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-red-100 text-red-700',
    cancelled: 'bg-red-100 text-red-700',
    EXPIRED: 'bg-gray-100 text-gray-600',
    TERMINATED: 'bg-gray-100 text-gray-600',
    OCCUPIED: 'bg-teal-100 text-teal-700',
    AVAILABLE: 'bg-emerald-100 text-emerald-700',
  }
  const cls = map[status] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`badge ${cls}`}>
      {(status || '—').replace(/_/g, ' ')}
    </span>
  )
}

export const EmptyState = ({ icon, message }) => (
  <div className="text-center py-16 text-gray-400">
    <i className={`bi ${icon} text-5xl block mb-3 opacity-40`}></i>
    <p className="text-sm">{message}</p>
  </div>
)

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
)

export const Modal = ({ title, onClose, children, maxWidth = 'max-w-md' }) => {
  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    // Prevent body scroll while modal is open
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col animate-fade-up`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
            <i className="bi bi-x-lg text-sm"></i>
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

export const FormField = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">{label}</label>
    {children}
  </div>
)

export const Input = ({ ...props }) => (
  <input
    {...props}
    className={`input-field w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white ${props.className || ''}`}
  />
)

export const Select = ({ children, ...props }) => (
  <select
    {...props}
    className={`input-field w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white ${props.className || ''}`}
  >
    {children}
  </select>
)

export const Textarea = ({ ...props }) => (
  <textarea
    {...props}
    className={`input-field w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white resize-none ${props.className || ''}`}
  />
)

export const Table = ({ headers, children, empty }) => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {headers.map(h => (
              <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {children}
        </tbody>
      </table>
    </div>
    {empty}
  </div>
)

export const Tr = ({ children }) => (
  <tr className="table-row-hover transition-colors">{children}</tr>
)

export const Td = ({ children, className = '' }) => (
  <td className={`px-5 py-3.5 text-sm text-gray-700 ${className}`}>{children}</td>
)

export const ActionBtn = ({ onClick, variant = 'default', children, disabled = false }) => {
  const variants = {
    default: 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200',
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100',
    green: 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-100',
    red: 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-100',
    amber: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}

export const ModalActions = ({ onCancel, submitLabel, submitting }) => (
  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
    <button type="button" onClick={onCancel} className="w-full sm:flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
      Cancel
    </button>
    <button type="submit" disabled={submitting} className="w-full sm:flex-1 py-2.5 text-sm btn-primary disabled:opacity-50">
      {submitting ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Saving...
        </span>
      ) : submitLabel}
    </button>
  </div>
)
