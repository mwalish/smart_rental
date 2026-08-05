import api from './api'

/**
 * House-Hunting Portal API Service
 * All calls to public / tenant-facing endpoints
 */

/** Get all AVAILABLE properties (public - no auth needed) */
export const getAvailableProperties = async (params = {}) => {
  const res = await api.get('properties/available/', { params })
  return res.data
}

/** Get single property detail by ID — no single-item endpoint, find from list */
export const getPropertyDetail = async (id) => {
  const res = await api.get('core/house-hunting/properties/')
  const list = Array.isArray(res.data) ? res.data : []
  return list.find(p => String(p.id) === String(id)) || null
}

/** Submit a rental request (tenant must be logged in) */
export const submitRentalRequest = async (data) => {
  const res = await api.post('core/rental-requests/', data)
  return res.data
}

/**
 * Public rental inquiry — NO sign-up required.
 * Guests submit lead contact info; logged-in tenants submit a linked application.
 */
export const submitRentalInquiry = async (data) => {
  const res = await api.post('core/house-hunting/request/', data)
  return res.data
}

/**
 * Public guest request-status lookup — NO login required.
 * Guests who submitted a rental inquiry can check its current status
 * by providing the phone number or email they used.
 *
 * @param {{phone?: string, email?: string}} data  at least one identifier
 * @returns {Promise<{requests: Array}>}
 */
export const trackRequestStatus = async (data) => {
  const res = await api.post('core/house-hunting/request-status/', data)
  return res.data
}

/** Get logged-in tenant's rental requests */
export const getMyRequests = async () => {
  const res = await api.get('core/rental-requests/')
  return res.data
}

/** Withdraw a pending rental request */
export const withdrawRequest = async (id) => {
  const res = await api.delete(`core/rental-requests/${id}/`)
  return res.data
}

/**
 * Public tenant self-registration (house-hunting portal).
 * Reuses the backend endpoint that forces role='tenant'.
 */
export const registerTenant = async (data) => {
  const res = await api.post('core/house-hunting/register/', data)
  return res.data
}

/**
 * Convert a house-hunting lead request into a registered tenant account.
 * REUSES the same account if the lead already signed up (no duplicates) —
 * grants tenant privileges on the existing account.
 *
 * @param {number} requestId - Rental request id
 * @param {'landlord'|'admin'} [asRole] - Who is performing the conversion.
 *   Landlord uses the landlord endpoint; admin uses the core endpoint.
 */
export const convertLeadToTenant = async (requestId, asRole = 'landlord') => {
  const base = asRole === 'admin'
    ? `core/rental-requests/${requestId}/convert-to-tenant/`
    : `landlord/rental-requests/${requestId}/convert-to-tenant/`
  const res = await api.post(base)
  return res.data
}


