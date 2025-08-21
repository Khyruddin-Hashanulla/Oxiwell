import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from './contexts/AuthContext'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'
import DoctorProfileSetupGuard from './components/auth/DoctorProfileSetupGuard'

// Layout components
import DashboardLayout from './components/layout/DashboardLayout'
import PublicLayout from './components/layout/PublicLayout'
import AuthLayout from './components/layout/AuthLayout'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Public pages
import LandingPage from './pages/public/LandingPage'
import AboutPage from './pages/public/AboutPage'
import ContactPage from './pages/public/ContactPage'
import ServicesPage from './pages/public/ServicesPage'
import HelpPage from './pages/public/HelpPage'
import SupportPage from './pages/public/SupportPage'
import PrivacyPage from './pages/public/PrivacyPage'
import TermsPage from './pages/public/TermsPage'
import FindDoctorsPage from './pages/public/FindDoctorsPage'
import NewsletterUnsubscribePage from './pages/public/NewsletterUnsubscribePage'

// Dashboard pages (using the ones that exist)
import PatientDashboard from './pages/patient/PatientDashboard'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProfile from './pages/admin/AdminProfile'
import AdminUsers from './pages/admin/AdminUsers'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminSettings from './pages/admin/AdminSettings'
import AdminApprovals from './pages/admin/AdminApprovals'
import AdminActivity from './pages/admin/AdminActivity'

// Patient pages
import AppointmentBooking from './pages/patient/AppointmentBooking'
import Appointments from './pages/patient/Appointments'
import Prescriptions from './pages/patient/Prescriptions'
import PatientProfile from './pages/patient/PatientProfile'
import PatientSettings from './pages/patient/PatientSettings'
import Reports from './pages/patient/Reports'
import UploadReport from './pages/patient/UploadReport'

// Doctor pages
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import DoctorPatients from './pages/doctor/DoctorPatients'
import PatientDetails from './pages/doctor/PatientDetails'
import PatientHistory from './pages/doctor/PatientHistory'
import DoctorProfile from './pages/doctor/DoctorProfile'
import DoctorProfileSetup from './pages/doctor/DoctorProfileSetup'
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions'
import DoctorPrescriptionsList from './pages/doctor/DoctorPrescriptionsList'
import DoctorNotes from './pages/doctor/DoctorNotes'
import DoctorSettings from './pages/doctor/DoctorSettings'
import DoctorReports from './pages/doctor/DoctorReports'

// Admin pages

function App() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <LoadingSpinner size="lg" text="Loading Oxiwell..." color="white" />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Oxiwell</title>
        <meta name="description" content="Modern healthcare management system" />
      </Helmet>

      <Routes>
        {/* Public Routes - accessible to everyone */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/find-doctors" element={<FindDoctorsPage />} />
          <Route path="/newsletter/unsubscribe" element={<NewsletterUnsubscribePage />} />
        </Route>

        {/* Auth Routes - only for unauthenticated users */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
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
            <Route path="/patient/reports" element={<Reports />} />
            <Route path="/patient/reports/upload" element={<UploadReport />} />
            <Route path="/patient/profile" element={<PatientProfile />} />
            <Route path="/patient/settings" element={<PatientSettings />} />
            
            {/* Doctor Routes */}
            <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />
            <Route path="/doctor/profile-setup" element={<DoctorProfileSetup />} />
            <Route path="/doctor/dashboard" element={
              <DoctorProfileSetupGuard>
                <DoctorDashboard />
              </DoctorProfileSetupGuard>
            } />
            <Route path="/doctor/appointments" element={
              <DoctorProfileSetupGuard>
                <DoctorAppointments />
              </DoctorProfileSetupGuard>
            } />
            <Route path="/doctor/patients" element={
              <DoctorProfileSetupGuard>
                <DoctorPatients />
              </DoctorProfileSetupGuard>
            } />
            <Route path="/doctor/patients/:patientId" element={
              <DoctorProfileSetupGuard>
                <PatientDetails />
              </DoctorProfileSetupGuard>
            } />
            <Route path="/doctor/patients/:patientId/history" element={
              <DoctorProfileSetupGuard>
                <PatientHistory />
              </DoctorProfileSetupGuard>
            } />
            <Route path="/doctor/profile" element={
              <DoctorProfileSetupGuard>
                <DoctorProfile />
              </DoctorProfileSetupGuard>
            } />
            <Route path="/doctor/prescriptions" element={
              <DoctorProfileSetupGuard>
                <DoctorPrescriptionsList />
              </DoctorProfileSetupGuard>
            } />
            <Route path="/doctor/prescriptions/new" element={
              <DoctorProfileSetupGuard>
                <DoctorPrescriptions />
              </DoctorProfileSetupGuard>
            } />
            <Route path="/doctor/prescriptions/:id" element={
              <DoctorProfileSetupGuard>
                <DoctorPrescriptions />
              </DoctorProfileSetupGuard>
            } />
            <Route path="/doctor/notes" element={
              <DoctorProfileSetupGuard>
                <DoctorNotes />
              </DoctorProfileSetupGuard>
            } />
            <Route path="/doctor/settings" element={
              <DoctorProfileSetupGuard>
                <DoctorSettings />
              </DoctorProfileSetupGuard>
            } />
            <Route path="/doctor/reports" element={
              <DoctorProfileSetupGuard>
                <DoctorReports />
              </DoctorProfileSetupGuard>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/approvals" element={<AdminApprovals />} />
            <Route path="/admin/activity" element={<AdminActivity />} />
          </Route>
        </Route>

        {/* Fallback Routes */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/profile" element={<ProfileRedirect />} />
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">404</h1>
              <p className="text-gray-300 mb-4">Page not found</p>
              <a href="/" className="text-primary-400 hover:text-primary-300">
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
      // For doctors, we need to check if profile setup is completed
      // The DoctorProfileSetupGuard will handle the redirect logic
      return (
        <DoctorProfileSetupGuard>
          <Navigate to="/doctor/dashboard" replace />
        </DoctorProfileSetupGuard>
      )
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />
    default:
      return <Navigate to="/" replace />
  }
}

// Component to redirect users to their role-based profile
const ProfileRedirect = () => {
  const { user } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  switch (user.role) {
    case 'patient':
      return <Navigate to="/patient/profile" replace />
    case 'doctor':
      return <Navigate to="/doctor/profile" replace />
    case 'admin':
      return <Navigate to="/admin/profile" replace />
    default:
      return <Navigate to="/" replace />
  }
}

export default App
