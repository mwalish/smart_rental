import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="font-sans text-gray-900">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm fixed w-full z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            {/* ✅ Updated */}
            <i className="bi bi-house-door text-teal-600 text-2xl"></i>
            <span className="text-xl font-bold text-teal-600">SmartRent</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="font-medium hover:text-teal-600 transition-colors">Features</a>
            <a href="#contact" className="font-medium hover:text-teal-600 transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 font-medium text-teal-600 border border-teal-600 rounded-lg hover:bg-teal-50 transition-colors">Login</Link>
            <Link to="/register" className="px-4 py-2 font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors hidden sm:block">Get Started</Link>
            <button 
              className="md:hidden text-xl text-teal-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {/* ✅ Updated */}
              <i className="bi bi-list"></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="container mx-auto px-4 py-3 flex flex-col gap-3">
              <a 
                href="#features" 
                className="py-2 hover:text-teal-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#contact" 
                className="py-2 hover:text-teal-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
              <Link 
                to="/login" 
                className="py-2 hover:text-teal-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="py-2 hover:text-teal-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-teal-50 to-green-50">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-center lg:text-left">
              <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-extrabold leading-[1.1] mb-4">
                Manage Your Rental Properties <span className="text-teal-600">The Smart Way</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Streamline tenant management, track payments, schedule viewings, and handle maintenance requests — all in one beautiful platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  to="/register" 
                  className="px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-teal-700 transition-all"
                >
                  Create Free Account
                </Link>
                <a 
                  href="#features" 
                  className="px-8 py-3 bg-white text-teal-600 font-semibold border border-teal-600 rounded-lg hover:bg-teal-50 transition-all"
                >
                  See Features
                </a>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-teal-600/20 to-green-500/20 rounded-2xl blur-xl"></div>
                <img 
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Modern Apartment" 
                  className="relative rounded-xl shadow-2xl w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-bold mb-4">Everything You Need in One Place</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Designed for landlords, tenants, and property managers — simple, powerful, and intuitive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mb-6">
                {/* ✅ Updated */}
                <i className="bi bi-building text-teal-600 text-xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Property Management</h3>
              <p className="text-gray-600">
                Track all your units, set rent prices, and manage details from a single dashboard.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-6">
                {/* ✅ Updated */}
                <i className="bi bi-people text-green-600 text-xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Tenant Tracking</h3>
              <p className="text-gray-600">
                Keep records of tenants, leases, and contact information with full history.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                {/* ✅ Updated */}
                <i className="bi bi-cash-coin text-blue-600 text-xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Payment Tracking</h3>
              <p className="text-gray-600">
                Monitor rent payments, view balances, and generate receipts automatically.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mb-6">
                {/* ✅ Updated */}
                <i className="bi bi-wrench text-orange-600 text-xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Maintenance Requests</h3>
              <p className="text-gray-600">
                Receive and resolve repair requests, track status and assign contractors.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-6">
                {/* ✅ Updated */}
                <i className="bi bi-calendar-event text-purple-600 text-xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Viewing Scheduling</h3>
              <p className="text-gray-600">
                Arrange property viewings, confirm appointments, and avoid double bookings.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-6">
                {/* ✅ Updated */}
                <i className="bi bi-shield-lock text-red-600 text-xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Secure & Reliable</h3>
              <p className="text-gray-600">
                Your data is encrypted, backed up, and accessible only to authorized users.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                {/* ✅ Updated */}
                <i className="bi bi-house-door text-teal-500 text-2xl"></i>
                <span className="text-xl font-bold">SmartRent</span>
              </div>
              <p className="text-gray-400 max-w-xs">
                The modern way to manage rental properties for everyone.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold mb-4 text-gray-300">Platform</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#features" className="hover:text-teal-500 transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-teal-500 transition-colors">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-gray-300">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-teal-500 transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-teal-500 transition-colors">Blog</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-gray-300">Legal</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-teal-500 transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-teal-500 transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-10 pt-8 text-center text-gray-500 text-sm">
            © 2026 Smart Rental System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
// import React, { useState } from 'react'
// import { Link } from 'react-router-dom'

// export default function LandingPage() {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

//   return (
//     <div className="font-sans text-gray-900">
//       {/* Navigation */}
//       <nav className="bg-white/90 backdrop-blur-sm fixed w-full z-50 shadow-sm">
//         <div className="container mx-auto px-4 py-4 flex justify-between items-center">
//           <Link to="/" className="flex items-center gap-2">
//             <i className="fa fa-home text-teal-600 text-2xl"></i>
//             <span className="text-xl font-bold text-teal-600">SmartRent</span>
//           </Link>
          
//           <div className="hidden md:flex items-center gap-8">
//             <a href="#features" className="font-medium hover:text-teal-600 transition-colors">Features</a>
//             <a href="#contact" className="font-medium hover:text-teal-600 transition-colors">Contact</a>
//           </div>

//           <div className="flex items-center gap-3">
//             <Link to="/login" className="px-4 py-2 font-medium text-teal-600 border border-teal-600 rounded-lg hover:bg-teal-50 transition-colors">Login</Link>
//             <Link to="/register" className="px-4 py-2 font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors hidden sm:block">Get Started</Link>
//             <button 
//               className="md:hidden text-xl text-teal-600"
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//             >
//               <i className="fa fa-bars"></i>
//             </button>
//           </div>
//         </div>

//         {/* Mobile Menu */}
//         {mobileMenuOpen && (
//           <div className="md:hidden bg-white border-t">
//             <div className="container mx-auto px-4 py-3 flex flex-col gap-3">
//               <a 
//                 href="#features" 
//                 className="py-2 hover:text-teal-600"
//                 onClick={() => setMobileMenuOpen(false)}
//               >
//                 Features
//               </a>
//               <a 
//                 href="#contact" 
//                 className="py-2 hover:text-teal-600"
//                 onClick={() => setMobileMenuOpen(false)}
//               >
//                 Contact
//               </a>
//               <Link 
//                 to="/login" 
//                 className="py-2 hover:text-teal-600"
//                 onClick={() => setMobileMenuOpen(false)}
//               >
//                 Login
//               </Link>
//               <Link 
//                 to="/register" 
//                 className="py-2 hover:text-teal-600"
//                 onClick={() => setMobileMenuOpen(false)}
//               >
//                 Get Started
//               </Link>
//             </div>
//           </div>
//         )}
//       </nav>

//       {/* Hero Section */}
//       <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-teal-50 to-green-50">
//         <div className="container mx-auto">
//           <div className="flex flex-col lg:flex-row items-center gap-12">
//             <div className="lg:w-1/2 text-center lg:text-left">
//               <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-extrabold leading-[1.1] mb-4">
//                 Manage Your Rental Properties <span className="text-teal-600">The Smart Way</span>
//               </h1>
//               <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
//                 Streamline tenant management, track payments, schedule viewings, and handle maintenance requests — all in one beautiful platform.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
//                 <Link 
//                   to="/register" 
//                   className="px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-teal-700 transition-all"
//                 >
//                   Create Free Account
//                 </Link>
//                 <a 
//                   href="#features" 
//                   className="px-8 py-3 bg-white text-teal-600 font-semibold border border-teal-600 rounded-lg hover:bg-teal-50 transition-all"
//                 >
//                   See Features
//                 </a>
//               </div>
//             </div>
//             <div className="lg:w-1/2">
//               <div className="relative">
//                 <div className="absolute -inset-4 bg-gradient-to-r from-teal-600/20 to-green-500/20 rounded-2xl blur-xl"></div>
//                 <img 
//                   src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
//                   alt="Modern Apartment" 
//                   className="relative rounded-xl shadow-2xl w-full object-cover"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className="py-20 px-4 bg-white">
//         <div className="container mx-auto">
//           <div className="text-center mb-16">
//             <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-bold mb-4">Everything You Need in One Place</h2>
//             <p className="text-gray-600 max-w-2xl mx-auto">
//               Designed for landlords, tenants, and property managers — simple, powerful, and intuitive.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all">
//               <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mb-6">
//                 <i className="fa fa-building text-teal-600 text-xl"></i>
//               </div>
//               <h3 className="text-xl font-bold mb-3">Property Management</h3>
//               <p className="text-gray-600">
//                 Track all your units, set rent prices, and manage details from a single dashboard.
//               </p>
//             </div>

//             <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all">
//               <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-6">
//                 <i className="fa fa-users text-green-600 text-xl"></i>
//               </div>
//               <h3 className="text-xl font-bold mb-3">Tenant Tracking</h3>
//               <p className="text-gray-600">
//                 Keep records of tenants, leases, and contact information with full history.
//               </p>
//             </div>

//             <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all">
//               <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-6">
//                 <i className="fa fa-money text-blue-600 text-xl"></i>
//               </div>
//               <h3 className="text-xl font-bold mb-3">Payment Tracking</h3>
//               <p className="text-gray-600">
//                 Monitor rent payments, view balances, and generate receipts automatically.
//               </p>
//             </div>

//             <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all">
//               <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mb-6">
//                 <i className="fa fa-wrench text-orange-600 text-xl"></i>
//               </div>
//               <h3 className="text-xl font-bold mb-3">Maintenance Requests</h3>
//               <p className="text-gray-600">
//                 Receive and resolve repair requests, track status and assign contractors.
//               </p>
//             </div>

//             <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all">
//               <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-6">
//                 <i className="fa fa-calendar text-purple-600 text-xl"></i>
//               </div>
//               <h3 className="text-xl font-bold mb-3">Viewing Scheduling</h3>
//               <p className="text-gray-600">
//                 Arrange property viewings, confirm appointments, and avoid double bookings.
//               </p>
//             </div>

//             <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all">
//               <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-6">
//                 <i className="fa fa-shield text-red-600 text-xl"></i>
//               </div>
//               <h3 className="text-xl font-bold mb-3">Secure & Reliable</h3>
//               <p className="text-gray-600">
//                 Your data is encrypted, backed up, and accessible only to authorized users.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer id="contact" className="bg-gray-900 text-white py-12 px-4">
//         <div className="container mx-auto">
//           <div className="flex flex-col md:flex-row justify-between gap-8">
//             <div>
//               <div className="flex items-center gap-2 mb-4">
//                 <i className="fa fa-home text-teal-500 text-2xl"></i>
//                 <span className="text-xl font-bold">SmartRent</span>
//               </div>
//               <p className="text-gray-400 max-w-xs">
//                 The modern way to manage rental properties for everyone.
//               </p>
//             </div>
//             <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
//               <div>
//                 <h4 className="font-semibold mb-4 text-gray-300">Platform</h4>
//                 <ul className="space-y-2 text-gray-400">
//                   <li><a href="#features" className="hover:text-teal-500 transition-colors">Features</a></li>
//                   <li><a href="#" className="hover:text-teal-500 transition-colors">Pricing</a></li>
//                 </ul>
//               </div>
//               <div>
//                 <h4 className="font-semibold mb-4 text-gray-300">Company</h4>
//                 <ul className="space-y-2 text-gray-400">
//                   <li><a href="#" className="hover:text-teal-500 transition-colors">About</a></li>
//                   <li><a href="#" className="hover:text-teal-500 transition-colors">Blog</a></li>
//                 </ul>
//               </div>
//               <div>
//                 <h4 className="font-semibold mb-4 text-gray-300">Legal</h4>
//                 <ul className="space-y-2 text-gray-400">
//                   <li><a href="#" className="hover:text-teal-500 transition-colors">Privacy</a></li>
//                   <li><a href="#" className="hover:text-teal-500 transition-colors">Terms</a></li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//           <div className="border-t border-gray-700 mt-10 pt-8 text-center text-gray-500 text-sm">
//             © 2026 Smart Rental System. All rights reserved.
//           </div>
//         </div>
//       </footer>
//     </div>
//   )
// }