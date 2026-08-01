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

/** Landlord-only: convert a house-hunting lead request into a registered tenant account.
 *  Reuses the same account if the lead already signed up (no duplicates). */
export const convertLeadToTenant = async (requestId) => {
  const res = await api.post(`landlord/rental-requests/${requestId}/convert-to-tenant/`)
  return res.data
}


