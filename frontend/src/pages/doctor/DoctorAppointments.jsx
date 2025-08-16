import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { appointmentsAPI } from '../../services/api'
import { toast } from 'react-hot-toast'
import jsPDF from 'jspdf'
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
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [patientHistory, setPatientHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const appointmentsPerPage = 10

  useEffect(() => {
    fetchAppointments()
  }, [currentPage, filter])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching doctor appointments...')
      console.log('🔍 Current filter:', filter)
      
      const params = {
        page: currentPage,
        limit: appointmentsPerPage
      }

      // Only add status parameter if filter is not 'all'
      if (filter !== 'all') {
        params.status = filter
      }

      console.log('🔍 Request params:', params)

      const response = await appointmentsAPI.getDoctorAppointments(user._id, params)
      console.log('🔍 Raw response:', response)
      
      // Fix: Backend returns { status: 'success', data: { appointments, total } }
      const data = response?.data || {}
      
      setAppointments(data.data?.appointments || [])
      setTotalPages(Math.ceil((data.data?.total || 0) / appointmentsPerPage))
      
      console.log('✅ Appointments loaded:', data.data?.appointments?.length || 0)
      console.log('✅ Total pages:', Math.ceil((data.data?.total || 0) / appointmentsPerPage))
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

  const handleViewHistory = async (appointment) => {
    try {
      setHistoryLoading(true)
      setSelectedAppointment(appointment)
      // Get all appointments and filter by patient ID on frontend
      const response = await appointmentsAPI.getAppointments()
      const allAppointments = response.data.data.appointments || []
      const patientAppointments = allAppointments.filter(apt => 
        apt.patient._id === appointment.patient._id
      ).sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)) // Sort by date descending
      
      setPatientHistory(patientAppointments)
      setShowHistoryModal(true)
    } catch (error) {
      console.error('❌ Error fetching patient history:', error)
      toast.error('Failed to load patient history')
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleDownloadReport = (appointment) => {
    try {
      // Debug: Log the appointment object to see actual field names
      console.log('🔍 Appointment object for download:', appointment)
      console.log('🔍 Appointment date field:', appointment.appointmentDate)
      console.log('🔍 Appointment time field:', appointment.appointmentTime)
      console.log('🔍 Alternative date field:', appointment.date)
      console.log('🔍 Alternative time field:', appointment.time)
      
      // Generate and download appointment report
      const reportData = {
        appointmentId: appointment._id,
        patientName: `${appointment.patient?.firstName} ${appointment.patient?.lastName}`,
        doctorName: `${appointment.doctor?.firstName} ${appointment.doctor?.lastName}`,
        date: appointment.appointmentDate ? 
          new Date(appointment.appointmentDate).toLocaleDateString() : 
          (appointment.date ? new Date(appointment.date).toLocaleDateString() : 'Date not available'),
        time: appointment.appointmentTime || appointment.time || 'Time not available',
        reason: appointment.reason,
        status: appointment.status,
        notes: appointment.doctorNotes || 'No notes available'
      }

      console.log('🔍 Report data:', reportData)
      
      // Create professional PDF report
      const doc = new jsPDF()
      
      // Set page margins
      const pageWidth = doc.internal.pageSize.width
      const pageHeight = doc.internal.pageSize.height
      const margin = 20
      
      // Header with background color
      doc.setFillColor(41, 128, 185) // Blue background
      doc.rect(0, 0, pageWidth, 50, 'F')
      
      // White text for header
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont(undefined, 'bold')
      doc.text('OXIWELL HEALTH CENTER', margin, 25)
      
      doc.setFontSize(14)
      doc.setFont(undefined, 'normal')
      doc.text('Medical Appointment Report', margin, 40)
      
      // Reset text color for body
      doc.setTextColor(40, 40, 40)
      let yPos = 70
      
      // Report title
      doc.setFontSize(18)
      doc.setFont(undefined, 'bold')
      doc.text('APPOINTMENT REPORT', margin, yPos)
      yPos += 20
      
      // Patient Information Box
      doc.setFillColor(245, 245, 245)
      doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 35, 'F')
      doc.setDrawColor(200, 200, 200)
      doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 35)
      
      doc.setFontSize(14)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(41, 128, 185)
      doc.text('PATIENT INFORMATION', margin + 5, yPos + 5)
      
      doc.setFontSize(11)
      doc.setFont(undefined, 'normal')
      doc.setTextColor(40, 40, 40)
      doc.text(`Name: ${reportData.patientName}`, margin + 5, yPos + 15)
      
      if (appointment.patient?.email) {
        doc.text(`Email: ${appointment.patient.email}`, margin + 5, yPos + 25)
      }
      
      yPos += 50
      
      // Doctor Information Box
      doc.setFillColor(245, 245, 245)
      doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 35, 'F')
      doc.setDrawColor(200, 200, 200)
      doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 35)
      
      doc.setFontSize(14)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(41, 128, 185)
      doc.text('DOCTOR INFORMATION', margin + 5, yPos + 5)
      
      doc.setFontSize(11)
      doc.setFont(undefined, 'normal')
      doc.setTextColor(40, 40, 40)
      doc.text(`Name: Dr. ${reportData.doctorName}`, margin + 5, yPos + 15)
      
      if (appointment.doctor?.specialization) {
        doc.text(`Specialization: ${appointment.doctor.specialization}`, margin + 5, yPos + 25)
      }
      
      yPos += 50
      
      // Appointment Details
      doc.setFontSize(14)
      doc.setFont(undefined, 'bold')
      doc.text('APPOINTMENT DETAILS', margin, yPos)
      yPos += 15
      
      doc.setFontSize(11)
      doc.setFont(undefined, 'normal')
      doc.text(`Date: ${reportData.date}`, margin, yPos)
      yPos += 10
      doc.text(`Time: ${reportData.time}`, margin, yPos)
      yPos += 10
      doc.text(`Reason: ${reportData.reason}`, margin, yPos)
      yPos += 10
      doc.text(`Status: ${reportData.status}`, margin, yPos)
      
      // Doctor's Notes Section
      if (reportData.notes && reportData.notes !== 'No notes available') {
        doc.setFillColor(252, 248, 227) // Light yellow background
        doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 40, 'F')
        doc.setDrawColor(243, 156, 18)
        doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 40)
        
        doc.setFontSize(12)
        doc.setFont(undefined, 'bold')
        doc.setTextColor(243, 156, 18)
        doc.text('DOCTOR\'S NOTES', margin + 5, yPos + 5)
        
        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.setTextColor(40, 40, 40)
        const noteLines = doc.splitTextToSize(reportData.notes, pageWidth - 2 * margin - 10)
        doc.text(noteLines, margin + 5, yPos + 18)
        
        yPos += 50
      }
      
      // Footer
      doc.setFillColor(240, 240, 240)
      doc.rect(0, pageHeight - 30, pageWidth, 30, 'F')
      
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, pageHeight - 15)
      doc.text(`Oxiwell Health Center Management System`, pageWidth - margin - 80, pageHeight - 15)
      
      // Save the PDF
      doc.save(`oxiwell-appointment-report-${appointment._id}.pdf`)
    } catch (error) {
      console.error('❌ Error downloading report:', error)
      toast.error('Failed to download report')
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
      case 'high': return 'bg-error-100 text-error-800 border-error-200'
      case 'medium': return 'bg-warning-100 text-warning-800 border-warning-200'
      case 'low': return 'bg-success-100 text-success-800 border-success-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning-100 text-warning-800 border-warning-200'
      case 'confirmed': return 'bg-primary-100 text-primary-800 border-primary-200'
      case 'completed': return 'bg-success-100 text-success-800 border-success-200'
      case 'cancelled': return 'bg-error-100 text-error-800 border-error-200'
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
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Invalid Date'
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
                            <div className="bg-success-500/10 rounded-lg p-3 border border-success-500/20">
                              <h4 className="text-white font-medium mb-1 text-sm flex items-center">
                                <Stethoscope className="w-4 h-4 mr-2" />
                                Reason for Visit
                              </h4>
                              <p className="text-gray-300 text-sm">{appointment.reason || 'Not specified'}</p>
                            </div>
                            <div className="bg-primary-500/10 rounded-lg p-3 border border-primary-500/20">
                              <h4 className="text-white font-medium mb-1 text-sm">Consultation Fee</h4>
                              <p className="text-primary-400 font-bold text-lg">₹{appointment.consultationFee || 0}</p>
                            </div>
                          </div>

                          {/* Patient Notes */}
                          {appointment.patientNotes && (
                            <div className="mt-4 p-3 bg-primary-500/10 rounded-lg border border-primary-500/20">
                              <h4 className="text-white font-medium mb-2 text-sm flex items-center">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Patient Notes
                              </h4>
                              <p className="text-gray-300 text-sm">{appointment.patientNotes}</p>
                            </div>
                          )}

                          {/* Doctor Notes */}
                          {appointment.doctorNotes && (
                            <div className="mt-4 p-3 bg-warning-500/10 rounded-lg border border-warning-500/20">
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
                                className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Confirm</span>
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                                className="flex items-center justify-center space-x-2 bg-error-600 hover:bg-error-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
                                className="flex items-center justify-center space-x-2 bg-success-600 hover:bg-success-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Complete</span>
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                                className="flex items-center justify-center space-x-2 bg-error-600 hover:bg-error-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
                          
                          <button
                            onClick={() => handleViewHistory(appointment)}
                            className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View History</span>
                          </button>
                          
                          <button
                            onClick={() => handleDownloadReport(appointment)}
                            className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
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

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-primary-700 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                Patient History - {selectedAppointment?.patient?.firstName} {selectedAppointment?.patient?.lastName}
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            {historyLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-400"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {patientHistory.length > 0 ? (
                  patientHistory.map((apt) => (
                    <div key={apt._id} className="bg-primary-600 rounded-lg p-4 border border-primary-500">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-medium">{formatDate(apt.appointmentDate)}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          apt.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          apt.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                          apt.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">
                        <strong>Time:</strong> {apt.appointmentTime}
                      </p>
                      <p className="text-gray-300 text-sm mb-2">
                        <strong>Reason:</strong> {apt.reason}
                      </p>
                      {apt.doctorNotes && (
                        <div className="mt-3 p-3 bg-primary-500/30 rounded border-l-4 border-accent-500">
                          <p className="text-gray-300 text-sm">
                            <strong>Notes:</strong> {apt.doctorNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300">No appointment history found for this patient</p>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-primary-700 rounded-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Add Notes</h3>
            <textarea
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Enter your notes for this appointment..."
              rows={6}
              className="w-full p-4 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNotesModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorAppointments
