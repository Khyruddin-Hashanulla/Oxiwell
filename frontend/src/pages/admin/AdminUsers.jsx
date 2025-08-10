import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI } from '../../services/api'
import { toast } from 'react-hot-toast'
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  UserCheck, 
  UserX, 
  Edit, 
  Trash2, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  Phone,
  Calendar,
  Shield,
  User,
  Activity,
  Star,
  TrendingUp,
  Award,
  Clock,
  X
} from 'lucide-react'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [actionLoading, setActionLoading] = useState({})
  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [currentPage, filterRole, filterStatus, searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        role: filterRole !== 'all' ? filterRole : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined
      }

      const response = await adminAPI.getUsers(params)
      const data = response.data.data
      
      console.log('API Response:', data) // Debug log
      
      setUsers(data.users || [])
      setTotalPages(data.pagination?.pages || 1)
      
      // Fix total users count - try multiple possible response structures
      const totalCount = data.pagination?.total || 
                        data.total || 
                        data.totalUsers || 
                        (data.users ? data.users.length : 0)
      
      console.log('Total Users Count:', totalCount) // Debug log
      setTotalUsers(totalCount)
      
      // If we're on the first page and no filters, but still getting 0 total, 
      // try to fetch total count separately
      if (totalCount === 0 && currentPage === 1 && filterRole === 'all' && filterStatus === 'all' && !searchTerm) {
        try {
          const totalResponse = await adminAPI.getUsers({ page: 1, limit: 1 })
          const actualTotal = totalResponse.data.data.pagination?.total || 0
          console.log('Fallback Total Users Count:', actualTotal)
          setTotalUsers(actualTotal)
        } catch (fallbackError) {
          console.error('Fallback total count failed:', fallbackError)
        }
      }
      
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
      
      // Set fallback values on error
      setUsers([])
      setTotalUsers(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: 'updating' }))
      
      await adminAPI.updateUserStatus(userId, newStatus)
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`)
      
      fetchUsers()
      
    } catch (error) {
      console.error('Error updating user status:', error)
      toast.error('Failed to update user status')
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: null }))
    }
  }

  const handleViewDetails = (user) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/25'
      case 'doctor': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/25'
      case 'patient': return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/25'
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-gray-500/25'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25'
      case 'pending': return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-500/25'
      case 'inactive': return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/25'
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-gray-500/25'
    }
  }

  const getStatusDotColor = (status) => {
    switch (status) {
      case 'active': return 'bg-gradient-to-r from-green-400 to-green-500'
      case 'pending': return 'bg-gradient-to-r from-amber-400 to-amber-500'
      case 'inactive': return 'bg-gradient-to-r from-red-400 to-red-500'
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500'
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4 text-white" />
      case 'doctor': return <Activity className="w-4 h-4 text-white" />
      case 'patient': return <User className="w-4 h-4 text-white" />
      default: return <User className="w-4 h-4 text-white" />
    }
  }

  const getAvatarGradient = (name) => {
    const gradients = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500', 
      'from-green-500 to-teal-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-pink-500',
      'from-indigo-500 to-purple-500'
    ]
    const index = name ? name.charCodeAt(0) % gradients.length : 0
    return gradients[index]
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              to="/admin/dashboard"
              className="group flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-200 hover:bg-primary-700/50 px-3 py-2 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-primary-800/50 backdrop-blur-sm border border-primary-600 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2 text-accent-400">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">{totalUsers} Total Users</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Title Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full mb-4 shadow-xl shadow-accent-500/25">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-gray-300 text-lg">Manage all system users and their permissions with ease</p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Users', value: totalUsers, icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
            { title: 'Active Users', value: filteredUsers.filter(u => u.status === 'active').length, icon: UserCheck, color: 'text-green-500', bgColor: 'bg-green-500/10' },
            { title: 'Pending Users', value: filteredUsers.filter(u => u.status === 'pending').length, icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
            { title: 'Doctors', value: filteredUsers.filter(u => u.role === 'doctor').length, icon: Activity, color: 'text-purple-500', bgColor: 'bg-purple-500/10' }
          ].map((stat, index) => (
            <div key={index} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-500/20 to-accent-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
              <div className="relative bg-primary-800/50 backdrop-blur-sm border border-primary-600 rounded-xl p-6 hover:border-accent-500/50 transition-all duration-300 group-hover:transform group-hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Filters and Search */}
        <div className="bg-primary-800/50 backdrop-blur-sm rounded-xl border border-primary-600 p-6 mb-8 shadow-xl">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-accent-400" />
            <h3 className="text-lg font-semibold text-white">Search & Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Enhanced Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-accent-400 transition-colors" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200"
              />
            </div>

            {/* Enhanced Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200"
            >
              <option value="all">All Roles</option>
              <option value="admin">👑 Admin</option>
              <option value="doctor">🩺 Doctor</option>
              <option value="patient">👤 Patient</option>
            </select>

            {/* Enhanced Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="active">✅ Active</option>
              <option value="pending">⏳ Pending</option>
              <option value="inactive">❌ Inactive</option>
            </select>

            {/* Enhanced Results Count */}
            <div className="flex items-center justify-end">
              <div className="bg-accent-500/10 border border-accent-500/20 rounded-lg px-4 py-3">
                <span className="text-accent-400 font-medium text-sm">
                  Showing {filteredUsers.length} of {totalUsers} users
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Users Table */}
        <div className="bg-primary-800/50 backdrop-blur-sm rounded-xl border border-primary-600 overflow-hidden shadow-xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-500/20 border-t-accent-500"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-4 border-accent-500/20"></div>
              </div>
              <p className="text-gray-300 mt-4 font-medium">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-500/10 rounded-full mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 text-xl font-semibold mb-2">No users found</p>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-700/50 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      User Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Role & Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Joined Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-600/50">
                  {filteredUsers.map((user, index) => (
                    <tr key={user._id} className="group hover:bg-primary-700/30 transition-all duration-200" style={{ animationDelay: `${index * 50}ms` }}>
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${getAvatarGradient(user.firstName)} rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/10`}>
                              <span className="text-white font-bold text-lg">
                                {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
                              </span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-primary-800 flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-lg group-hover:text-accent-300 transition-colors">
                              {user.firstName} {user.lastName}
                            </p>
                            <div className="flex flex-col space-y-1 mt-1">
                              <div className="flex items-center space-x-2 text-sm text-gray-400">
                                <Mail className="w-3 h-3 flex-shrink-0 text-accent-400" />
                                <span className="truncate">{user.email}</span>
                              </div>
                              {user.phone && (
                                <div className="flex items-center space-x-2 text-sm text-gray-400">
                                  <Phone className="w-3 h-3 flex-shrink-0 text-accent-400" />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="p-1 bg-primary-600/50 rounded-md">
                              {getRoleIcon(user.role)}
                            </div>
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full shadow-lg ${getRoleColor(user.role)}`}>
                              {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="p-1 bg-primary-600/50 rounded-md">
                              <div className={`w-3 h-3 rounded-full ${getStatusDotColor(user.status)}`}></div>
                            </div>
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full shadow-lg ${getStatusColor(user.status)} w-fit`}>
                              {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-2 text-gray-300">
                          <div className="p-1 bg-accent-500/20 rounded-md">
                            <Calendar className="w-4 h-4 text-accent-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                            <span className="text-xs text-gray-500">{new Date(user.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-3">
                          {user.status === 'active' ? (
                            <button
                              onClick={() => handleStatusUpdate(user._id, 'inactive')}
                              disabled={actionLoading[user._id]}
                              className="group relative flex items-center justify-center space-x-2 px-4 py-2 text-xs font-medium bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-red-500/25 disabled:hover:scale-100 min-w-[100px] h-8"
                            >
                              {actionLoading[user._id] ? (
                                <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                              ) : (
                                <UserX className="w-3 h-3" />
                              )}
                              <span>Deactivate</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusUpdate(user._id, 'active')}
                              disabled={actionLoading[user._id]}
                              className="group relative flex items-center justify-center space-x-2 px-4 py-2 text-xs font-medium bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-green-500/25 disabled:hover:scale-100 min-w-[100px] h-8"
                            >
                              {actionLoading[user._id] ? (
                                <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                              ) : (
                                <UserCheck className="w-3 h-3" />
                              )}
                              <span>Activate</span>
                            </button>
                          )}
                          <button 
                            onClick={() => handleViewDetails(user)}
                            className="group flex items-center justify-center p-2 text-gray-400 hover:text-white hover:bg-primary-600 rounded-lg transition-all duration-200 hover:scale-110 relative w-8 h-8 z-10"
                          >
                            <Eye className="w-4 h-4" />
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-20">
                              View Details
                            </div>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-gray-300 font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="group flex items-center space-x-2 px-4 py-2 bg-primary-700 hover:bg-primary-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-lg"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Previous</span>
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="group flex items-center space-x-2 px-4 py-2 bg-primary-700 hover:bg-primary-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-lg"
              >
                <span className="font-medium">Next</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-800 rounded-xl border border-primary-600 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary-600">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarGradient(selectedUser.firstName)} rounded-full flex items-center justify-center shadow-lg`}>
                  <span className="text-white font-bold text-lg">
                    {selectedUser.firstName?.[0]?.toUpperCase()}{selectedUser.lastName?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.role?.charAt(0).toUpperCase() + selectedUser.role?.slice(1)}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.status)}`}>
                      {selectedUser.status?.charAt(0).toUpperCase() + selectedUser.status?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-white hover:bg-primary-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="bg-primary-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-accent-400" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Email</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Mail className="w-4 h-4 text-accent-400" />
                      <span className="text-white">{selectedUser.email}</span>
                    </div>
                  </div>
                  {selectedUser.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-400">Phone</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Phone className="w-4 h-4 text-accent-400" />
                        <span className="text-white">{selectedUser.phone}</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-400">Role</label>
                    <div className="flex items-center space-x-2 mt-1">
                      {getRoleIcon(selectedUser.role)}
                      <span className="text-white capitalize">{selectedUser.role}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Status</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className={`w-3 h-3 rounded-full ${getStatusDotColor(selectedUser.status)}`}></div>
                      <span className="text-white capitalize">{selectedUser.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-primary-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-accent-400" />
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Joined Date</label>
                    <p className="text-white mt-1">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Joined Time</label>
                    <p className="text-white mt-1">{new Date(selectedUser.createdAt).toLocaleTimeString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">User ID</label>
                    <p className="text-white mt-1 font-mono text-sm">{selectedUser._id}</p>
                  </div>
                  {selectedUser.updatedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-400">Last Updated</label>
                      <p className="text-white mt-1">{new Date(selectedUser.updatedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information for Doctors */}
              {selectedUser.role === 'doctor' && (
                <div className="bg-primary-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-accent-400" />
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedUser.specialization && (
                      <div>
                        <label className="text-sm font-medium text-gray-400">Specialization</label>
                        <p className="text-white mt-1">{selectedUser.specialization}</p>
                      </div>
                    )}
                    {selectedUser.experience && (
                      <div>
                        <label className="text-sm font-medium text-gray-400">Experience</label>
                        <p className="text-white mt-1">{selectedUser.experience} years</p>
                      </div>
                    )}
                    {selectedUser.medicalRegistrationNumber && (
                      <div>
                        <label className="text-sm font-medium text-gray-400">Medical Registration</label>
                        <p className="text-white mt-1 font-mono text-sm">{selectedUser.medicalRegistrationNumber}</p>
                      </div>
                    )}
                    {selectedUser.licenseNumber && (
                      <div>
                        <label className="text-sm font-medium text-gray-400">License Number</label>
                        <p className="text-white mt-1 font-mono text-sm">{selectedUser.licenseNumber}</p>
                      </div>
                    )}
                  </div>
                  {selectedUser.professionalBio && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-400">Professional Bio</label>
                      <p className="text-white mt-1">{selectedUser.professionalBio}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-primary-600">
                <div className="flex items-center space-x-3">
                  {selectedUser.status === 'active' ? (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedUser._id, 'inactive')
                        handleCloseModal()
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200"
                    >
                      <UserX className="w-4 h-4" />
                      <span>Deactivate User</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedUser._id, 'active')
                        handleCloseModal()
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-200"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Activate User</span>
                    </button>
                  )}
                </div>
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-primary-700 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
