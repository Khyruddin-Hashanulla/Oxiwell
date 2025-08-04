import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from './contexts/AuthContext'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'

// Layout components
import DashboardLayout from './components/layout/DashboardLayout'
import PublicLayout from './components/layout/PublicLayout'
import AuthLayout from './components/layout/AuthLayout'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// Public pages
import LandingPage from './pages/public/LandingPage'
import AboutPage from './pages/public/AboutPage'
import ContactPage from './pages/public/ContactPage'

// Dashboard pages (using the ones that exist)
import PatientDashboard from './pages/patient/PatientDashboard'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'

// Patient pages
import AppointmentBooking from './pages/patient/AppointmentBooking'
import Appointments from './pages/patient/Appointments'
import Prescriptions from './pages/patient/Prescriptions'

// Doctor pages
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import DoctorPatients from './pages/doctor/DoctorPatients'

function App() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading Oxiwell..." />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Oxiwell Health Center</title>
        <meta name="description" content="Modern healthcare management system" />
      </Helmet>

      <Routes>
        {/* Public Routes - accessible to everyone */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Auth Routes - only for unauthenticated users */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>
        </Route>

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* Patient Routes */}
            <Route path="/patient" element={<Navigate to="/patient/dashboard" replace />} />
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/appointments" element={<Appointments />} />
            <Route path="/patient/appointments/book" element={<AppointmentBooking />} />
            <Route path="/patient/prescriptions" element={<Prescriptions />} />
            
            {/* Doctor Routes */}
            <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/appointments" element={<DoctorAppointments />} />
            <Route path="/doctor/patients" element={<DoctorPatients />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* Fallback Routes */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-4">Page not found</p>
              <a href="/" className="text-primary-600 hover:text-primary-700">
                Go back home
              </a>
            </div>
          </div>
        } />
      </Routes>
    </>
  )
}

// Component to redirect users to their role-based dashboard
const DashboardRedirect = () => {
  const { user } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  switch (user.role) {
    case 'patient':
      return <Navigate to="/patient/dashboard" replace />
    case 'doctor':
      return <Navigate to="/doctor/dashboard" replace />
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />
    default:
      return <Navigate to="/" replace />
  }
}

export default App
