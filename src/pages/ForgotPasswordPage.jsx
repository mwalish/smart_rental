import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { sendResetCode, sendEmailResetCode, confirmPasswordReset } from '../services/authService'

// 3-step password recovery wizard.
// Step 0: choose delivery (email or SMS) + enter identifier → send OTP
// Step 1: enter 6-digit OTP (with resend countdown)
// Step 2: set new password + confirm
// Step 3: success
export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0) // 0=identifier, 1=otp, 2=new password, 3=success
  // Delivery method: 'email' (default — works with zero SMS credentials) or 'phone' (SMS).
  const [method, setMethod] = useState('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  // Resend countdown
  const [seconds, setSeconds] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  const startCountdown = (secs = 30) => {
    clearInterval(timerRef.current)
    setSeconds(secs)
    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfo('')
    try {
      if (method === 'email') {
        await sendEmailResetCode(email)
        setInfo('A 6-digit verification code has been sent to your email.')
      } else {
        await sendResetCode(phone)
        setInfo('A 6-digit verification code has been sent to your phone via SMS.')
      }
      setStep(1)
      startCountdown()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (seconds > 0) return
    setLoading(true)
    setError('')
    setInfo('')
    try {
      if (method === 'email') {
        await sendEmailResetCode(email)
        setInfo('A new verification code has been sent to your email.')
      } else {
        await sendResetCode(phone)
        setInfo('A new verification code has been sent to your phone.')
      }
      setCode('')
      startCountdown()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend reset code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Please enter the 6-digit code.')
      return
    }
    setLoading(true)
    setError('')
    try {
      // The backend doesn't expose a standalone "verify code" endpoint — we
      // validate the code during the password reset itself. So we simply move
      // to the password step and let the final submit handle verification.
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError('')
    try {
      if (method === 'email') {
        await confirmPasswordReset(email, code, newPassword)
      } else {
        await confirmPasswordReset(phone, code, newPassword)
      }
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed. Please check your code and try again.')
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    setError('')
    setInfo('')
    if (step === 1) setStep(0)
    else if (step === 2) setStep(1)
  }

  const formatPhone = (p) => {
    const digits = (p || '').replace(/\D/g, '').slice(0, 10)
    return digits
  }

  const canSubmitIdentifier = method === 'email'
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    : phone.length >= 10

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-cyan-400/15 rounded-full blur-3xl"></div>
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-300 flex items-center justify-center shadow-xl">
              <i className="bi bi-house-door-fill text-white text-xl"></i>
            </div>
            <span className="text-3xl font-black text-white">Smart<span className="text-teal-400">Rent</span></span>
          </div>
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">Reset Your<br />Password</h2>
          <p className="text-slate-300 text-lg max-w-xs mx-auto leading-relaxed">
            We'll send a secure verification code to your registered email or phone number.
          </p>
          <div className="mt-10 space-y-3 max-w-xs mx-auto text-left">
            {[
              'Choose email or SMS delivery',
              'Receive a 6-digit OTP',
              'Set a new password securely',
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${i <= step ? 'bg-teal-500/40' : 'bg-white/10'}`}>
                  <i className={`bi ${i < step ? 'bi-check' : 'bi-' + (i + 1)} text-teal-400 text-xs font-bold`}></i>
                </div>
                <span className="text-slate-300 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center">
                <i className="bi bi-house-door-fill text-white"></i>
              </div>
              <span className="text-2xl font-black">Smart<span className="text-teal-600">Rent</span></span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900">
              {step === 0 && 'Forgot Password'}
              {step === 1 && 'Enter Verification Code'}
              {step === 2 && 'Set New Password'}
              {step === 3 && 'Password Reset Complete'}
            </h1>
            <p className="text-gray-500 mt-1">
              {step === 0 && 'Choose how to receive your reset code'}
              {step === 1 && 'Check your email or SMS for the 6-digit code we sent'}
              {step === 2 && 'Choose a strong new password for your account'}
              {step === 3 && 'Your password has been updated successfully'}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[0, 1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step && step < 3 ? 'bg-teal-500' : 'bg-gray-200'}`}></div>
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                <i className="bi bi-exclamation-circle-fill text-red-500 mt-0.5 flex-shrink-0"></i>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {info && (
              <div className="mb-5 flex items-start gap-3 p-4 bg-teal-50 border border-teal-100 rounded-2xl">
                <i className="bi bi-info-circle-fill text-teal-500 mt-0.5 flex-shrink-0"></i>
                <p className="text-teal-700 text-sm">{info}</p>
              </div>
            )}

            {/* STEP 0 — Identifier (email or phone) */}
            {step === 0 && (
              <form onSubmit={handleSendCode} className="space-y-5">
                {/* Method toggle */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Receive code via</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMethod('email')}
                      className={`py-3 px-3 rounded-xl text-sm font-semibold border transition-colors flex items-center justify-center gap-2 ${
                        method === 'email'
                          ? 'bg-teal-50 border-teal-300 text-teal-700'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <i className="bi bi-envelope"></i> Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod('phone')}
                      className={`py-3 px-3 rounded-xl text-sm font-semibold border transition-colors flex items-center justify-center gap-2 ${
                        method === 'phone'
                          ? 'bg-teal-50 border-teal-300 text-teal-700'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <i className="bi bi-telephone"></i> SMS
                    </button>
                  </div>
                </div>

                {method === 'email' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="input-field w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Use the email address you registered with.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <i className="bi bi-telephone"></i>
                      </span>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        placeholder="0712345678"
                        className="input-field w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Use the phone number you registered with.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !canSubmitIdentifier}
                  className="btn-primary w-full py-3.5 text-base mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Sending Code...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <i className="bi bi-send-fill"></i> Send Reset Code
                    </span>
                  )}
                </button>
              </form>
            )}

            {/* STEP 1 — OTP */}
            {step === 1 && (
              <form onSubmit={handleVerifyCode} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Verification Code</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <i className="bi bi-shield-lock-fill"></i>
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="••••••"
                      className="input-field w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white tracking-[0.5em] text-center font-bold"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Sent to{' '}
                    <span className="font-semibold text-gray-600">
                      {method === 'email' ? email : '+254' + phone}
                    </span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="btn-primary w-full py-3.5 text-base mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <i className="bi bi-check2-circle"></i> Verify Code
                    </span>
                  )}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button type="button" onClick={goBack} className="text-gray-500 hover:text-gray-700 font-medium">
                    ← Change details
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading || seconds > 0}
                    className={`font-semibold ${seconds > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-teal-600 hover:text-teal-700'}`}
                  >
                    {seconds > 0 ? `Resend in ${seconds}s` : 'Resend code'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2 — New password */}
            {step === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="input-field w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <i className="bi bi-lock-fill"></i>
                    </span>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="input-field w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                    >
                      <i className={`bi ${showConfirm ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 text-base mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Resetting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <i className="bi bi-key-fill"></i> Reset Password
                    </span>
                  )}
                </button>

                <button type="button" onClick={goBack} className="w-full text-center text-sm text-gray-500 hover:text-gray-700 font-medium">
                  ← Back to code entry
                </button>
              </form>
            )}

            {/* STEP 3 — Success */}
            {step === 3 && (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <i className="bi bi-check-lg text-green-600 text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Your password has been reset. You can now sign in with your new password.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="btn-primary w-full py-3.5 text-base"
                >
                  <span className="flex items-center justify-center gap-2">
                    <i className="bi bi-box-arrow-in-right"></i> Go to Sign In
                  </span>
                </button>
              </div>
            )}

            <p className="text-center text-sm text-gray-500 mt-6">
              Remembered your password?{' '}
              <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">Sign In</Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            <Link to="/login" className="hover:text-teal-600 transition-colors">← Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

