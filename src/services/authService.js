import api from './api'

export const login = async (credentials) => {
  const res = await api.post('login/', credentials)
  return res.data
}

export const register = async (userData) => {
  const res = await api.post('register/', userData)
  return res.data
}

export const getProfile = async () => {
  const res = await api.get('profile/')
  return res.data
}