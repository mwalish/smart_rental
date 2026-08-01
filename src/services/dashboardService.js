import api from './api'

export const getLandlordStats = async () => {
  const res = await api.get('core/landlord/dashboard/')
  return res.data
}

export const getTenantStats = async () => {
  const res = await api.get('leases/')
  return res.data
}
