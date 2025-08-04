import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { adminAPI } from '../../services/api'
import { toast } from 'react-hot-toast'
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Settings,
  FileText,
  BarChart3,
  Shield,
  UserCheck,
  UserX,
  Clock,
  CheckCircle
} from 'lucide-react'

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
      
      // Fetch pending doctors
      const pendingResponse = await adminAPI.getPendingDoctors()
      setPendingDoctors(pendingResponse.data.data.doctors || [])
      
      // Update stats with real pending count
      setStats(prevStats => ({
        ...prevStats,
        pendingApprovals: pendingResponse.data.data.doctors?.length || 0,
        // Mock data for other stats - replace with real API calls later
        totalUsers: 1247,
        totalDoctors: 45,
        totalPatients: 1156,
        totalAppointments: 2847,
        monthlyRevenue: 125000,
        systemAlerts: 3,
        recentActivities: [
          { id: 1, type: 'user_registered', message: 'New patient registered: Sarah Wilson', time: '5 min ago' },
          { id: 2, type: 'appointment_booked', message: 'Appointment booked with Dr. Smith', time: '12 min ago' },
          { id: 3, type: 'payment_received', message: 'Payment received: $150', time: '25 min ago' },
          { id: 4, type: 'doctor_joined', message: 'New doctor joined: Dr. Emily Johnson', time: '1 hour ago' }
        ]
      }))
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
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
      title: 'Manage Users',
      description: 'Add, edit, or remove users',
      icon: Users,
      link: '/admin/users',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'System Analytics',
      description: 'View detailed reports',
      icon: BarChart3,
      link: '/admin/analytics',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Financial Reports',
      description: 'Revenue and billing',
      icon: DollarSign,
      link: '/admin/finance',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'System Settings',
      description: 'Configure system',
      icon: Settings,
      link: '/admin/settings',
      color: 'bg-orange-500 hover:bg-orange-600'
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
        <div className="bg-gradient-to-r from-red-800 to-red-700 border border-red-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="w-6 h-6 text-red-300 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                System Alerts
              </h3>
              <p className="text-red-100">
                You have {stats.systemAlerts} system alerts that require attention.
              </p>
            </div>
            <Link
              to="/admin/alerts"
              className="bg-white text-red-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
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
                <div key={doctor.id} className="flex items-center justify-between p-4 bg-primary-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {doctor.name}
                      </p>
                      <p className="text-sm text-gray-300">
                        {doctor.specialty}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      className={`bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1 rounded-lg transition-colors ${actionLoading[doctor.id] === 'approving' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleApproveDoctor(doctor.id)}
                    >
                      Approve
                    </button>
                    <button 
                      className={`bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-3 py-1 rounded-lg transition-colors ${actionLoading[doctor.id] === 'rejecting' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleRejectDoctor(doctor.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
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
    </div>
  )
}

export default AdminDashboard
