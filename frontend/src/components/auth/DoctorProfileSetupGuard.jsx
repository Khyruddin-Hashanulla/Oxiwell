import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { doctorsAPI } from '../../services/api'
import api from '../../services/api'
import LoadingSpinner from '../ui/LoadingSpinner'
import Cookies from 'js-cookie'

const DoctorProfileSetupGuard = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profileSetupRequired, setProfileSetupRequired] = useState(false)

  useEffect(() => {
    const checkProfileSetup = async () => {
      // Wait for auth to be fully loaded
      if (isLoading) {
        console.log('⏳ Auth is still loading, waiting...')
        return
      }

      if (user?.role !== 'doctor') {
        console.log('👤 User is not a doctor, skipping profile setup check')
        setLoading(false)
        return
      }

      if (!isAuthenticated) {
        console.log('🔒 User is not authenticated, skipping profile setup check')
        setLoading(false)
        return
      }

      // Additional delay to ensure token is set after auth completes
      await new Promise(resolve => setTimeout(resolve, 300))

      // Check if token exists in cookies OR axios headers
      const cookieToken = Cookies.get('token')
      const axiosToken = api.defaults.headers.common['Authorization']
      
      console.log('🔍 Token check:', {
        cookieToken: cookieToken ? 'Found' : 'Not found',
        axiosToken: axiosToken ? 'Found' : 'Not found',
        cookiePreview: cookieToken ? cookieToken.substring(0, 20) + '...' : 'None',
        axiosPreview: axiosToken ? axiosToken.substring(0, 20) + '...' : 'None'
      })

      if (!cookieToken && !axiosToken) {
        console.log('⏳ No token found in cookies or axios headers, retrying...')
        // Try again after a longer delay
        setTimeout(() => {
          if (loading) { // Only retry if still loading
            console.log('🔄 Retrying token check...')
            checkProfileSetup()
          }
        }, 500)
        return
      }

      try {
        console.log('🔍 Checking if doctor profile setup is required...')
        console.log('👤 Current user:', user)
        console.log('🔑 Token available:', !!(cookieToken || axiosToken))
        
        const response = await doctorsAPI.checkProfileSetupRequired()
        console.log('📡 API Response:', response)
        console.log('📊 Response data:', response.data)
        
        const setupRequired = response.data?.data?.profileSetupRequired || false
        const setupCompleted = response.data?.data?.profileSetupCompleted || false
        
        console.log('✅ Profile setup required:', setupRequired)
        console.log('✅ Profile setup completed:', setupCompleted)
        console.log('🎯 Will redirect to setup:', setupRequired)
        
        setProfileSetupRequired(setupRequired)
      } catch (error) {
        console.error('❌ Error checking profile setup status:', error)
        
        // Check if it's an authentication error
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('🔒 Authentication error, user needs to login again')
          setProfileSetupRequired(false) // Don't redirect to setup, let auth handle it
        } else if (error.response?.status === 404) {
          console.log('🚫 Profile setup endpoint not found, assuming setup not required')
          setProfileSetupRequired(false)
        } else {
          // For other errors, assume setup is required for safety
          console.log('⚠️ Unknown error, assuming setup is required')
          setProfileSetupRequired(true)
        }
      } finally {
        setLoading(false)
      }
    }

    checkProfileSetup()
  }, [user, isAuthenticated, isLoading]) // Add dependencies to re-run when auth state changes

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Checking profile status..." />
      </div>
    )
  }

  // If doctor needs to complete profile setup, redirect to setup page
  if (user?.role === 'doctor' && profileSetupRequired) {
    return <Navigate to="/doctor/profile-setup" replace />
  }

  // Otherwise, render the protected component
  return children
}

export default DoctorProfileSetupGuard
