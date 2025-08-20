import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user, isLoading } = useAuth()
  const location = useLocation()

  // Debug logging to trace authentication state
  console.log('🔒 ProtectedRoute Debug:', {
    isAuthenticated,
    isLoading,
    user: user ? { id: user._id, role: user.role, name: user.firstName } : null,
    currentPath: location.pathname,
    allowedRoles
  })

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log('⏳ ProtectedRoute: Still loading authentication...')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <LoadingSpinner size="lg" text="Checking authentication..." color="white" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('❌ ProtectedRoute: Not authenticated, redirecting to login')
    console.log('🔍 Debug details:', {
      isAuthenticated,
      user,
      tokenExists: document.cookie.includes('token'),
      currentPath: location.pathname
    })
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    console.log('🚫 ProtectedRoute: Role not allowed', {
      userRole: user?.role,
      allowedRoles
    })
    return <Navigate to="/unauthorized" replace />
  }

  console.log('✅ ProtectedRoute: Access granted')
  // Render the protected component
  return <Outlet />
}

export default ProtectedRoute
