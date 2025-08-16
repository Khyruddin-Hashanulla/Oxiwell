import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, FileText, Pill, User, Clock, AlertCircle, Plus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { appointmentsAPI, patientsAPI } from '../../services/api'
import { toast } from 'react-hot-toast'
import DeveloperCredit from '../../components/common/DeveloperCredit'

const PatientDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    activePrescriptions: 0,
    recentReports: 0,
    nextAppointment: null
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Helper function to calculate time ago
  const getTimeAgo = (date) => {
    const now = new Date()
    const diffInMs = now - date
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return '1 day ago'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`
    return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`
  }

  // Fetch real patient data from API
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setIsLoading(true)
        
        if (!user?._id) {
          console.log('No user ID available')
          setIsLoading(false)
          return
        }

        // Fetch patient appointments to get stats and next appointment
        const appointmentsResponse = await appointmentsAPI.getPatientAppointments(user._id)
        
        if (appointmentsResponse.data.status === 'success') {
          const appointments = appointmentsResponse.data.data.appointments || []
          
          // Calculate stats from appointments
          const now = new Date()
          const upcomingAppointments = appointments.filter(apt => 
            new Date(apt.appointmentDate) >= now && apt.status !== 'cancelled'
          )
          
          // Find next upcoming appointment
          const nextAppointment = upcomingAppointments
            .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0]
          
          // Try to fetch patient stats if available
          let patientStats = {
            activePrescriptions: 0,
            recentReports: 0
          }
          
          try {
            const statsResponse = await patientsAPI.getPatientStats()
            if (statsResponse.data.status === 'success') {
              const data = statsResponse.data.data
              patientStats = {
                activePrescriptions: Array.isArray(data.activePrescriptions) ? data.activePrescriptions.length : (typeof data.activePrescriptions === 'number' ? data.activePrescriptions : 0),
                recentReports: Array.isArray(data.recentReports) ? data.recentReports.length : (typeof data.recentReports === 'number' ? data.recentReports : 0)
              }
            }
          } catch (statsError) {
            console.log('Patient stats not available, using defaults')
          }
          
          setStats({
            upcomingAppointments: upcomingAppointments.length,
            activePrescriptions: patientStats.activePrescriptions || 0,
            recentReports: patientStats.recentReports || 0,
            nextAppointment: nextAppointment ? {
              date: new Date(nextAppointment.appointmentDate).toISOString().split('T')[0],
              time: nextAppointment.appointmentTime || 'Not specified',
              doctor: `${nextAppointment.doctor?.firstName || 'Unknown'} ${nextAppointment.doctor?.lastName || 'Doctor'}`,
              type: nextAppointment.reason || 'General Consultation'
            } : null
          })
          
          // Generate recent activity from appointments
          const activities = []
          
          // Add recent appointments (last 5)
          const recentAppointments = appointments
            .sort((a, b) => new Date(b.createdAt || b.appointmentDate) - new Date(a.createdAt || a.appointmentDate))
            .slice(0, 3)
          
          recentAppointments.forEach(appointment => {
            const createdDate = new Date(appointment.createdAt || appointment.appointmentDate)
            const timeAgo = getTimeAgo(createdDate)
            const doctorName = `${appointment.doctor?.firstName || 'Unknown'} ${appointment.doctor?.lastName || 'Doctor'}`
            
            activities.push({
              type: 'appointment',
              title: appointment.status === 'completed' ? 'Appointment completed' : 'Appointment scheduled',
              description: `${appointment.reason || 'General consultation'} with Dr. ${doctorName}`,
              date: timeAgo,
              icon: Calendar,
              color: 'from-blue-500 to-blue-600'
            })
          })
          
          // Try to fetch prescriptions for recent activity
          try {
            const prescriptionsResponse = await appointmentsAPI.getPatientAppointments(user._id)
            // Note: This should be a separate prescriptions API call, but using appointments for now
            // You may need to add a prescriptions API endpoint
          } catch (error) {
            console.log('Could not fetch prescriptions for recent activity')
          }
          
          // Add some default activities if we don't have enough
          if (activities.length === 0) {
            activities.push({
              type: 'welcome',
              title: 'Welcome to Oxiwell',
              description: 'Your health management journey starts here',
              date: 'Today',
              icon: User,
              color: 'from-accent-500 to-accent-600'
            })
          }
          
          setRecentActivity(activities)
          
          console.log('Loaded patient dashboard data:', {
            appointments: appointments.length,
            upcoming: upcomingAppointments.length,
            nextAppointment: nextAppointment ? nextAppointment.doctor : 'None',
            recentActivities: activities.length
          })
        } else {
          console.error('Failed to fetch appointments:', appointmentsResponse.data.message)
          toast.error('Failed to load dashboard data')
        }
      } catch (error) {
        console.error('Error fetching patient data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatientData()
  }, [user?._id])

  const quickActions = [
    {
      title: 'Book Appointment',
      description: 'Schedule a new appointment',
      icon: Calendar,
      link: '/patient/appointments/book',
      color: 'bg-primary-600 hover:bg-primary-700'
    },
    {
      title: 'View Prescriptions',
      description: 'Check your medications',
      icon: Pill,
      link: '/patient/prescriptions',
      color: 'bg-success-600 hover:bg-success-700'
    },
    {
      title: 'Upload Report',
      description: 'Share medical reports',
      icon: FileText,
      link: '/patient/reports/upload',
      color: 'bg-accent-600 hover:bg-accent-700'
    },
    {
      title: 'Update Profile',
      description: 'Manage your information',
      icon: User,
      link: '/patient/profile',
      color: 'bg-warning-600 hover:bg-warning-700'
    }
  ]

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading your dashboard...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-primary-800 to-primary-700 rounded-2xl p-8 border border-primary-600 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome back, {user?.firstName || 'Patient'}!
                </h1>
                <p className="text-gray-300 text-lg">
                  Here's your health overview for today
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Next Appointment Alert */}
          {stats.nextAppointment && (
            <div className="bg-gradient-to-r from-accent-800 to-accent-700 border border-accent-600 rounded-xl p-6 shadow-lg">
              <div className="flex items-start space-x-4">
                <AlertCircle className="w-6 h-6 text-accent-300 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Upcoming Appointment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                    <div>
                      <p><strong className="text-white">Doctor:</strong> {stats.nextAppointment.doctor}</p>
                      <p><strong className="text-white">Type:</strong> {stats.nextAppointment.type}</p>
                    </div>
                    <div>
                      <p><strong className="text-white">Date:</strong> {stats.nextAppointment.date}</p>
                      <p><strong className="text-white">Time:</strong> {stats.nextAppointment.time}</p>
                    </div>
                  </div>
                </div>
                <Link
                  to="/patient/appointments"
                  className="bg-white text-accent-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-4 md:p-6 border border-primary-600 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-xs md:text-sm font-medium">Upcoming Appointments</p>
                  <p className="text-2xl md:text-3xl font-bold text-white mt-1 md:mt-2">{stats.upcomingAppointments}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-4 md:p-6 border border-primary-600 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-xs md:text-sm font-medium">Active Prescriptions</p>
                  <p className="text-2xl md:text-3xl font-bold text-white mt-1 md:mt-2">{stats.activePrescriptions}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Pill className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-4 md:p-6 border border-primary-600 shadow-lg hover:shadow-xl transition-all duration-300 sm:col-span-2 md:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-xs md:text-sm font-medium">Recent Reports</p>
                  <p className="text-2xl md:text-3xl font-bold text-white mt-1 md:mt-2">{stats.recentReports}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon
                return (
                  <Link
                    key={index}
                    to={action.link}
                    className={`${action.color} rounded-xl p-4 md:p-6 text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 group`}
                  >
                    <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                        <IconComponent className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm md:text-lg mb-1 md:mb-2">{action.title}</h3>
                        <p className="text-xs md:text-sm opacity-90">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
            <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl border border-primary-600 shadow-lg">
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-primary-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all">
                      <div className={`w-10 h-10 bg-gradient-to-br ${activity.color} rounded-full flex items-center justify-center`}>
                        <activity.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{activity.title}</h4>
                        <p className="text-sm text-gray-300">{activity.description}</p>
                      </div>
                      <span className="text-xs text-gray-400">{activity.date}</span>
                    </div>
                  ))}
                  {recentActivity.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-300 mb-2">No recent activity</p>
                      <p className="text-sm text-gray-400">Your activities will appear here as you use the system</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DeveloperCredit />
        </div>
      )}
    </>
  )
}

export default PatientDashboard
