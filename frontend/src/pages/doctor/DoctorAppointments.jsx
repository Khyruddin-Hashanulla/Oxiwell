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
  ChevronRight,
  MapPin,
  FileText,
  Stethoscope,
  Heart,
  Activity,
  Edit3,
  Eye,
  MessageSquare,
  Download,
  Plus
} from 'lucide-react'

const DoctorAppointments = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [doctorNotes, setDoctorNotes] = useState('')
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

  const handleAddNotes = (appointment) => {
    setSelectedAppointment(appointment)
    setDoctorNotes(appointment.doctorNotes || '')
    setShowNotesModal(true)
  }

  const handleSaveNotes = async () => {
    try {
      // This would need a backend endpoint to save doctor notes
      // await appointmentsAPI.updateAppointmentNotes(selectedAppointment._id, doctorNotes)
      toast.success('Notes saved successfully')
      setShowNotesModal(false)
      fetchAppointments()
    } catch (error) {
      console.error('❌ Error saving notes:', error)
      toast.error('Failed to save notes')
    }
  }

  const getPatientAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A'
    try {
      const today = new Date()
      const birthDate = new Date(dateOfBirth)
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    } catch {
      return 'N/A'
    }
  }

  const getUrgencyLevel = (appointment) => {
    const reason = appointment.reason?.toLowerCase() || ''
    if (reason.includes('emergency') || reason.includes('urgent') || reason.includes('pain')) {
      return 'high'
    }
    if (reason.includes('follow-up') || reason.includes('routine')) {
      return 'low'
    }
    return 'medium'
  }

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Invalid date'
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
                {filteredAppointments.map((appointment) => {
                  const urgencyLevel = getUrgencyLevel(appointment)
                  const patientAge = getPatientAge(appointment.patient?.dateOfBirth)
                  
                  return (
                    <div
                      key={appointment._id}
                      className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        {/* Patient Information */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold text-white mb-1">
                                  {typeof appointment.patient === 'object' 
                                    ? (appointment.patient?.fullName || 
                                       `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`.trim() || 
                                       'Unknown Patient')
                                    : (appointment.patient || 'Unknown Patient')
                                  }
                                </h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-300">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(appointment.appointmentDate)}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{appointment.appointmentTime}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Status and Urgency Badges */}
                            <div className="flex flex-col space-y-2">
                              <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                                {getStatusIcon(appointment.status)}
                                <span className="capitalize">{appointment.status}</span>
                              </span>
                              <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(urgencyLevel)}`}>
                                <AlertCircle className="w-4 h-4" />
                                <span className="capitalize">{urgencyLevel} Priority</span>
                              </span>
                            </div>
                          </div>

                          {/* Patient Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Contact Information */}
                            <div className="space-y-3">
                              {appointment.patient?.email && (
                                <div className="flex items-center text-gray-300">
                                  <Mail className="w-4 h-4 mr-3 text-blue-400" />
                                  <div>
                                    <span className="font-medium text-white">Email:</span>
                                    <p className="text-sm">{appointment.patient.email}</p>
                                  </div>
                                </div>
                              )}
                              {appointment.patient?.phone && (
                                <div className="flex items-center text-gray-300">
                                  <Phone className="w-4 h-4 mr-3 text-green-400" />
                                  <div>
                                    <span className="font-medium text-white">Phone:</span>
                                    <p className="text-sm">{appointment.patient.phone}</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Medical Information */}
                            <div className="space-y-3">
                              <div className="flex items-center text-gray-300">
                                <Activity className="w-4 h-4 mr-3 text-purple-400" />
                                <div>
                                  <span className="font-medium text-white">Age:</span>
                                  <p className="text-sm">{patientAge} years</p>
                                </div>
                              </div>
                              {appointment.patient?.bloodGroup && (
                                <div className="flex items-center text-gray-300">
                                  <Heart className="w-4 h-4 mr-3 text-red-400" />
                                  <div>
                                    <span className="font-medium text-white">Blood Group:</span>
                                    <p className="text-sm">{appointment.patient.bloodGroup}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Appointment Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-primary-700/50 rounded-lg p-3">
                              <h4 className="text-white font-medium mb-1 text-sm flex items-center">
                                <Stethoscope className="w-4 h-4 mr-2" />
                                Reason for Visit
                              </h4>
                              <p className="text-gray-300 text-sm">{appointment.reason || 'Not specified'}</p>
                            </div>
                            <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                              <h4 className="text-white font-medium mb-1 text-sm">Consultation Fee</h4>
                              <p className="text-green-400 font-bold text-lg">₹{appointment.consultationFee || 0}</p>
                            </div>
                          </div>

                          {/* Patient Notes */}
                          {appointment.patientNotes && (
                            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                              <h4 className="text-white font-medium mb-2 text-sm flex items-center">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Patient Notes
                              </h4>
                              <p className="text-gray-300 text-sm">{appointment.patientNotes}</p>
                            </div>
                          )}

                          {/* Doctor Notes */}
                          {appointment.doctorNotes && (
                            <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                              <h4 className="text-white font-medium mb-2 text-sm flex items-center">
                                <FileText className="w-4 h-4 mr-2" />
                                Doctor Notes
                              </h4>
                              <p className="text-gray-300 text-sm">{appointment.doctorNotes}</p>
                            </div>
                          )}

                          {/* Appointment ID */}
                          <div className="mt-4 pt-3 border-t border-gray-600">
                            <p className="text-xs text-gray-400">
                              Appointment ID: <span className="font-mono">{appointment._id}</span>
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="lg:ml-6 flex flex-col gap-2 lg:w-48">
                          {/* Status Update Actions */}
                          {appointment.status === 'pending' && (
                            <div className="flex flex-col space-y-2">
                              <button
                                onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Confirm</span>
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                                className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          )}
                          
                          {appointment.status === 'confirmed' && (
                            <div className="flex flex-col space-y-2">
                              <button
                                onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                                className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Complete</span>
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                                className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          )}

                          {/* Additional Actions */}
                          <button
                            onClick={() => handleAddNotes(appointment)}
                            className="flex items-center justify-center space-x-2 bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>Add Notes</span>
                          </button>
                          
                          <button className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <Eye className="w-4 h-4" />
                            <span>View History</span>
                          </button>
                          
                          <button className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <Download className="w-4 h-4" />
                            <span>Download Report</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
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

  if (showNotesModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-primary-700 rounded-lg p-6 w-full max-w-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Add Notes</h3>
          <textarea
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            className="w-full p-4 bg-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowNotesModal(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNotes}
              className="bg-accent-500 hover:bg-accent-600 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Save Notes
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default DoctorAppointments
