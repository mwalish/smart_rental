import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how', label: 'How It Works' },
  { href: '#houses', label: 'Browse Properties', isRouter: true },
  { href: '#contact', label: 'Contact' },
]

const FEATURES = [
  { icon: 'bi-building', color: 'from-teal-500 to-cyan-400', title: 'Property Management', desc: 'Track all your units, set rent prices, and manage every detail from one sleek dashboard.' },
  { icon: 'bi-people-fill', color: 'from-violet-500 to-purple-400', title: 'Tenant Tracking', desc: 'Full tenant profiles, lease history, and contact records — always at your fingertips.' },
  { icon: 'bi-cash-stack', color: 'from-amber-500 to-yellow-400', title: 'Payment Tracking', desc: 'Monitor rent payments, view balances, and generate receipts with M-Pesa integration.' },
  { icon: 'bi-tools', color: 'from-orange-500 to-red-400', title: 'Maintenance Requests', desc: 'Tenants submit issues, landlords track and resolve them — all in real time.' },
  { icon: 'bi-calendar2-check', color: 'from-blue-500 to-indigo-400', title: 'Meeting Scheduling', desc: 'Arrange property viewings, confirm appointments, and avoid double bookings.' },
  { icon: 'bi-shield-lock-fill', color: 'from-green-500 to-emerald-400', title: 'Secure & Reliable', desc: 'JWT-secured, role-based access. Your data is encrypted and always protected.' },
]

const STEPS = [
  { num: '01', title: 'Browse Houses', desc: 'Search available rental houses by location, type, and price — free, no account needed.' },
  { num: '02', title: 'Create Account', desc: 'Sign up as a tenant in under a minute with your email and phone.' },
  { num: '03', title: 'Log In & View Details', desc: 'Sign in to see full property info and landlord contact.' },
  { num: '04', title: 'Apply & Move In', desc: 'Contact landlords directly, apply, and track your requests.' },
]

const STATS = [
  { value: '500+', label: 'Properties Managed' },
  { value: '1,200+', label: 'Happy Tenants' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: 'KSh 50M+', label: 'Rent Processed' },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="font-sans text-gray-900 overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg">
              <i className="bi bi-house-door-fill text-white text-base"></i>
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900">Smart<span className="text-teal-600">Rent</span></span>
          </Link>

<div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              l.isRouter ? (
                <Link key={l.href} to="/houses" className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors">{l.label}</Link>
              ) : (
                <a key={l.href} href={l.href} className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors">{l.label}</a>
              )
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/houses" className="px-5 py-2 text-sm font-semibold text-amber-700 border-2 border-amber-200 rounded-xl hover:border-amber-400 hover:bg-amber-50 transition-all">
              <i className="bi bi-search mr-1"></i>Browse Properties
            </Link>
            <Link to="/houses/register" className="px-5 py-2 text-sm font-semibold text-teal-700 border-2 border-teal-200 rounded-xl hover:border-teal-400 hover:bg-teal-50 transition-all">
              <i className="bi bi-person-plus mr-1"></i>Create Account
            </Link>
            <Link to="/login" className="px-5 py-2 text-sm font-semibold text-white rounded-xl btn-primary">
              Sign In
            </Link>
          </div>

          <button className="md:hidden text-gray-700 text-2xl" onClick={() => setMenuOpen(!menuOpen)}>
            <i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4 animate-fade-in">
            {NAV_LINKS.map(l => (
              l.isRouter ? (
                <Link key={l.href} to="/houses" className="text-sm font-medium text-gray-700 hover:text-teal-600" onClick={() => setMenuOpen(false)}>{l.label}</Link>
              ) : (
                <a key={l.href} href={l.href} className="text-sm font-medium text-gray-700 hover:text-teal-600" onClick={() => setMenuOpen(false)}>{l.label}</a>
              )
            ))}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <Link to="/houses/register" className="flex-1 text-center py-2 text-sm font-semibold text-teal-700 border-2 border-teal-200 rounded-xl">Create Account</Link>
              <Link to="/login" className="flex-1 text-center py-2 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-400 rounded-xl">Sign In</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900">
        {/* Background blobs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-20 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 text-center lg:text-left animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 border border-teal-500/30 rounded-full text-teal-300 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse-ring"></span>
                Kenya's #1 Rental Management Platform
              </div>
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] text-white mb-6">
                Manage Rentals<br />
                <span className="gradient-text">The Smart Way</span>
              </h1>
              <p className="text-lg text-slate-300 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Browse available rental houses across Kenya. Create a free account and sign in to unlock full property details and contact landlords directly.
              </p>
<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/houses" className="px-8 py-4 text-base font-bold text-white rounded-2xl bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-600 hover:to-orange-500 shadow-lg shadow-amber-600/30 transition-all hover:-translate-y-1">
                  <i className="bi bi-search mr-2"></i>Browse Houses
                </Link>
                <Link to="/houses/register" className="px-8 py-4 text-base font-bold text-white rounded-2xl btn-primary">
                  Create Account <i className="bi bi-arrow-right ml-2"></i>
                </Link>
                <a href="#features" className="px-8 py-4 text-base font-semibold text-white border-2 border-white/20 rounded-2xl hover:bg-white/10 transition-all">
                  <i className="bi bi-play-circle mr-2"></i>See Features
                </a>
              </div>

              {/* Mini stats */}
              <div className="flex flex-wrap gap-6 mt-12 justify-center lg:justify-start">
                {STATS.map(s => (
                  <div key={s.label} className="text-center lg:text-left">
                    <p className="text-2xl font-black text-white">{s.value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="lg:w-1/2 animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/30 to-cyan-400/20 rounded-3xl blur-2xl"></div>
                <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl">
                  {/* Mock dashboard card */}
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-white/60 text-xs font-medium">DASHBOARD OVERVIEW</p>
                      <p className="text-white font-bold text-lg mt-0.5">Good morning, James 👋</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-300 flex items-center justify-center font-bold text-white">J</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: 'Properties', val: '12', icon: 'bi-building', color: 'bg-teal-500/20 text-teal-300' },
                      { label: 'Active Leases', val: '9', icon: 'bi-file-earmark-text', color: 'bg-violet-500/20 text-violet-300' },
                      { label: 'This Month', val: 'KSh 87K', icon: 'bi-cash-stack', color: 'bg-amber-500/20 text-amber-300' },
                      { label: 'Pending', val: '3 requests', icon: 'bi-envelope', color: 'bg-blue-500/20 text-blue-300' },
                    ].map(c => (
                      <div key={c.label} className="bg-white/10 rounded-2xl p-4">
                        <div className={`w-8 h-8 rounded-lg ${c.color} flex items-center justify-center mb-2`}>
                          <i className={`bi ${c.icon} text-sm`}></i>
                        </div>
                        <p className="text-white font-bold text-lg leading-none">{c.val}</p>
                        <p className="text-white/50 text-xs mt-1">{c.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4">
                    <p className="text-white/60 text-xs mb-3">RECENT PAYMENTS</p>
                    {[
                      { name: 'Alice Wanjiru', amt: 'KSh 18,000', status: 'Paid', color: 'text-green-400' },
                      { name: 'Brian Otieno', amt: 'KSh 22,500', status: 'Pending', color: 'text-amber-400' },
                      { name: 'Carol Muthoni', amt: 'KSh 15,000', status: 'Paid', color: 'text-green-400' },
                    ].map(p => (
                      <div key={p.name} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-teal-500/30 flex items-center justify-center text-teal-300 text-xs font-bold">{p.name[0]}</div>
                          <span className="text-white/80 text-sm">{p.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm font-semibold">{p.amt}</p>
                          <p className={`text-xs ${p.color}`}>{p.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-700 text-sm font-semibold rounded-full mb-4">FEATURES</span>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">Built for Kenyan landlords and tenants — powerful, simple, and mobile-ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="bg-white rounded-2xl p-7 border border-gray-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group" style={{ animationDelay: `${i * 0.07}s` }}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <i className={`bi ${f.icon} text-white text-xl`}></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

{/* ── For Tenants Section ── */}
      <section className="py-24 px-6 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-center lg:text-left">
              <span className="inline-block px-4 py-1.5 bg-amber-500/20 text-amber-300 text-sm font-semibold rounded-full mb-4">
                FOR TENANTS
              </span>
              <h2 className="text-4xl font-black text-white mb-4">Looking for a Place to Rent?</h2>
              <p className="text-slate-300 text-lg mb-6 max-w-lg leading-relaxed">
                Browse hundreds of available houses across Kenya for free. When you're committed, create an account and sign in to unlock full details and contact landlords directly.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  'Search by location, type, or price range',
                  'Create a free tenant account',
                  'Log in to view landlord contact',
                  "Apply & track requests on the landlord's side",
                ].map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-teal-500/30 flex items-center justify-center shrink-0">
                      <i className="bi bi-check text-teal-400 text-xs font-bold"></i>
                    </div>
                    <span className="text-slate-300 text-sm">{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/houses" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-400 text-white font-bold rounded-2xl shadow-lg shadow-amber-600/30 hover:-translate-y-1 transition-all">
                <i className="bi bi-search"></i> Browse Available Houses
                <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl">
                {/* Mock property card */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center shadow-lg">
                    <i className="bi bi-building text-white text-xl"></i>
                  </div>
                  <div>
                    <p className="text-white font-bold">Modern 2-Bedroom Apartment</p>
                    <p className="text-slate-400 text-sm">KSh 25,000/mo · Westlands, Nairobi</p>
                  </div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">🛏️ 2 Bedrooms</span>
                    <span className="text-slate-300">🛁 1 Bathroom</span>
                    <span className="text-slate-300">📐 850 sq ft</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-teal-500/40 border-2 border-slate-800 flex items-center justify-center text-white text-xs font-bold">
                        {['A', 'B', 'K'][i - 1]}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-slate-400 text-xs">
                      +12
                    </div>
                  </div>
                  <span className="text-teal-400 text-sm font-semibold">✨ Available Now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-violet-100 text-violet-700 text-sm font-semibold rounded-full mb-4">HOW IT WORKS</span>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Up & Running in Minutes</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">No technical skills needed. Just sign in and start managing.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.num} className="relative text-center">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-teal-200 to-transparent"></div>
                )}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white font-black text-lg">{s.num}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-6 bg-gradient-to-r from-teal-600 to-cyan-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4">Ready to Find Your Next Home?</h2>
          <p className="text-teal-100 text-lg mb-8">Browse houses for free — create an account and log in to see full details & landlord contact.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/houses" className="inline-block px-10 py-4 bg-white text-teal-700 font-bold text-base rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              Browse Houses <i className="bi bi-arrow-right ml-2"></i>
            </Link>
            <Link to="/houses/register" className="inline-block px-10 py-4 bg-amber-500 text-white font-bold text-base rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer id="contact" className="bg-slate-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center">
                  <i className="bi bi-house-door-fill text-white text-base"></i>
                </div>
                <span className="text-xl font-black">Smart<span className="text-teal-400">Rent</span></span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">The modern way to manage rental properties in Kenya. Built for landlords and tenants.</p>
              <div className="flex gap-3 mt-5">
                {['bi-twitter-x', 'bi-facebook', 'bi-instagram', 'bi-linkedin'].map(icon => (
                  <a key={icon} href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-teal-600 flex items-center justify-center transition-colors">
                    <i className={`bi ${icon} text-sm`}></i>
                  </a>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              {[
                { title: 'Platform', links: ['Features', 'Pricing', 'Security'] },
                { title: 'Company', links: ['About', 'Blog', 'Careers'] },
                { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies'] },
              ].map(col => (
                <div key={col.title}>
                  <h4 className="font-bold text-sm text-slate-300 mb-4 uppercase tracking-wider">{col.title}</h4>
                  <ul className="space-y-2.5">
                    {col.links.map(l => (
                      <li key={l}><a href="#" className="text-slate-400 text-sm hover:text-teal-400 transition-colors">{l}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
            <p>© 2026 SmartRent. All rights reserved.</p>
            <p>Made with <i className="bi bi-heart-fill text-red-500 mx-1"></i> in Kenya</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
