import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Activity, 
  ArrowLeft,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI } from '../../services/api'

const AdminAnalytics = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [timeRange, setTimeRange] = useState('month') // week, month, quarter, year

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true)
        const response = await adminAPI.getDashboardStats()
        
        if (response.data.status === 'success') {
          setAnalyticsData(response.data.data)
        }
      } catch (error) {
        console.error('Error loading analytics:', error)
        toast.error('Failed to load analytics data')
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [timeRange])

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleExport = () => {
    toast.success('Analytics export feature coming soon!')
  }

  if (isLoading && !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 bg-primary-700 hover:bg-primary-600 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <BarChart3 className="w-8 h-8 mr-3 text-accent-400" />
              System Analytics
            </h1>
            <p className="text-gray-400 mt-1">
              Comprehensive system performance and usage analytics
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary-700 hover:bg-primary-600 border border-primary-600 rounded-lg text-white transition-colors flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-accent-600 hover:bg-accent-700 rounded-lg text-white transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-white mt-1">
                {analyticsData?.users?.total || 0}
              </p>
              <p className="text-green-400 text-sm mt-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{analyticsData?.users?.newThisMonth || 0} this month
              </p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Total Appointments</p>
              <p className="text-3xl font-bold text-white mt-1">
                {analyticsData?.appointments?.total || 0}
              </p>
              <p className="text-green-400 text-sm mt-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{analyticsData?.appointments?.thisMonth || 0} this month
              </p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Calendar className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Active Doctors</p>
              <p className="text-3xl font-bold text-white mt-1">
                {analyticsData?.users?.doctors || 0}
              </p>
              <p className="text-blue-400 text-sm mt-2 flex items-center">
                <Activity className="w-4 h-4 mr-1" />
                {analyticsData?.users?.active || 0} active
              </p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Activity className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">System Health</p>
              <p className="text-3xl font-bold text-green-400 mt-1">99.9%</p>
              <p className="text-gray-400 text-sm mt-2">Uptime</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Users className="w-5 h-5 mr-2 text-accent-400" />
            User Growth Trends
          </h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Chart visualization coming soon</p>
              <p className="text-sm text-gray-500 mt-2">
                Integration with Chart.js or Recharts pending
              </p>
            </div>
          </div>
        </div>

        {/* Appointment Analytics */}
        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-accent-400" />
            Appointment Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Completed</span>
              <span className="text-green-400 font-semibold">
                {analyticsData?.appointments?.completed || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Pending</span>
              <span className="text-yellow-400 font-semibold">
                {analyticsData?.appointments?.pending || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Cancelled</span>
              <span className="text-red-400 font-semibold">
                {analyticsData?.appointments?.cancelled || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Confirmed</span>
              <span className="text-blue-400 font-semibold">
                {analyticsData?.appointments?.confirmed || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System Performance */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-accent-400" />
          System Performance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {analyticsData?.reports?.total || 0}
            </div>
            <div className="text-gray-300 text-sm">Total Reports</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {analyticsData?.prescriptions?.total || 0}
            </div>
            <div className="text-gray-300 text-sm">Prescriptions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {analyticsData?.revenue?.total || 0}
            </div>
            <div className="text-gray-300 text-sm">Revenue (₹)</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-accent-400" />
          Recent System Activity
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-primary-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              <span className="text-gray-300">New user registration</span>
            </div>
            <span className="text-gray-500 text-sm">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-primary-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
              <span className="text-gray-300">Doctor profile updated</span>
            </div>
            <span className="text-gray-500 text-sm">5 minutes ago</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-primary-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
              <span className="text-gray-300">Appointment scheduled</span>
            </div>
            <span className="text-gray-500 text-sm">10 minutes ago</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAnalytics
