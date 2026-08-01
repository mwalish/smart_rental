import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'

import { AuthContext } from './AuthContext'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // tenants belong to house-hunting portal, not the main dashboard
    if (user.role === 'tenant') return <Navigate to="/houses/dashboard" replace />
    return <Navigate to="/not-authorized" replace />
  }

  return children
}

export default ProtectedRoute