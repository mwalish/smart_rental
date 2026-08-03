import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'

import { AuthContext } from './AuthContext'

const ProtectedRoute = ({ children, allowedRoles, allowUnregisteredTenant = false }) => {
  const { user, profile } = useContext(AuthContext)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // tenants now get full dashboard access; they keep house-hunting too
    return <Navigate to="/not-authorized" replace />
  }

  // New tenants who self-register via house-hunting are NOT yet linked to any
  // house. Until a landlord registers them (registered_by / active lease),
  // they must NOT access the full tenant dashboard features that assume an
  // assigned property (payments, maintenance, notices, etc.).
  const isTenantRegistered =
    user.role !== 'tenant' ||
    !!(profile?.registered_by_name || profile?.registered_by) ||
    !!(profile?.active_lease || profile?.has_lease)

  if (user.role === 'tenant' && !isTenantRegistered && !allowUnregisteredTenant) {
    return <Navigate to="/not-authorized" replace />
  }

  return children
}

export default ProtectedRoute
