import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'

import { AuthContext } from './AuthContext'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // tenants now get full dashboard access; they keep house-hunting too
    return <Navigate to="/not-authorized" replace />
  }

  return children
}

export default ProtectedRoute