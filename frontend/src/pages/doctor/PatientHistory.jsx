import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Heart, 
  FileText, 
  Download, 
  Search,
  Filter,
  Pill,
  Clock,
  X
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { doctorsAPI } from '../../services/api'

const PrescriptionModal = ({ selectedPrescription, setShowPrescriptionModal, onDownload }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-primary-800 rounded-lg shadow-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Prescription Details</h2>
        <button 
          onClick={() => setShowPrescriptionModal(false)}
          className="text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {selectedPrescription && (
        <div className="space-y-4">
          <div className="bg-primary-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-300">Date:</span>
                <p className="text-white">{new Date(selectedPrescription.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-300">Status:</span>
                <p className="text-white capitalize">{selectedPrescription.status || 'Active'}</p>
              </div>
            </div>
          </div>

          {selectedPrescription.diagnosis && (
            <div className="bg-primary-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Diagnosis</h3>
              <p className="text-gray-300">{selectedPrescription.diagnosis}</p>
            </div>
          )}

          {selectedPrescription.medications && selectedPrescription.medications.length > 0 && (
            <div className="bg-primary-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Medications ({selectedPrescription.medications.length})</h3>
              <div className="space-y-3">
                {selectedPrescription.medications.map((med, index) => (
                  <div key={index} className="border-l-2 border-accent-500 pl-3">
                    <p className="text-white font-medium">{med.name}</p>
                    <p className="text-gray-300 text-sm">Dosage: {med.dosage}</p>
                    <p className="text-gray-300 text-sm">Frequency: {med.frequency}</p>
                    {med.duration && <p className="text-gray-300 text-sm">Duration: {med.duration}</p>}
                    {med.instructions && <p className="text-gray-300 text-sm">Instructions: {med.instructions}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedPrescription.generalInstructions && (
            <div className="bg-primary-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">General Instructions</h3>
              <p className="text-gray-300">{selectedPrescription.generalInstructions}</p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button 
              onClick={() => onDownload(selectedPrescription)}
              className="bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button 
              onClick={() => setShowPrescriptionModal(false)}
              className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
)

const PatientHistory = () => {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)

  useEffect(() => {
    fetchPatientHistory()
  }, [patientId])

  const fetchPatientHistory = async () => {
    try {
      setLoading(true)
      
      // Fetch patient history (includes patient details, appointments, and prescriptions)
      const historyResponse = await doctorsAPI.getPatientHistory(patientId)
      const historyData = historyResponse?.data?.data
      
      if (!historyData || !historyData.patient) {
        toast.error('Patient not found')
        navigate('/doctor/patients')
        return
      }
      
      setPatient(historyData.patient)
      setAppointments(historyData.appointments || [])
      setPrescriptions(historyData.prescriptions || [])
      
    } catch (error) {
      toast.error('Failed to load patient history')
      navigate('/doctor/patients')
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (dateOfBirth) => {
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  const formatAppointmentDateTime = (appointmentDate, appointmentTime) => {
    if (!appointmentDate) return 'N/A'
    
    try {
      const date = new Date(appointmentDate)
      let timeString = ''
      
      if (appointmentTime) {
        // appointmentTime is in format "HH:MM" (24-hour)
        const [hours, minutes] = appointmentTime.split(':')
        date.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        timeString = ` at ${appointmentTime}`
      }
      
      const dateString = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
      
      return `${dateString}${timeString}`
    } catch {
      return 'Invalid Date'
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-warning-100 text-warning-800',
      'confirmed': 'bg-primary-100 text-primary-800',
      'completed': 'bg-success-100 text-success-800',
      'cancelled': 'bg-error-100 text-error-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getBloodGroupColor = (bloodGroup) => {
    const colors = {
      'A+': 'bg-error-100 text-error-800',
      'A-': 'bg-error-200 text-error-900',
      'B+': 'bg-primary-100 text-primary-800',
      'B-': 'bg-primary-200 text-primary-900',
      'AB+': 'bg-accent-100 text-accent-800',
      'AB-': 'bg-accent-200 text-accent-900',
      'O+': 'bg-success-100 text-success-800',
      'O-': 'bg-success-200 text-success-900'
    }
    return colors[bloodGroup] || 'bg-gray-100 text-gray-800'
  }

  const handleViewPrescriptionDetails = (prescription) => {
    setSelectedPrescription(prescription)
    setShowPrescriptionModal(true)
  }

  const handleDownloadPrescription = async (prescription) => {
    try {
      // For now, create a simple text file download since PDF generation isn't implemented
      const prescriptionData = `
PRESCRIPTION DETAILS
===================
Patient: ${patient.firstName} ${patient.lastName}
Date: ${new Date(prescription.createdAt).toLocaleDateString()}
Diagnosis: ${prescription.diagnosis || 'N/A'}
Medications: ${prescription.medications?.length || 0} prescribed
Instructions: ${prescription.generalInstructions || 'N/A'}
      `.trim()
      
      const blob = new Blob([prescriptionData], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `prescription-${prescription._id || 'unknown'}.txt`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Prescription downloaded successfully!')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download prescription')
    }
  }

  // Combine and sort all history items by date
  const getAllHistoryItems = () => {
    const items = []
    
    // Add appointments
    appointments.forEach(appointment => {
      items.push({
        id: appointment._id,
        type: 'appointment',
        date: appointment.appointmentDate,
        title: `Appointment - ${appointment.reason || 'General consultation'}`,
        status: appointment.status,
        data: appointment
      })
    })
    
    // Add prescriptions
    prescriptions.forEach(prescription => {
      items.push({
        id: prescription._id,
        type: 'prescription',
        date: prescription.createdAt,
        title: `Prescription - ${prescription.diagnosis || 'General treatment'}`,
        status: 'completed',
        data: prescription
      })
    })
    
    // Sort by date (newest first)
    return items.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  const filteredHistory = getAllHistoryItems().filter(item => {
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter
    const matchesSearch = !searchTerm || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.data.diagnosis && item.data.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.data.reason && item.data.reason.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading patient history...</div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-error-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Patient Not Found</h3>
            <p className="text-gray-300 mb-4">The requested patient could not be found.</p>
            <Link
              to="/doctor/patients"
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Patients
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Link
                to={`/doctor/patients/${patientId}`}
                className="bg-primary-700 hover:bg-primary-600 text-white p-2 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Patient History
                </h1>
                <p className="text-gray-300 text-sm sm:text-base">Complete medical history and timeline</p>
              </div>
            </div>
            <Link
              to={`/doctor/patients/${patientId}`}
              className="bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm sm:text-base flex-shrink-0"
            >
              <User className="w-4 h-4" />
              <span>Patient Details</span>
            </Link>
          </div>
        </div>

        {/* Patient Info Card */}
        <div className="bg-primary-700 bg-opacity-50 rounded-lg p-4 sm:p-6 mb-8 border border-primary-600">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                  {patient.firstName} {patient.lastName}
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 mt-2 text-gray-300 text-sm sm:text-base">
                  <span>Age: {calculateAge(patient.dateOfBirth)}</span>
                  {patient.bloodGroup && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getBloodGroupColor(patient.bloodGroup)} flex-shrink-0`}>
                      {patient.bloodGroup}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:flex-shrink-0">
              <div className="bg-primary-600 bg-opacity-50 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-base sm:text-lg font-semibold text-white">1</div>
                <div className="text-xs text-gray-300">Appointments</div>
              </div>
              <div className="bg-primary-600 bg-opacity-50 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-base sm:text-lg font-semibold text-white">1</div>
                <div className="text-xs text-gray-300">Prescriptions</div>
              </div>
              <div className="bg-primary-600 bg-opacity-50 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-base sm:text-lg font-semibold text-white">0</div>
                <div className="text-xs text-gray-300">Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-primary-700 bg-opacity-50 rounded-lg p-4 sm:p-6 mb-8 border border-primary-600">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-primary-800 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm sm:text-base"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All', icon: Filter },
                { id: 'appointment', label: 'Appointments', icon: Calendar },
                { id: 'prescription', label: 'Prescriptions', icon: Pill }
              ].map((filter) => {
                const Icon = filter.icon
                return (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 flex-shrink-0 ${
                      activeFilter === filter.id
                        ? 'bg-accent-600 text-white'
                        : 'bg-primary-600 text-gray-300 hover:bg-primary-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="truncate">{filter.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Medical History Timeline */}
        <div className="bg-primary-700 bg-opacity-50 rounded-lg border border-primary-600">
          <div className="p-4 sm:p-6 border-b border-primary-600">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-accent-400" />
              <h3 className="text-lg sm:text-xl font-semibold text-white">Medical History Timeline</h3>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {filteredHistory.length > 0 ? (
              <div className="space-y-6">
                {filteredHistory.map((item, index) => (
                  <div key={index} className="flex space-x-4">
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center ${
                        item.type === 'appointment' 
                          ? 'bg-blue-600' 
                          : 'bg-green-600'
                      }`}>
                        {item.type === 'appointment' ? (
                          <Calendar className="w-4 sm:w-6 h-4 sm:h-6 text-white" />
                        ) : (
                          <Pill className="w-4 sm:w-6 h-4 sm:h-6 text-white" />
                        )}
                      </div>
                      {index < filteredHistory.length - 1 && (
                        <div className="w-0.5 h-16 bg-primary-600 mt-2"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 bg-primary-700 bg-opacity-50 rounded-lg p-4 sm:p-6 border border-primary-600">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0 mb-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-base sm:text-lg font-semibold text-white mb-1 break-words">
                            {item.title}
                          </h4>
                          {item.type === 'appointment' ? (
                            <p className="text-gray-300 text-sm break-words">
                              {formatAppointmentDateTime(item.data.appointmentDate, item.data.appointmentTime)}
                            </p>
                          ) : (
                            <p className="text-gray-300 text-sm break-words">
                              {formatDateTime(item.date)}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)} flex-shrink-0`}>
                          {item.status}
                        </span>
                      </div>

                      {/* Appointment Details */}
                      {item.type === 'appointment' && (
                        <div className="space-y-2">
                          {item.data.hospital && (
                            <div className="text-gray-300 text-sm sm:text-base">
                              <strong>Hospital:</strong> <span className="break-words">{item.data.hospital.name}</span>
                            </div>
                          )}
                          {item.data.reason && (
                            <div className="text-gray-300 text-sm sm:text-base">
                              <strong>Reason:</strong> <span className="break-words">{item.data.reason}</span>
                            </div>
                          )}
                          {item.data.notes && (
                            <div className="text-gray-300 text-sm sm:text-base">
                              <strong>Notes:</strong> <span className="break-words">{item.data.notes}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Prescription Details */}
                      {item.type === 'prescription' && (
                        <div className="space-y-2">
                          {item.data.diagnosis && (
                            <div className="text-gray-300 text-sm sm:text-base">
                              <strong>Diagnosis:</strong> <span className="break-words">{item.data.diagnosis}</span>
                            </div>
                          )}
                          {item.data.medications && item.data.medications.length > 0 && (
                            <div className="text-gray-300 text-sm sm:text-base">
                              <strong>Medications:</strong> {item.data.medications.length} prescribed
                            </div>
                          )}
                          {item.data.generalInstructions && (
                            <div className="text-gray-300 text-sm sm:text-base">
                              <strong>Instructions:</strong> <span className="break-words">{item.data.generalInstructions}</span>
                            </div>
                          )}
                          <div className="flex flex-col sm:flex-row gap-2 mt-3">
                            <button 
                              onClick={() => handleViewPrescriptionDetails(item.data)}
                              className="bg-accent-600 hover:bg-accent-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center justify-center space-x-1"
                            >
                              <FileText className="w-3 h-3" />
                              <span>View Details</span>
                            </button>
                            <button 
                              onClick={() => handleDownloadPrescription(item.data)}
                              className="bg-primary-600 hover:bg-primary-500 text-white px-3 py-1 rounded text-sm transition-colors flex items-center justify-center space-x-1"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No History Found</h3>
                <p className="text-gray-300">
                  {searchTerm || activeFilter !== 'all' 
                    ? 'No records match your current filters.' 
                    : 'This patient has no medical history yet.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && selectedPrescription && (
        <PrescriptionModal 
          selectedPrescription={selectedPrescription} 
          setShowPrescriptionModal={setShowPrescriptionModal} 
          onDownload={handleDownloadPrescription}
        />
      )}
    </div>
  )
}

export default PatientHistory
