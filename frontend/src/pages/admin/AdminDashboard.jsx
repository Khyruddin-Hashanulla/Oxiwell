import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  UserCheck, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { adminAPI } from '../../services/api'
import { toast } from 'react-hot-toast'
import { 
  DollarSign, 
  Shield,
  Settings,
  BarChart3,
  AlertTriangle,
  UserX
} from 'lucide-react'
import DeveloperCredit from '../../components/common/DeveloperCredit'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    monthlyRevenue: 0,
    pendingApprovals: 0,
    systemAlerts: 0,
    recentActivities: []
  })
  const [pendingDoctors, setPendingDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch real dashboard statistics from backend
      const [statsResponse, pendingResponse] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getPendingDoctors()
      ])
      
      const statsData = statsResponse.data.data
      const pendingDoctors = pendingResponse.data.data.doctors || []
      
      setPendingDoctors(pendingDoctors)
      
      // Set real statistics from backend
      setStats({
        totalUsers: statsData.users.total || 0,
        totalDoctors: statsData.users.totalDoctors || 0,
        totalPatients: statsData.users.totalPatients || 0,
        totalAppointments: statsData.appointments.total || 0,
        monthlyRevenue: statsData.revenue.monthly || 0,
        pendingApprovals: pendingDoctors.length,
        systemAlerts: statsData.reports.critical || 0,
        recentActivities: [
          { id: 1, type: 'user_registered', message: `New users this month: ${statsData.users.newThisMonth || 0}`, time: 'This month' },
          { id: 2, type: 'appointment_booked', message: `Appointments this month: ${statsData.appointments.thisMonth || 0}`, time: 'This month' },
          { id: 3, type: 'payment_received', message: `Monthly revenue: ₹${(statsData.revenue.monthly || 0).toLocaleString()}`, time: 'This month' },
          { id: 4, type: 'doctor_joined', message: `Pending approvals: ${pendingDoctors.length}`, time: 'Current' }
        ]
      })
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
      
      // Fallback to empty stats on error
      setStats({
        totalUsers: 0,
        totalDoctors: 0,
        totalPatients: 0,
        totalAppointments: 0,
        monthlyRevenue: 0,
        pendingApprovals: 0,
        systemAlerts: 0,
        recentActivities: []
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveDoctor = async (doctorId) => {
    try {
      setActionLoading(prev => ({ ...prev, [doctorId]: 'approving' }))
      
      await adminAPI.approveDoctor(doctorId)
      toast.success('Doctor approved successfully!')
      
      // Refresh pending doctors list
      fetchDashboardData()
      
    } catch (error) {
      console.error('Error approving doctor:', error)
      toast.error('Failed to approve doctor')
    } finally {
      setActionLoading(prev => ({ ...prev, [doctorId]: null }))
    }
  }

  const handleRejectDoctor = async (doctorId) => {
    try {
      const reason = prompt('Please provide a reason for rejection:')
      if (!reason || reason.trim().length < 10) {
        toast.error('Rejection reason must be at least 10 characters long')
        return
      }

      setActionLoading(prev => ({ ...prev, [doctorId]: 'rejecting' }))
      
      await adminAPI.rejectDoctor(doctorId, { rejectionReason: reason.trim() })
      toast.success('Doctor application rejected')
      
      // Refresh pending doctors list
      fetchDashboardData()
      
    } catch (error) {
      console.error('Error rejecting doctor:', error)
      toast.error('Failed to reject doctor')
    } finally {
      setActionLoading(prev => ({ ...prev, [doctorId]: null }))
    }
  }

  const quickActions = [
    {
      title: 'Manage Doctors',
      description: 'View and approve doctors',
      icon: Users,
      link: '/admin/users',
      color: 'bg-primary-600 hover:bg-primary-700'
    },
    {
      title: 'System Reports',
      description: 'View analytics and reports',
      icon: BarChart3,
      link: '/admin/analytics',
      color: 'bg-success-600 hover:bg-success-700'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts',
      icon: Shield,
      link: '/admin/users',
      color: 'bg-accent-600 hover:bg-accent-700'
    },
    {
      title: 'Settings',
      description: 'Configure system settings',
      icon: Settings,
      link: '/admin/settings',
      color: 'bg-warning-600 hover:bg-warning-700'
    }
  ]

  const systemAlerts = [
    { id: 1, type: 'warning', message: 'Server storage at 85% capacity', priority: 'high' },
    { id: 2, type: 'info', message: 'Scheduled maintenance tonight at 2 AM', priority: 'medium' },
    { id: 3, type: 'error', message: 'Failed backup detected', priority: 'high' }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-700 rounded-2xl p-8 border border-primary-600 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.firstName || 'Admin'}!
            </h1>
            <p className="text-gray-300 text-lg">
              System overview and management dashboard
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* System Alerts */}
      {stats.systemAlerts > 0 && (
        <div className="bg-gradient-to-br from-error-700 to-error-800 rounded-xl border border-error-600 shadow-lg">
          <div className="p-6 flex items-start space-x-4">
            <AlertTriangle className="w-6 h-6 text-error-300 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                System Alerts
              </h3>
              <p className="text-error-100">
                You have {stats.systemAlerts} system alerts that require attention.
              </p>
            </div>
            <Link
              to="/admin/alerts"
              className="bg-white text-error-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              View Alerts
            </Link>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Total Appointments</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalAppointments.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Monthly Revenue</p>
              <p className="text-3xl font-bold text-white mt-2">${(stats.monthlyRevenue / 1000).toFixed(0)}K</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Pending Approvals</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.pendingApprovals}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl border border-primary-600 shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Pending Approvals
              </h2>
              <Link 
                to="/admin/approvals" 
                className="text-accent-400 hover:text-accent-300 font-medium transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {pendingDoctors.map((doctor) => (
                <div key={doctor._id} className="bg-primary-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all border border-primary-600">
                  {/* Doctor Header */}
                  <div className="p-4 border-b border-primary-600">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-lg">
                            Dr. {doctor.firstName} {doctor.lastName}
                          </h3>
                          <p className="text-accent-400 font-medium">
                            {doctor.specialization || 'Specialization not specified'}
                          </p>
                          <p className="text-sm text-gray-300">
                            Registered: {new Date(doctor.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          className={`bg-success-600 hover:bg-success-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors ${actionLoading[doctor._id] === 'approving' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => handleApproveDoctor(doctor._id)}
                          disabled={actionLoading[doctor._id]}
                        >
                          {actionLoading[doctor._id] === 'approving' ? 'Approving...' : 'Approve'}
                        </button>
                        <button 
                          className={`bg-error-600 hover:bg-error-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors ${actionLoading[doctor._id] === 'rejecting' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => handleRejectDoctor(doctor._id)}
                          disabled={actionLoading[doctor._id]}
                        >
                          {actionLoading[doctor._id] === 'rejecting' ? 'Rejecting...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Details */}
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Professional Information */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-accent-400 uppercase tracking-wide">Professional Info</h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-gray-400 block">License Number</span>
                            <span className="text-white font-medium">
                              {doctor.licenseNumber || 'Not provided'}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400 block">Experience</span>
                            <span className="text-white font-medium">
                              {doctor.experience ? `${doctor.experience} years` : 'Not specified'}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400 block">Qualification</span>
                            <span className="text-white font-medium">
                              {doctor.qualifications && doctor.qualifications.length > 0 
                                ? doctor.qualifications.map(q => q.degree).join(', ')
                                : 'Not provided'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-accent-400 uppercase tracking-wide">Contact Info</h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-gray-400 block">Email</span>
                            <span className="text-white font-medium break-all">
                              {doctor.email}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400 block">Phone</span>
                            <span className="text-white font-medium">
                              {doctor.phone}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400 block">Status</span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                              Pending Approval
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Additional Details */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-accent-400 uppercase tracking-wide">Additional Info</h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-gray-400 block">Gender</span>
                            <span className="text-white font-medium capitalize">
                              {doctor.gender || 'Not specified'}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400 block">Date of Birth</span>
                            <span className="text-white font-medium">
                              {doctor.dateOfBirth ? new Date(doctor.dateOfBirth).toLocaleDateString() : 'Not provided'}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400 block">Verification</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${doctor.isVerified ? 'bg-success-100 text-success-800' : 'bg-error-100 text-error-800'}`}>
                              {doctor.isVerified ? 'Verified' : 'Not Verified'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Professional Bio (if available) */}
                    {doctor.professionalBio && (
                      <div className="mt-4 pt-4 border-t border-primary-600">
                        <h4 className="text-sm font-semibold text-accent-400 uppercase tracking-wide mb-2">Professional Bio</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {doctor.professionalBio}
                        </p>
                      </div>
                    )}

                    {/* Qualifications (if available) */}
                    {doctor.qualifications && doctor.qualifications.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-primary-600">
                        <h4 className="text-sm font-semibold text-accent-400 uppercase tracking-wide mb-2">Qualifications</h4>
                        <div className="space-y-2">
                          {doctor.qualifications.map((qual, index) => (
                            <div key={index} className="bg-primary-600 bg-opacity-30 rounded-lg p-3">
                              <div className="flex flex-col">
                                <span className="text-white font-medium">{qual.degree}</span>
                                {qual.institution && qual.institution !== 'Not specified' && (
                                  <span className="text-gray-300 text-sm">{qual.institution}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Empty State */}
              {pendingDoctors.length === 0 && !loading && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-primary-600 bg-opacity-30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserCheck className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400 text-lg font-medium">No pending doctor approvals</p>
                  <p className="text-gray-500 text-sm">All doctor applications have been processed</p>
                </div>
              )}
              
              {/* Loading State */}
              {loading && (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading pending approvals...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl border border-primary-600 shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Recent Activity
              </h2>
              <Link 
                to="/admin/activity" 
                className="text-accent-400 hover:text-accent-300 font-medium transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {stats.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-primary-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center">
                    {activity.type === 'user_registered' && <UserCheck className="w-5 h-5 text-white" />}
                    {activity.type === 'appointment_booked' && <Calendar className="w-5 h-5 text-white" />}
                    {activity.type === 'payment_received' && <DollarSign className="w-5 h-5 text-white" />}
                    {activity.type === 'doctor_joined' && <Users className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">
                      {activity.message}
                    </p>
                    <p className="text-sm text-gray-300">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl border border-primary-600 shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            System Analytics Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl border border-blue-500 shadow-lg">
              <TrendingUp className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">User Growth</h3>
              <p className="text-3xl font-bold text-white">+12%</p>
              <p className="text-sm text-blue-100 mt-1">This month</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-600 to-green-700 rounded-xl border border-green-500 shadow-lg">
              <Activity className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">System Health</h3>
              <p className="text-3xl font-bold text-white">98.5%</p>
              <p className="text-sm text-green-100 mt-1">Uptime</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl border border-purple-500 shadow-lg">
              <CheckCircle className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Satisfaction</h3>
              <p className="text-3xl font-bold text-white">4.8/5</p>
              <p className="text-sm text-purple-100 mt-1">Average rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl border border-primary-600 shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Quick Actions
          </h2>
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
      </div>
      <DeveloperCredit />
    </div>
  )
}

export default AdminDashboard
