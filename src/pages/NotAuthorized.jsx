import React from 'react'
import { useNavigate } from 'react-router-dom'

const NotAuthorized = () => {
  const navigate = useNavigate()

  return (
    <div className='min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6'>
      <div className='text-center max-w-md w-full'>
        <h1 className='text-9xl font-extrabold text-red-500 leading-none'>403</h1>
        <div className='w-16 h-1 bg-red-500 mx-auto my-4 rounded-full'></div>
        
        <h2 className='text-2xl font-bold text-gray-800 mb-2'>Access Denied</h2>
        <p className='text-gray-600 mb-8'>
          You don’t have permission to view this page. Please log in with an authorized account.
        </p>

        <div className='flex flex-col sm:flex-row items-center justify-center gap-3'>
          <button 
            onClick={() => navigate(-1)} 
            className='w-full sm:w-auto px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium'
          >
            Back
          </button>
         
          <button 
            onClick={() => navigate('/login')} 
            className='w-full sm:w-auto px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium'
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotAuthorized