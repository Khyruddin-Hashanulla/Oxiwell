import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { doctorsAPI, appointmentsAPI } from '../../services/api'
import { toast } from 'react-hot-toast'
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  ChevronLeft,
  MapPin,
  Clock,
  FileText,
  Stethoscope,
  Heart,
  Activity,
  AlertCircle,
  Edit,
  Eye
} from 'lucide-react'

const PatientDetails = () => {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchPatientDetails()
  }, [patientId])

  const fetchPatientDetails = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching patient details for ID:', patientId)
      
      // Fetch patient details
      const patientResponse = await doctorsAPI.getPatientDetails(patientId)
      const patientData = patientResponse?.data?.data?.patient
      
      if (!patientData) {
        toast.error('Patient not found')
        navigate('/doctor/patients')
        return
      }
      
      setPatient(patientData)
      
      console.log('✅ Patient details loaded successfully')
      console.log('📊 Patient data:', patientData)
    } catch (error) {
      console.error('❌ Error fetching patient details:', error)
      toast.error('Failed to load patient details')
      navigate('/doctor/patients')
    } finally {
      setLoading(false)
    }
  }

  const fetchAppointments = async () => {
    try {
      const appointmentsResponse = await appointmentsAPI.getPatientAppointments(patientId)
      setAppointments(appointmentsResponse?.data?.data?.appointments || [])
    } catch (error) {
      console.error('❌ Error fetching appointments:', error)
    }
  }

  useEffect(() => {
    if (activeTab === 'appointments' && appointments.length === 0) {
      fetchAppointments()
    }
  }, [activeTab])

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

  const formatAppointmentDateTime = (appointment) => {
    if (!appointment?.appointmentDate) return 'N/A'
    
    try {
      const date = new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
      
      const time = appointment.appointmentTime || 'Time not set'
      
      return `${date} at ${time}`
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

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-error-400 mx-auto mb-4" />
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
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Link
                to="/doctor/patients"
                className="bg-primary-700 hover:bg-primary-600 text-white p-2 rounded-lg transition-colors flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Patient Details
                </h1>
                <p className="text-gray-300 text-sm sm:text-base">
                  Comprehensive patient information and medical history
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Header Card */}
        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl border border-primary-600 shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 truncate">
                  {patient.fullName || `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown Patient'}
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-gray-300 text-sm sm:text-base">
                  <span>Age: {calculateAge(patient.dateOfBirth)}</span>
                  <span className="capitalize">{patient.gender || 'N/A'}</span>
                  {patient.bloodGroup && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getBloodGroupColor(patient.bloodGroup)} flex-shrink-0`}>
                      {patient.bloodGroup}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-center sm:justify-end">
              <Link
                to={`/doctor/patients/${patient._id}/history`}
                className="bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm sm:text-base"
              >
                <FileText className="w-4 h-4" />
                <span>View History</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl border border-primary-600 shadow-lg mb-6">
          <div className="flex flex-wrap border-b border-primary-600">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'appointments', label: 'Appointments', icon: Calendar },
              { id: 'medical', label: 'Medical Info', icon: Heart }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 sm:px-6 py-4 font-medium transition-colors text-sm sm:text-base flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'text-accent-400 border-b-2 border-accent-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{tab.label}</span>
                </button>
              )
            })}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="bg-primary-700 bg-opacity-50 rounded-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Phone className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span>Contact Information</span>
                  </h3>
                  <div className="space-y-3">
                    {patient.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm sm:text-base break-words">{patient.email}</span>
                      </div>
                    )}
                    {patient.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm sm:text-base">{patient.phone}</span>
                      </div>
                    )}
                    {patient.address && (
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                        <div className="text-gray-300 text-sm sm:text-base break-words">
                          {typeof patient.address === 'string' 
                            ? patient.address 
                            : `${patient.address.street || ''} ${patient.address.city || ''} ${patient.address.state || ''} ${patient.address.country || ''}`.trim()
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Information */}
                <div className="bg-primary-700 bg-opacity-50 rounded-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <User className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span>Basic Information</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
                      <span className="text-gray-400 text-sm sm:text-base">Date of Birth:</span>
                      <span className="text-white text-sm sm:text-base">{formatDate(patient.dateOfBirth)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
                      <span className="text-gray-400 text-sm sm:text-base">Gender:</span>
                      <span className="text-white text-sm sm:text-base capitalize">{patient.gender || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
                      <span className="text-gray-400 text-sm sm:text-base">Blood Group:</span>
                      <span className="text-white text-sm sm:text-base">{patient.bloodGroup || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
                      <span className="text-gray-400 text-sm sm:text-base">Registration Date:</span>
                      <span className="text-white text-sm sm:text-base">{formatDate(patient.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-primary-700 bg-opacity-50 rounded-lg p-6 text-center">
                      <div className="text-2xl font-bold text-accent-400 mb-2">
                        {patient?.appointmentCount || 0}
                      </div>
                      <div className="text-gray-300">Total Appointments</div>
                    </div>
                    <div className="bg-primary-700 bg-opacity-50 rounded-lg p-6 text-center">
                      <div className="text-2xl font-bold text-success-400 mb-2">
                        {patient?.prescriptionCount || 0}
                      </div>
                      <div className="text-gray-300">Prescriptions</div>
                    </div>
                    <div className="bg-primary-700 bg-opacity-50 rounded-lg p-6 text-center">
                      <div className="text-2xl font-bold text-warning-400 mb-2">
                        {appointments.filter(apt => apt.status === 'pending' || apt.status === 'confirmed').length}
                      </div>
                      <div className="text-gray-300">Upcoming</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div className="space-y-4">
                {appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="bg-primary-700 bg-opacity-50 rounded-lg p-4 sm:p-6 border border-primary-600"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                            <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-accent-400 flex-shrink-0" />
                            <span className="text-base sm:text-lg font-semibold text-white break-words">
                              {formatAppointmentDateTime(appointment)}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(appointment.status)} flex-shrink-0`}>
                              {appointment.status}
                            </span>
                          </div>
                          <div className="text-gray-300 mb-2 text-sm sm:text-base">
                            <strong>Reason:</strong> <span className="break-words">{appointment.reason || 'General consultation'}</span>
                          </div>
                          {appointment.hospital && (
                            <div className="text-gray-300 mb-2 text-sm sm:text-base">
                              <strong>Hospital:</strong> <span className="break-words">{appointment.hospital.name}</span>
                            </div>
                          )}
                          {appointment.notes && (
                            <div className="text-gray-300 text-sm sm:text-base">
                              <strong>Notes:</strong> <span className="break-words">{appointment.notes}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2 flex-shrink-0">
                          {appointment.status === 'completed' && (
                            <button className="bg-accent-600 hover:bg-accent-700 text-white px-3 py-1 rounded text-sm transition-colors">
                              View Report
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Appointments</h3>
                    <p className="text-gray-300">This patient has no appointment history.</p>
                  </div>
                )}
              </div>
            )}

            {/* Medical Info Tab */}
            {activeTab === 'medical' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-primary-700 bg-opacity-50 rounded-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Heart className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span>Medical Information</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
                      <span className="text-gray-400 text-sm sm:text-base">Blood Group:</span>
                      <span className="text-white text-sm sm:text-base">{patient.bloodGroup || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
                      <span className="text-gray-400 text-sm sm:text-base">Allergies:</span>
                      <span className="text-white text-sm sm:text-base break-words">{patient.allergies || 'None reported'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
                      <span className="text-gray-400 text-sm sm:text-base">Chronic Conditions:</span>
                      <span className="text-white text-sm sm:text-base break-words">{patient.chronicConditions || 'None reported'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-primary-700 bg-opacity-50 rounded-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Activity className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span>Emergency Contact</span>
                  </h3>
                  {patient.emergencyContact ? (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
                        <span className="text-gray-400 text-sm sm:text-base">Name:</span>
                        <span className="text-white text-sm sm:text-base break-words">{patient.emergencyContact.name || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
                        <span className="text-gray-400 text-sm sm:text-base">Relationship:</span>
                        <span className="text-white text-sm sm:text-base">{patient.emergencyContact.relationship || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
                        <span className="text-gray-400 text-sm sm:text-base">Phone:</span>
                        <span className="text-white text-sm sm:text-base">{patient.emergencyContact.phone || 'N/A'}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-300 text-sm sm:text-base">No emergency contact information available.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDetails
