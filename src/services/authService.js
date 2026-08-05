import api from './api'

/********** AUTH **********/
export const login = async (credentials) => {
  const res = await api.post('core/login/', credentials)
  return res.data
}

export const register = async (data) => {
  const res = await api.post('core/register/', data)
  return res.data
}

export const logout = async (refresh) => {
  const res = await api.post('core/logout/', { refresh })
  return res.data
}

/**
 * Change the logged-in user's password.
 * @param {object} data { old_password, new_password }
 * @returns {Promise<object>} backend response
 */
export const changePassword = async (data) => {
  const res = await api.post('core/change-password/', data)
  return res.data
}

/********** PROFILE **********/
export const getProfile = async () => {
  const res = await api.get('core/profile/')
  return res.data
}

/**
 * Update the logged-in user's profile (landlord or tenant).
 * Accepts a plain object OR a FormData instance (for file / profile_picture upload).
 *
 * @param {object|FormData} data
 * @returns {Promise<object>} backend profile response
 */
export const updateProfile = async (data) => {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
  const res = await api.patch('core/profile/', data, {
    // For FormData uploads, let the browser set the multipart boundary.
    headers: isFormData ? { 'Content-Type': undefined } : undefined,
  })
  return res.data
}
