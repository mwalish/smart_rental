import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Ambient glows */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 text-center max-w-md w-full animate-fade-up">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-300 flex items-center justify-center shadow-xl">
            <i className="bi bi-house-door-fill text-white text-lg"></i>
          </div>
          <span className="text-2xl font-black text-white">Smart<span className="text-teal-400">Rent</span></span>
        </div>

        {/* 404 graphic */}
        <div className="relative mb-6">
          <h1 className="text-[9rem] md:text-[11rem] font-black leading-none bg-gradient-to-br from-teal-400 via-cyan-300 to-teal-500 bg-clip-text text-transparent">
            404
          </h1>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-teal-400 to-cyan-300 rounded-full opacity-60"></div>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Page Not Found</h2>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-10">
          The page you are looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
          >
            <i className="bi bi-arrow-left"></i> Back
          </button>

          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-500 hover:to-teal-400 transition-all text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-teal-900/30"
          >
            Go Home <i className="bi bi-arrow-right"></i>
          </Link>
        </div>

        <p className="text-xs text-slate-500 mt-10">
          If you believe this is a mistake, please contact your system administrator.
        </p>
      </div>
    </div>
  )
}

export default NotFound
