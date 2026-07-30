import api from './api'

export const getLandlordStats = async () => {
  const res = await api.get('landlord/dashboard/')
  return res.data
}

export const getTenantStats = async () => {
  const res = await api.get('tenant/dashboard/')
  return res.data
}
