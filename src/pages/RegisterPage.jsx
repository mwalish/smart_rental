import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  // 👇 Add toggle states
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData(e.target)
    const userData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      role: formData.get('role'),
      password: formData.get('password'),
      password2: formData.get('password2')
    }

    // Basic client-side validation
    if (userData.password !== userData.password2) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      await api.post('core/register/', userData)
      setSuccess('Account created successfully! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const errorData = err.response?.data
      if (errorData) {
        const messages = []
        for (const field in errorData) {
          messages.push(`${field}: ${errorData[field].join(', ')}`)
        }
        setError(messages.join(' | '))
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <i className="bi bi-house-door text-teal-600 text-2xl"></i>
            <span className="text-2xl font-bold text-teal-600">SmartRent</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-800 mt-6">Create Your Account</h2>
          <p className="text-gray-600 mt-2">Join SmartRent today</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                placeholder="2547XXXXXXXX"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              <select
                name="role"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                required
              >
                <option value="">Select type</option>
                <option value="landlord">Landlord / Property Manager</option>
                <option value="tenant">Tenant</option>
              </select>
            </div>

            {/* 👇 Updated Password Field with Toggle */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="w-full px-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
            </div>

            {/* 👇 Updated Confirm Password Field with Toggle */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="password2"
                  className="w-full px-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-600 transition-colors"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-600 font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
// import React, { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import api from '../services/api'

// export default function RegisterPage() {
//   const navigate = useNavigate()
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')
//     setSuccess('')

//     const formData = new FormData(e.target)
//     const userData = {
//       name: formData.get('name'),
//       email: formData.get('email'),
//       phone: formData.get('phone'),
//       role: formData.get('role'),
//       password: formData.get('password'),
//       password2: formData.get('password2')
//     }

//     // Basic client-side validation
//     if (userData.password !== userData.password2) {
//       setError('Passwords do not match')
//       setLoading(false)
//       return
//     }

//     try {
//       // Call your Django registration API
//       // await api.post('register/', userData)
//       await api.post('core/register/', userData)
//       setSuccess('Account created successfully! Redirecting to login...')
//       // Auto redirect after 2 seconds
//       setTimeout(() => navigate('/login'), 2000)
//     } catch (err) {
//       const errorData = err.response?.data
//       // Handle Django form errors nicely
//       if (errorData) {
//         const messages = []
//         for (const field in errorData) {
//           messages.push(`${field}: ${errorData[field].join(', ')}`)
//         }
//         setError(messages.join(' | '))
//       } else {
//         setError('Registration failed. Please try again.')
//       }
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 py-12">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <Link to="/" className="inline-flex items-center gap-2">
//             {/* ✅ Updated */}
//             <i className="bi bi-house-door text-teal-600 text-2xl"></i>
//             <span className="text-2xl font-bold text-teal-600">SmartRent</span>
//           </Link>
//           <h2 className="text-2xl font-bold text-gray-800 mt-6">Create Your Account</h2>
//           <p className="text-gray-600 mt-2">Join SmartRent today</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
//           {/* Status Messages */}
//           {error && (
//             <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
//               {error}
//             </div>
//           )}
//           {success && (
//             <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">
//               {success}
//             </div>
//           )}

//           <form onSubmit={handleSubmit}>
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
//               <input
//                 type="text"
//                 name="name"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
//                 required
//               />
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
//               <input
//                 type="email"
//                 name="email"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
//                 required
//               />
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
//               <input
//                 type="tel"
//                 name="phone"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
//                 placeholder="2547XXXXXXXX"
//                 required
//               />
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
//               <select
//                 name="role"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
//                 required
//               >
//                 <option value="">Select type</option>
//                 <option value="landlord">Landlord / Property Manager</option>
//                 <option value="tenant">Tenant</option>
//               </select>
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
//               <input
//                 type="password"
//                 name="password"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
//                 required
//               />
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
//               <input
//                 type="password"
//                 name="password2"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
//                 required
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Creating Account...' : 'Create Account'}
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             <p className="text-sm text-gray-600">
//               Already have an account?{' '}
//               <Link to="/login" className="text-teal-600 font-medium hover:underline">Sign in</Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }