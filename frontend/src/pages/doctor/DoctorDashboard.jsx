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
        doctorStats = statsResponse?.data?.data || {}
        console.log('✅ Doctor stats loaded:', doctorStats)
      } catch (statsError) {
        console.error('❌ Error fetching doctor stats:', statsError)
        doctorStats = {}
      }
      
      try {
        // Fetch upcoming appointments
        console.log('📅 Fetching doctor appointments...')
        const appointmentsResponse = await appointmentsAPI.getDoctorAppointments(user._id, { 
          limit: 10 
        })
        allAppointments = appointmentsResponse?.data?.data?.appointments || []
        console.log('✅ Appointments loaded:', allAppointments.length)
      } catch (appointmentsError) {
        console.error('❌ Error fetching appointments:', appointmentsError)
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
      
      // Filter for today's appointments for the stats
      const today = new Date().toISOString().split('T')[0]
      const todayAppointments = allAppointments.filter(apt => {
        try {
          const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0]
          return aptDate === today
        } catch (dateError) {
          console.error('❌ Error parsing appointment date:', dateError)
          return false
        }
      })
      
      // Update stats with safe fallbacks
      setStats({
        todayAppointments: todayAppointments.length,
        totalPatients: doctorStats.totalPatients || 0,
        pendingAppointments: doctorStats.pendingAppointments || 0,
        completedToday: doctorStats.completedToday || 0,
        nextAppointment: doctorStats.nextAppointment || null,
        recentPatients: patients
      })
      
      // Show all upcoming appointments
      setTodayAppointments(allAppointments)
      console.log('✅ Dashboard data loaded successfully')
      
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

  const quickActions = [
    {
      title: 'View Appointments',
      description: 'Manage today\'s schedule',
      icon: Calendar,
      link: '/doctor/appointments',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Patient Records',
      description: 'Access patient history',
      icon: Users,
      link: '/doctor/patients',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Write Prescription',
      description: 'Create new prescription',
      icon: Pill,
      link: '/doctor/prescriptions/new',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Medical Notes',
      description: 'Add consultation notes',
      icon: FileText,
      link: '/doctor/notes',
      color: 'bg-orange-500 hover:bg-orange-600'
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
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-primary-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">
                        {typeof appointment.patient === 'object' 
                          ? (appointment.patient?.fullName || 
                             `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`.trim() || 
                             'Unknown Patient')
                          : (appointment.patient || 'Unknown Patient')
                        }
                      </h4>
                      <p className="text-sm text-gray-300">
                        {appointment.type || appointment.appointmentType || 'Consultation'} • {appointment.time || appointment.appointmentTime || 'Time not set'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {appointment.status === 'completed' && (
                      <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                        Completed
                      </span>
                    )}
                    {appointment.status === 'upcoming' && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        Upcoming
                      </span>
                    )}
                    {appointment.status === 'pending' && (
                      <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
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
                        {patient.email || 'No email'} • Age: {patient.age || 'N/A'}
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
