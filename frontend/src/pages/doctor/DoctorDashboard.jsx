import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { doctorsAPI, appointmentsAPI } from '../../services/api'
import { toast } from 'react-hot-toast'
import { 
  Calendar, 
  Users, 
  Pill, 
  FileText, 
  Clock, 
  AlertCircle, 
  Plus,
  Stethoscope,
  Activity,
  TrendingUp,
  CheckCircle,
  XCircle,
  User
} from 'lucide-react'

const DoctorDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingAppointments: 0,
    completedToday: 0,
    nextAppointment: null,
    recentPatients: []
  })
  const [todayAppointments, setTodayAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAllAppointments, setShowAllAppointments] = useState(false)

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null
    
    try {
      const birthDate = new Date(dateOfBirth)
      const today = new Date()
      
      // Check if the birth date is valid
      if (isNaN(birthDate.getTime())) return null
      
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      // Adjust age if birthday hasn't occurred this year
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      return age >= 0 ? age : null
    } catch (error) {
      console.error('Error calculating age:', error)
      return null
    }
  }

  // Fetch real data from API
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching doctor dashboard data...')
      console.log('👤 Current user:', user)
      console.log('🎭 User role:', user?.role)
      console.log('🆔 User ID:', user?._id)
      console.log('📧 User email:', user?.email)
      
      // Check if user is actually a doctor
      if (user?.role !== 'doctor') {
        console.log('🚨 AUTHORIZATION ISSUE: Current user role is', user?.role, 'but doctor role is required!')
        console.log('💡 SOLUTION: Please logout and login with a doctor account to access doctor dashboard')
        toast.error(`Access denied: You're logged in as ${user?.role}. Please login as a doctor to access this dashboard.`)
      }
      
      // Initialize with safe defaults
      let doctorStats = {}
      let allAppointments = []
      let patients = []
      
      try {
        // Fetch doctor statistics
        console.log('📊 Fetching doctor stats...')
        const statsResponse = await doctorsAPI.getDoctorStats()
        console.log('🔍 RAW STATS RESPONSE:', statsResponse)
        console.log('🔍 RESPONSE DATA:', statsResponse?.data)
        console.log('🔍 RESPONSE DATA.DATA:', statsResponse?.data?.data)
        console.log('🔍 RESPONSE DATA.STATS:', statsResponse?.data?.stats)
        
        doctorStats = statsResponse?.data?.stats || {}
        console.log('✅ Doctor stats loaded:', doctorStats)
        console.log('🔍 Stats structure:', JSON.stringify(doctorStats, null, 2))
      } catch (statsError) {
        console.error('❌ Error fetching doctor stats:', statsError)
        console.error('❌ Stats error details:', statsError.response?.data)
        doctorStats = {}
      }
      
      try {
        // Fetch upcoming appointments with retry logic
        console.log('📅 Fetching doctor appointments...')
        let appointmentsResponse
        let retryCount = 0
        const maxRetries = 3
        
        while (retryCount < maxRetries) {
          try {
            appointmentsResponse = await appointmentsAPI.getDoctorAppointments(user._id, { 
              limit: 10 
            })
            break // Success, exit retry loop
          } catch (appointmentError) {
            retryCount++
            console.log(`⚠️ Appointment fetch attempt ${retryCount}/${maxRetries} failed:`, appointmentError.message)
            
            if (retryCount >= maxRetries) {
              throw appointmentError // Re-throw after max retries
            }
            
            // Wait before retrying (exponential backoff)
            const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000)
            console.log(`🔄 Retrying appointment fetch in ${delay}ms...`)
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        }
        
        console.log('🔍 RAW APPOINTMENTS RESPONSE:', appointmentsResponse)
        console.log('🔍 APPOINTMENTS DATA:', appointmentsResponse?.data)
        console.log('🔍 APPOINTMENTS DATA.DATA:', appointmentsResponse?.data?.data)
        
        allAppointments = appointmentsResponse?.data?.data?.appointments || []
        console.log('✅ Appointments loaded:', allAppointments.length)
        console.log('🔍 Sample appointment:', allAppointments[0])
        console.log('🔍 All appointments:', allAppointments)
      } catch (appointmentsError) {
        console.error('❌ Error fetching appointments after retries:', appointmentsError)
        console.error('❌ Appointments error details:', appointmentsError.response?.data)
        
        // Show more specific error message for appointments
        if (appointmentsError.code === 'NETWORK_ERROR' || appointmentsError.message?.includes('Network Error')) {
          toast.error('Unable to load appointments. Please check your connection and try refreshing.')
        } else if (appointmentsError.response?.status === 403) {
          toast.error('Access denied. Please ensure you are logged in as a doctor.')
        } else {
          toast.error('Failed to load appointments. Please try again.')
        }
        
        allAppointments = []
      }
      
      try {
        // Fetch recent patients
        console.log('👥 Fetching recent patients...')
        const patientsResponse = await doctorsAPI.getPatients({ 
          limit: 5,
          sortBy: 'lastVisit',
          order: 'desc'
        })
        patients = patientsResponse?.data?.data?.patients || []
        console.log('✅ Patients loaded:', patients.length)
      } catch (patientsError) {
        console.error('❌ Error fetching patients:', patientsError)
        patients = []
      }
      
      // Fix: Use proper date calculation that accounts for timezone
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      // Fix: Get today's date string in local timezone, not UTC
      const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      
      console.log('🔍 Current date/time:', now)
      console.log('🔍 Today date object:', today)
      console.log('🔍 Today string (YYYY-MM-DD):', todayString)
      
      const todayAppointments = allAppointments.filter(apt => {
        try {
          if (!apt.appointmentDate) {
            console.log('🔍 Appointment has no date:', apt._id)
            return false
          }
          
          // Handle different date formats
          let aptDate
          if (typeof apt.appointmentDate === 'string') {
            // If it's already a string in YYYY-MM-DD format
            if (apt.appointmentDate.includes('T')) {
              aptDate = apt.appointmentDate.split('T')[0]
            } else if (apt.appointmentDate.length === 10) {
              aptDate = apt.appointmentDate
            } else {
              aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0]
            }
          } else {
            // If it's a Date object
            aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0]
          }
          
          const isToday = aptDate === todayString
          console.log('🔍 Appointment:', apt._id, 'Raw date:', apt.appointmentDate, 'Parsed date:', aptDate, 'Is today:', isToday)
          return isToday
        } catch (dateError) {
          console.error('❌ Error parsing appointment date:', apt.appointmentDate, dateError)
          return false
        }
      })

      console.log('🔍 Today appointments found:', todayAppointments.length)
      console.log('🔍 Today appointments details:', todayAppointments.map(apt => ({
        id: apt._id,
        date: apt.appointmentDate,
        time: apt.appointmentTime,
        status: apt.status,
        patient: apt.patient?.firstName + ' ' + apt.patient?.lastName
      })))

      // Calculate completed today from appointments
      const completedToday = todayAppointments.filter(apt => {
        const isCompleted = apt.status === 'completed'
        console.log('🔍 Today appointment:', apt._id, 'Status:', apt.status, 'IsCompleted:', isCompleted)
        return isCompleted
      }).length

      console.log('🔍 DETAILED COMPLETED TODAY ANALYSIS:')
      console.log('  - Total appointments fetched:', allAppointments.length)
      console.log('  - Today appointments found:', todayAppointments.length)
      console.log('  - Today appointments statuses:', todayAppointments.map(apt => ({ id: apt._id, status: apt.status, date: apt.appointmentDate })))
      console.log('  - Completed today count:', completedToday)
      console.log('  - All appointment statuses:', allAppointments.map(apt => ({ id: apt._id, status: apt.status, date: apt.appointmentDate })))

      // Calculate pending appointments (all pending, not just today)
      const pendingCount = allAppointments.filter(apt => {
        const isPending = apt.status === 'pending'
        console.log('🔍 Appointment:', apt._id, 'Status:', apt.status, 'IsPending:', isPending)
        return isPending
      }).length

      // Calculate unique patients from appointments
      const uniquePatients = new Set(allAppointments.map(apt => apt.patient?._id || apt.patient)).size
      
      console.log('🔍 Calculated stats:')
      console.log('  - Today appointments:', todayAppointments.length)
      console.log('  - Completed today:', completedToday)
      console.log('  - Pending appointments:', pendingCount)
      console.log('  - Unique patients from appointments:', uniquePatients)
      console.log('  - Backend total patients:', doctorStats?.overall?.totalPatients)
      
      // Use calculated stats from actual appointment data (more reliable than backend calculations)
      const finalStats = {
        todayAppointments: todayAppointments.length, // Exact count of today's appointments
        totalPatients: uniquePatients, // Exact count of unique patients from appointments
        pendingAppointments: pendingCount, // Exact count of pending appointments
        completedToday: completedToday, // Exact count of today's completed appointments
        nextAppointment: doctorStats?.today?.upcoming?.[0] || null,
        recentPatients: patients.map(patient => ({
          ...patient,
          age: calculateAge(patient.dateOfBirth)
        }))
      }
      
      console.log('🔍 Final stats being set:', finalStats)
      console.log('🔍 All appointments count:', allAppointments.length)
      console.log('🔍 Today appointments count:', todayAppointments.length)
      console.log('🔍 Setting todayAppointments to:', finalStats.todayAppointments)
      
      // Update stats with correct structure access
      setStats(finalStats)
      
      // Show all upcoming appointments (this is what displays in Today's Schedule)
      setTodayAppointments(allAppointments)
      console.log('✅ Dashboard data loaded successfully')
      console.log('🔍 TodayAppointments array being set for display:', allAppointments.length, 'appointments')
      
    } catch (error) {
      console.error('❌ Critical error in fetchDashboardData:', error)
      toast.error('Failed to load dashboard data')
      
      // Fallback to safe empty state
      setStats({
        todayAppointments: 0,
        totalPatients: 0,
        pendingAppointments: 0,
        completedToday: 0,
        nextAppointment: null,
        recentPatients: []
      })
      setTodayAppointments([])
    } finally {
      setLoading(false)
      console.log('🏁 Dashboard loading complete')
    }
  }

  // Handle appointment status updates
  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      const status = action === 'approve' ? 'confirmed' : 'cancelled'
      await appointmentsAPI.updateAppointmentStatus(appointmentId, status)
      toast.success(`Appointment ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
      // Refresh dashboard data
      fetchDashboardData()
    } catch (error) {
      console.error(`Error ${action}ing appointment:`, error)
      toast.error(`Failed to ${action} appointment`)
    }
  }

  const quickActions = [
    {
      title: 'View Appointments',
      description: 'Manage today\'s schedule',
      icon: Calendar,
      link: '/doctor/appointments',
      color: 'bg-primary-500 hover:bg-primary-600'
    },
    {
      title: 'Patient Records',
      description: 'Access patient history',
      icon: Users,
      link: '/doctor/patients',
      color: 'bg-success-500 hover:bg-success-600'
    },
    {
      title: 'Write Prescription',
      description: 'View all prescriptions',
      icon: Pill,
      link: '/doctor/prescriptions',
      color: 'bg-accent-500 hover:bg-accent-600'
    },
    {
      title: 'Medical Notes',
      description: 'Add consultation notes',
      icon: FileText,
      link: '/doctor/notes',
      color: 'bg-warning-500 hover:bg-warning-600'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-700 rounded-2xl p-8 border border-primary-600 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Good morning, Dr. {user?.lastName}!
            </h1>
            <p className="text-gray-300 text-lg">
              You have {stats.todayAppointments} appointments today
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Next Appointment Alert */}
      {stats.nextAppointment && (
        <div className="bg-gradient-to-r from-blue-800 to-blue-700 border border-blue-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-start space-x-4">
            <Clock className="w-6 h-6 text-blue-300 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                Next Appointment
              </h3>
              <p className="text-blue-100 mb-1">
                <strong>{stats.nextAppointment.time || stats.nextAppointment.appointmentTime || 'Time not set'}</strong> - {
                  stats.nextAppointment.patient && typeof stats.nextAppointment.patient === 'object' 
                    ? (stats.nextAppointment.patient.fullName || 
                       `${stats.nextAppointment.patient.firstName || ''} ${stats.nextAppointment.patient.lastName || ''}`.trim() || 
                       'Unknown Patient')
                    : (stats.nextAppointment.patient || 'Unknown Patient')
                }
              </p>
              <p className="text-blue-200 text-sm">
                {stats.nextAppointment.type || stats.nextAppointment.appointmentType || 'Consultation'} ({stats.nextAppointment.duration || '30 min'})
              </p>
            </div>
            <Link
              to="/doctor/appointments"
              className="bg-white text-blue-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Today's Appointments</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.todayAppointments}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Total Patients</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalPatients}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Completed Today</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.completedToday}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.pendingAppointments}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon
            return (
              <Link
                key={index}
                to={action.link}
                className={`${action.color} rounded-xl p-6 text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 group`}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl border border-primary-600 shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Today's Schedule
              </h2>
              <Link 
                to="/doctor/appointments" 
                className="text-accent-400 hover:text-accent-300 font-medium transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {todayAppointments.length > 0 ? (
                todayAppointments.slice(0, showAllAppointments ? todayAppointments.length : 3).map((appointment) => (
                  <div key={appointment._id || appointment.id} className="bg-primary-700 bg-opacity-50 rounded-lg p-4 hover:bg-opacity-70 transition-all">
                    {/* Patient Info Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">
                            {typeof appointment.patient === 'object' 
                              ? (appointment.patient?.fullName || 
                                 `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`.trim() || 
                                 'Unknown Patient')
                              : (appointment.patient || 'Unknown Patient')
                            }
                          </h4>
                          <p className="text-sm text-gray-300">
                            {appointment.patient?.email || 'No email'} • {appointment.patient?.phone || 'No phone'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="flex items-center space-x-2">
                        {appointment.status === 'completed' && (
                          <span className="bg-success-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                            Completed
                          </span>
                        )}
                        {appointment.status === 'confirmed' && (
                          <span className="bg-primary-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                            Confirmed
                          </span>
                        )}
                        {appointment.status === 'pending' && (
                          <span className="bg-warning-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                            Pending Approval
                          </span>
                        )}
                        {appointment.status === 'cancelled' && (
                          <span className="bg-error-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                            Cancelled
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime || 'Time not set'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Clock className="w-4 h-4" />
                        <span>{appointment.appointmentType || 'General Consultation'}</span>
                      </div>
                      {appointment.patient?.bloodGroup && (
                        <div className="flex items-center space-x-2 text-gray-300">
                          <Activity className="w-4 h-4" />
                          <span>Blood Group: {appointment.patient.bloodGroup}</span>
                        </div>
                      )}
                      {appointment.patient?.dateOfBirth && (
                        <div className="flex items-center space-x-2 text-gray-300">
                          <User className="w-4 h-4" />
                          <span>Age: {calculateAge(appointment.patient.dateOfBirth) || 'N/A'}</span>
                        </div>
                      )}
                    </div>

                    {/* Appointment Reason */}
                    {appointment.reason && (
                      <div className="mb-3 p-3 bg-primary-600 bg-opacity-30 rounded-lg">
                        <div className="mb-2">
                          <span className="text-xs font-medium text-accent-400 uppercase tracking-wide">Reason:</span>
                          <p className="text-sm text-gray-200 mt-1">{appointment.reason}</p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons for Pending Appointments */}
                    {appointment.status === 'pending' && (
                      <div className="flex items-center space-x-3 pt-3 border-t border-primary-600">
                        <button
                          onClick={() => handleAppointmentAction(appointment._id || appointment.id, 'approve')}
                          className="flex items-center space-x-2 bg-success-600 hover:bg-success-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleAppointmentAction(appointment._id || appointment.id, 'reject')}
                          className="flex items-center space-x-2 bg-error-600 hover:bg-error-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    {/* View Details Link for Non-Pending Appointments */}
                    {appointment.status !== 'pending' && (
                      <div className="flex justify-end pt-3 border-t border-primary-600">
                        <Link
                          to={`/doctor/appointments/${appointment._id || appointment.id}`}
                          className="text-accent-400 hover:text-accent-300 text-sm font-medium transition-colors"
                        >
                          View Details →
                        </Link>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">No appointments scheduled for today</p>
                </div>
              )}
              {todayAppointments.length > 3 && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setShowAllAppointments(!showAllAppointments)}
                    className="text-accent-400 hover:text-accent-300 text-sm font-medium transition-colors"
                  >
                    {showAllAppointments ? 'Show Less' : `Show All ${todayAppointments.length - 3} More`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl border border-primary-600 shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Recent Patients
              </h2>
              <Link 
                to="/doctor/patients" 
                className="text-accent-400 hover:text-accent-300 font-medium transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {stats.recentPatients.length > 0 ? (
                stats.recentPatients.map((patient) => (
                  <div key={patient._id || patient.id} className="flex items-center space-x-4 p-4 bg-primary-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">
                        {patient.fullName || `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown Patient'}
                      </h4>
                      <p className="text-sm text-gray-300">
                        {patient.email || 'No email'} • Age: {patient.age !== null ? `${patient.age} years` : 'N/A'}
                      </p>
                    </div>
                    <Link
                      to={`/doctor/patients/${patient._id || patient.id}`}
                      className="text-accent-400 hover:text-accent-300 text-sm font-medium transition-colors"
                    >
                      View
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">No recent patients</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
