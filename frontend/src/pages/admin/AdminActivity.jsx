import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Activity, 
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  UserCheck,
  Settings
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI } from '../../services/api'

const AdminActivity = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [activities, setActivities] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  // Load recent activities
  useEffect(() => {
    const loadActivities = async () => {
      try {
        setIsLoading(true)
        const response = await adminAPI.getRecentActivities()
        
        if (response.data.status === 'success') {
          // Backend returns data.activities, not data.data
          setActivities(response.data.data.activities || [])
        }
      } catch (error) {
        console.error('Error loading activities:', error)
        toast.error('Failed to load recent activities')
        setActivities([]) // Set empty array to prevent crash
      } finally {
        setIsLoading(false)
      }
    }

    loadActivities()
  }, [])

  // Get activity icon based on type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registration':
        return <UserPlus className="w-4 h-4" />
      case 'doctor_approval':
        return <UserCheck className="w-4 h-4" />
      case 'appointment_created':
        return <Calendar className="w-4 h-4" />
      case 'appointment_completed':
        return <CheckCircle className="w-4 h-4" />
      case 'appointment_cancelled':
        return <XCircle className="w-4 h-4" />
      case 'system_update':
        return <Settings className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  // Get activity color based on type
  const getActivityColor = (type) => {
    switch (type) {
      case 'user_registration':
        return 'text-blue-400 bg-blue-500/20'
      case 'doctor_approval':
        return 'text-green-400 bg-green-500/20'
      case 'appointment_created':
        return 'text-purple-400 bg-purple-500/20'
      case 'appointment_completed':
        return 'text-green-400 bg-green-500/20'
      case 'appointment_cancelled':
        return 'text-red-400 bg-red-500/20'
      case 'system_update':
        return 'text-yellow-400 bg-yellow-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  // Format activity description
  const formatActivityDescription = (activity) => {
    switch (activity.type) {
      case 'user':
        return `New ${activity.data?.role || 'user'} registered: ${activity.description}`
      case 'appointment':
        return `Appointment ${activity.data?.status || 'created'}: ${activity.description}`
      case 'report':
        return `Report uploaded: ${activity.description}`
      case 'user_registration':
        return `New ${activity.userRole} registered: ${activity.userName}`
      case 'doctor_approval':
        return `Doctor approved: Dr. ${activity.doctorName}`
      case 'appointment_created':
        return `New appointment scheduled with Dr. ${activity.doctorName}`
      case 'appointment_completed':
        return `Appointment completed with Dr. ${activity.doctorName}`
      case 'appointment_cancelled':
        return `Appointment cancelled with Dr. ${activity.doctorName}`
      case 'system_update':
        return activity.description || 'System update performed'
      default:
        return activity.description || 'Activity performed'
    }
  }

  // Format timestamp safely
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) {
        return 'Unknown time'
      }
      return date.toLocaleString()
    } catch (error) {
      return 'Unknown time'
    }
  }

  // Filter activities based on search and filters
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      formatActivityDescription(activity).toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.data?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.data?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || activity.type === typeFilter
    
    let matchesDate = true
    if (dateFilter !== 'all') {
      const activityDate = new Date(activity.timestamp || activity.createdAt)
      const now = new Date()
      
      // Reset time to start of day for accurate date comparison
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const activityDay = new Date(activityDate.getFullYear(), activityDate.getMonth(), activityDate.getDate())
      
      if (!isNaN(activityDate.getTime())) {
        switch (dateFilter) {
          case 'today':
            matchesDate = activityDay.getTime() === today.getTime()
            break
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            matchesDate = activityDay >= weekAgo
            break
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            matchesDate = activityDay >= monthAgo
            break
          default:
            matchesDate = false
        }
      } else {
        matchesDate = false
      }
    }
    
    return matchesSearch && matchesType && matchesDate
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 bg-primary-700 hover:bg-primary-600 rounded-lg transition-colors self-start"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex flex-col sm:flex-row sm:items-center">
              <Activity className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mr-0 sm:mr-3 mb-2 sm:mb-0 text-accent-400" />
              <span>System Activity</span>
            </h1>
            <p className="text-gray-400 mt-1 text-sm sm:text-base">
              Monitor recent system activities and events
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="px-3 sm:px-4 py-2 bg-primary-700 hover:bg-primary-600 border border-primary-600 rounded-lg text-white transition-colors flex items-center justify-center text-sm sm:text-base"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-4 sm:p-6 border border-primary-600">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm sm:text-base"
              />
            </div>
          </div>
          
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm sm:text-base"
            >
              <option value="all">All Types</option>
              <option value="user">User Registration</option>
              <option value="appointment">Appointments</option>
              <option value="report">Medical Reports</option>
            </select>
          </div>
          
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm sm:text-base"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-8 border border-primary-600 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Activities Found</h3>
            <p className="text-gray-400">
              {searchTerm || typeFilter !== 'all' || dateFilter !== 'all' 
                ? 'No activities match your current filters.' 
                : 'No recent activities to display.'}
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl border border-primary-600 shadow-lg">
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {filteredActivities.map((activity, index) => (
                  <div key={activity._id || index} className="flex items-start space-x-4 p-4 bg-primary-700/50 rounded-lg border border-primary-600 hover:bg-primary-700/70 transition-colors">
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium">
                            {formatActivityDescription(activity)}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-1">
                            <p className="text-sm text-gray-400 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTimestamp(activity.timestamp || activity.createdAt)}
                            </p>
                            {(activity.userRole || activity.data?.role) && (
                              <p className="text-sm text-gray-400 flex items-center">
                                <User className="w-3 h-3 mr-1" />
                                {activity.userRole || activity.data?.role}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                            activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            activity.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {activity.status || 'completed'}
                          </span>
                        </div>
                      </div>
                      
                      {activity.details && (
                        <div className="mt-2 p-2 bg-primary-600/30 rounded text-sm text-gray-300">
                          {activity.details}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminActivity
