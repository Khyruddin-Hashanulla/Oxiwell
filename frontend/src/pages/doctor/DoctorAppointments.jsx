import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { appointmentsAPI } from '../../services/api'
import { toast } from 'react-hot-toast'
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const DoctorAppointments = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const appointmentsPerPage = 10

  useEffect(() => {
    fetchAppointments()
  }, [currentPage, filter])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching doctor appointments...')
      
      const params = {
        page: currentPage,
        limit: appointmentsPerPage,
        status: filter === 'all' ? undefined : filter
      }

      const response = await appointmentsAPI.getDoctorAppointments(user._id, params)
      const data = response?.data?.data || {}
      
      setAppointments(data.appointments || [])
      setTotalPages(Math.ceil((data.total || 0) / appointmentsPerPage))
      
      console.log('✅ Appointments loaded:', data.appointments?.length || 0)
    } catch (error) {
      console.error('❌ Error fetching appointments:', error)
      toast.error('Failed to load appointments')
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await appointmentsAPI.updateAppointmentStatus(appointmentId, newStatus)
      toast.success(`Appointment ${newStatus}`)
      fetchAppointments() // Refresh the list
    } catch (error) {
      console.error('❌ Error updating appointment:', error)
      toast.error('Failed to update appointment')
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const patientName = typeof appointment.patient === 'object' 
      ? (appointment.patient?.fullName || 
         `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`.trim())
      : (appointment.patient || '')
    
    return patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (appointment.reason || '').toLowerCase().includes(searchTerm.toLowerCase())
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'confirmed': return <Clock className="w-4 h-4" />
      case 'pending': return <AlertCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-400"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                My Appointments
              </h1>
              <p className="text-gray-300">
                Manage and track all your patient appointments
              </p>
            </div>
            <Link
              to="/doctor/dashboard"
              className="bg-primary-700 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl border border-primary-600 shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by patient name or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-primary-700 border border-primary-600 rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl border border-primary-600 shadow-lg">
          <div className="p-6">
            {filteredAppointments.length > 0 ? (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="bg-primary-700 bg-opacity-50 rounded-lg p-6 hover:bg-opacity-70 transition-all border border-primary-600"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Patient Info */}
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {typeof appointment.patient === 'object' 
                              ? (appointment.patient?.fullName || 
                                 `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`.trim() || 
                                 'Unknown Patient')
                              : (appointment.patient || 'Unknown Patient')
                            }
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(appointment.appointmentDate)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{appointment.appointmentTime || 'Time not set'}</span>
                            </div>
                            {appointment.patient?.email && (
                              <div className="flex items-center space-x-1">
                                <Mail className="w-4 h-4" />
                                <span>{appointment.patient.email}</span>
                              </div>
                            )}
                            {appointment.patient?.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-4 h-4" />
                                <span>{appointment.patient.phone}</span>
                              </div>
                            )}
                          </div>
                          {appointment.reason && (
                            <p className="text-gray-300 mt-2">
                              <strong>Reason:</strong> {appointment.reason}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="capitalize">{appointment.status}</span>
                        </span>

                        {/* Action Buttons */}
                        {appointment.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {appointment.status === 'confirmed' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No appointments found</h3>
                <p className="text-gray-300">
                  {searchTerm ? 'Try adjusting your search terms' : 'No appointments match the selected filter'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-primary-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-300">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="bg-primary-700 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="bg-primary-700 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorAppointments
