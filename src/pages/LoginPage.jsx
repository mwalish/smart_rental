import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../AuthContext'
import api from '../services/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setToken, setUser } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // 👇 New state for password visibility
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')

    const formData = new FormData(e.target)
    const credentials = {
      email: formData.get('email'),
      password: formData.get('password')
    }

    try {
      const res = await api.post('core/login/', credentials)
      const { access, refresh, user } = res.data

      setToken(access)
      setUser(user)
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      localStorage.setItem('user', JSON.stringify(user))

      navigate('/dashboard')
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        err.response?.data?.non_field_errors?.[0] || 
        'Login failed. Check your email and password.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <i className="bi bi-house-door text-teal-600 text-2xl"></i>
            <span className="text-2xl font-bold text-teal-600">SmartRent</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-800 mt-6">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to access your account</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  name="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                  placeholder="Enter your @email.com"
                  required
                />
              </div>
            </div>

            {/* 👇 Updated Password Field with Toggle */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                  placeholder="••••••••"
                  required
                />
                {/* Toggle Button */}
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

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="#" className="text-sm text-teal-600 hover:underline">Forgot password?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-teal-600 font-medium hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
// import React, { useState, useContext } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { AuthContext } from '../AuthContext'
// import api from '../services/api'

// export default function LoginPage() {
//   const navigate = useNavigate()
//   const { setToken, setUser } = useContext(AuthContext)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')

//     const formData = new FormData(e.target)
//     const credentials = {
//       email: formData.get('email'),
//       password: formData.get('password')
//     }

//     try {
//       // Call your Django login API
//       // const res = await api.post('login/', credentials)
//       const res = await api.post('core/login/', credentials) 
//       const { access, refresh, user } = res.data

//       // Save to global state & localStorage
//       setToken(access)
//       setUser(user)
//       localStorage.setItem('access_token', access)
//       localStorage.setItem('refresh_token', refresh)
//       localStorage.setItem('user', JSON.stringify(user))

//       // Redirect to dashboard
//       navigate('/dashboard')
//     } catch (err) {
//       setError(
//         err.response?.data?.detail || 
//         err.response?.data?.non_field_errors?.[0] || 
//         'Login failed. Check your email and password.'
//       )
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <Link to="/" className="inline-flex items-center gap-2">
//             {/* ✅ Updated to Bootstrap Icons */}
//             <i className="bi bi-house-door text-teal-600 text-2xl"></i>
//             <span className="text-2xl font-bold text-teal-600">SmartRent</span>
//           </Link>
//           <h2 className="text-2xl font-bold text-gray-800 mt-6">Welcome Back</h2>
//           <p className="text-gray-600 mt-2">Sign in to access your account</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
//           {error && (
//             <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit}>
//             <div className="mb-5">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
//               <div className="relative">
//                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
//                   {/* ✅ Updated */}
//                   <i className="bi bi-envelope"></i>
//                 </span>
//                 <input
//                   type="email"
//                   name="email"
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
//                   placeholder="Enter your @email.com"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="mb-5">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
//               <div className="relative">
//                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
//                   {/* ✅ Updated */}
//                   <i className="bi bi-lock"></i>
//                 </span>
//                 <input
//                   type="password"
//                   name="password"
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
//                   placeholder="••••••••"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="flex items-center justify-between mb-6">
//               <label className="flex items-center gap-2 cursor-pointer">
//                 <input type="checkbox" className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500" />
//                 <span className="text-sm text-gray-600">Remember me</span>
//               </label>
//               <Link to="#" className="text-sm text-teal-600 hover:underline">Forgot password?</Link>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Signing In...' : 'Sign In'}
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             <p className="text-sm text-gray-600">
//               Don't have an account?{' '}
//               <Link to="/register" className="text-teal-600 font-medium hover:underline">Sign up</Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
