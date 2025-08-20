import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'

const PublicRoute = () => {
  const { isAuthenticated, user, isLoading } = useAuth()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <LoadingSpinner size="lg" text="Loading..." color="white" />
      </div>
    )
  }

  // Redirect authenticated users to their dashboard
  if (isAuthenticated && user) {
    const dashboardPath = 
      user.role === 'patient' ? '/patient/dashboard' :
      user.role === 'doctor' ? '/doctor/dashboard' :
      user.role === 'admin' ? '/admin/dashboard' :
      '/dashboard'
    
    return <Navigate to={dashboardPath} replace />
  }

  // Render the public component
  return <Outlet />
}

export default PublicRoute
