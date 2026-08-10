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

/**
 * Request a 6-digit OTP reset code sent via SMS to the user's registered phone.
 * Body: { phone }
 * @param {string} phone e.g. "0712345678"
 * @returns {Promise<object>} backend response
 */
export const sendResetCode = async (phone) => {
  const res = await api.post('core/password/send-reset-code/', { phone })
  return res.data
}

/**
 * Request a 6-digit OTP reset code sent via email (alternative delivery method
 * that requires no SMS credentials — works out of the box in dev).
 * Body: { email }
 * @param {string} email user's registered email address
 * @returns {Promise<object>} backend response
 */
export const sendEmailResetCode = async (email) => {
  const res = await api.post('core/password/send-reset-code/', { email })
  return res.data
}

/**
 * Verify the OTP and set a new password.
 * Body: { phone, code, new_password }
 * @param {string} phone registered phone number
 * @param {string} code 6-digit OTP received via SMS
 * @param {string} new_password new password (min 6 chars)
 * @returns {Promise<object>} backend response
 */
export const confirmPasswordReset = async (phone, code, new_password) => {
  const res = await api.post('core/password/confirm-reset/', { phone, code, new_password })
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
