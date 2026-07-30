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

/** Get single property detail by ID */
export const getPropertyDetail = async (id) => {
  const res = await api.get(`properties/available/${id}/`)
  return res.data
}

/** Self-register as a tenant (public) */
export const tenantSelfRegister = async (data) => {
  const res = await api.post('register/', {
    ...data,
    role: 'tenant',
  })
  return res.data
}

/** Submit a rental request (tenant must be logged in) */
export const submitRentalRequest = async (data) => {
  const res = await api.post('rental-requests/', data)
  return res.data
}

/** Get logged-in tenant's rental requests */
export const getMyRequests = async () => {
  const res = await api.get('rental-requests/')
  return res.data
}

/** Withdraw a pending rental request */
export const withdrawRequest = async (id) => {
  const res = await api.delete(`rental-requests/${id}/`)
  return res.data
}

