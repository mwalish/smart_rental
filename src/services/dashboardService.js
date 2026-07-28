import api from './api'

// ✅ Matches: /api/landlord/dashboard/
export const getLandlordStats = async () => {
  const res = await api.get('landlord/dashboard/')
  return res.data
}

// ✅ Matches your future tenant endpoint
export const getTenantStats = async () => {
  const res = await api.get('tenant/dashboard/')
  return res.data
}
// import api from './api'

// export const getLandlordStats = async () => {
//   const res = await api.get('dashboard/landlord/')
//   return res.data
// }

// export const getTenantStats = async () => {
//   const res = await api.get('dashboard/tenant/')
//   return res.data
// }