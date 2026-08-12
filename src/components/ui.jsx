// Shared UI primitives for dashboard pages
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import api from '../services/api'

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
        className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${active === o.key
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

export const Modal = ({ title, onClose, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className={`w-full ${maxWidth} bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>,
    document.body
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
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Saving...
        </span>
      ) : submitLabel}
    </button>
  </div>
)

// ==================================================
// Receipt Modal — fetches & displays a printable receipt
// ==================================================
const ReceiptRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 py-2 border-b border-dashed border-gray-200 last:border-0">
    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
    <span className="text-sm font-bold text-gray-900 text-right">{value || '—'}</span>
  </div>
)

export const ReceiptModal = ({ paymentId, onClose }) => {
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`core/payments/${paymentId}/receipt/`)
        setReceipt(res.data.receipt)
      } catch (e) {
        setError(e.response?.data?.error || 'Failed to load receipt')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [paymentId])

  const handlePrint = () => {
    const printEl = document.getElementById('printable-receipt')
    if (!printEl?.innerHTML) return

    const printContents = printEl.innerHTML
    // Sanitize: strip any <script> tags from the receipt content to prevent XSS
    // via injected HTML in receipt data (e.g. property name, tenant name).
    const sanitized = printContents.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

    const doc = window.open('', '_blank', 'width=700,height=800')
    if (!doc) {
      // Popup blocked — print directly without full-page reload.
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.top = '-9999px'
      iframe.style.left = '-9999px'
      iframe.style.width = '0'
      iframe.style.height = '0'
      document.body.appendChild(iframe)
      const iframeDoc = iframe.contentWindow?.document
      if (iframeDoc) {
        iframeDoc.open()
        iframeDoc.write(`<!DOCTYPE html><html><head><title>Receipt</title></head><body>${sanitized}</body></html>`)
        iframeDoc.close()
        // Print after a short delay to let content render
        setTimeout(() => {
          iframe.contentWindow?.print()
          document.body.removeChild(iframe)
        }, 300)
      }
      return
    }

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((el) => el.outerHTML)
      .join('')

    doc.open()
    doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt</title>
  ${styles}
  <style>
    html, body { margin: 0; padding: 0; background: #fff; }
    body { display: flex; justify-content: center; padding: 24px; }
    #printable-receipt { width: 100%; max-width: 560px; }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  ${sanitized}
</body>
</html>`)
    doc.close()
    doc.onload = function () { doc.print(); doc.close(); }
  }

  return (
    <Modal title="Payment Receipt" onClose={onClose} maxWidth="max-w-lg">
      {loading ? <LoadingSpinner /> : error ? (
        <div className="text-center py-8 text-red-500">
          <i className="bi bi-exclamation-triangle-fill text-4xl block mb-3 opacity-60"></i>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div>
          {/* Printable block */}
          <div id="printable-receipt" className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-5">
            <div className="bg-gradient-to-br from-teal-500 to-emerald-500 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-black">Smart Rental System</p>
                  <p className="text-xs opacity-80 mt-0.5">Official Rent Payment Receipt</p>
                </div>
                <i className="bi bi-receipt text-3xl opacity-80"></i>
              </div>
            </div>
            <div className="px-6 py-4">
              {/* Receipt number banner */}
              <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase">Receipt No.</span>
                <span className="text-sm font-black text-teal-700 tracking-wide">{receipt.receipt_number}</span>
              </div>
              <ReceiptRow label="Issued On" value={receipt.issued_at ? new Date(receipt.issued_at).toLocaleString() : '—'} />
              <ReceiptRow label="Issued By" value={receipt.issued_by} />
              <ReceiptRow label="Received From" value={receipt.tenant} />
              <ReceiptRow label="Property" value={receipt.property} />
              <ReceiptRow label="Amount Paid" value={`KSh ${Number(receipt.amount_paid).toLocaleString()}`} />
              <ReceiptRow label="Payment Method" value={receipt.method} />
              {receipt.mpesa_ref && <ReceiptRow label="M-Pesa Ref" value={receipt.mpesa_ref} />}
              <ReceiptRow label="Covers Months" value={Array.isArray(receipt.covers_months) && receipt.covers_months.length ? receipt.covers_months.join(', ') : '—'} />
              <ReceiptRow label="Balance After" value={`KSh ${Number(receipt.balance_after).toLocaleString()}`} />
              <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Thank you for your payment</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button type="button" onClick={onClose} className="w-full sm:flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Close
            </button>
            <button type="button" onClick={handlePrint} className="w-full sm:flex-1 py-2.5 text-sm font-semibold btn-primary flex items-center justify-center gap-2">
              <i className="bi bi-printer"></i> Print Receipt
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}