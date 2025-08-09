import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { doctorsAPI, appointmentsAPI } from '../../services/api'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeft, 
  Plus, 
  User, 
  Calendar, 
  FileText,
  Search,
  Save,
  Clock,
  Stethoscope,
  Activity
} from 'lucide-react'

const DoctorNotes = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const appointmentId = searchParams.get('appointmentId')
  
  const [isLoading, setIsLoading] = useState(false)
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPatientSearch, setShowPatientSearch] = useState(!appointmentId)
  
  const [noteData, setNoteData] = useState({
    patientId: '',
    appointmentId: appointmentId || '',
    title: '',
    type: 'consultation',
    content: '',
    symptoms: '',
    examination: '',
    diagnosis: '',
    treatment: '',
    recommendations: '',
    followUpRequired: false,
    followUpDate: '',
    priority: 'normal'
  })

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails()
    } else {
      fetchPatients()
    }
  }, [appointmentId])

  const fetchAppointmentDetails = async () => {
    try {
      setIsLoading(true)
      const response = await appointmentsAPI.getAppointment(appointmentId)
      const appointment = response.data
      
      setSelectedPatient(appointment.patient)
      setNoteData(prev => ({
        ...prev,
        patientId: appointment.patient._id,
        appointmentId: appointmentId,
        title: `Consultation - ${new Date().toLocaleDateString()}`
      }))
    } catch (error) {
      console.error('Error fetching appointment details:', error)
      toast.error('Failed to load appointment details')
      setShowPatientSearch(true)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      setIsLoading(true)
      console.log('🔍 Fetching patients for doctor (Notes)...')
      const response = await doctorsAPI.getPatients()
      console.log('📋 Raw API response (Notes):', response)
      
      // Fix data access path to match Dashboard implementation
      const patientsData = response?.data?.data?.patients || response?.data?.patients || response?.patients || []
      console.log('👥 Extracted patients data (Notes):', patientsData)
      console.log('📊 Number of patients found (Notes):', patientsData.length)
      
      setPatients(Array.isArray(patientsData) ? patientsData : [])
    } catch (error) {
      console.error('❌ Error fetching patients (Notes):', error)
      console.error('🔍 Error details (Notes):', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
      toast.error('Failed to load patients')
      setPatients([])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient)
    setNoteData(prev => ({
      ...prev,
      patientId: patient._id,
      title: `Medical Note - ${patient.firstName} ${patient.lastName} - ${new Date().toLocaleDateString()}`
    }))
    setShowPatientSearch(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!noteData.patientId) {
      toast.error('Please select a patient')
      return
    }

    if (!noteData.title || !noteData.content) {
      toast.error('Please fill in the title and content')
      return
    }

    try {
      setIsLoading(true)
      // TODO: Implement medical notes API endpoint
      // await medicalNotesAPI.createNote(noteData)
      
      // For now, show success message and navigate back
      console.log('Medical note data to be saved:', noteData)
      toast.success('Medical note saved successfully (Demo mode)')
      navigate('/doctor/dashboard')
    } catch (error) {
      console.error('Error saving medical note:', error)
      toast.error('Failed to save medical note')
    } finally {
      setIsLoading(false)
    }
  }

  // Add safety check before filtering patients
  const filteredPatients = (Array.isArray(patients) ? patients : []).filter(patient =>
    patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading && !selectedPatient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/doctor/dashboard')}
            className="flex items-center text-white hover:text-accent-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">Medical Notes</h1>
          <div className="w-32"></div>
        </div>

        {/* Patient Selection */}
        {showPatientSearch ? (
          <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Select Patient</h2>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search patients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredPatients.map((patient) => (
                <button
                  key={patient._id}
                  onClick={() => handlePatientSelect(patient)}
                  className="w-full p-3 bg-primary-600 hover:bg-primary-500 rounded-lg text-left transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-gray-300 text-sm">{patient.email}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : selectedPatient && (
          <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </h3>
                  <p className="text-gray-300">{selectedPatient.email}</p>
                  {selectedPatient.phone && (
                    <p className="text-gray-400 text-sm">{selectedPatient.phone}</p>
                  )}
                </div>
              </div>
              {!appointmentId && (
                <button
                  onClick={() => setShowPatientSearch(true)}
                  className="text-accent-400 hover:text-accent-300 transition-colors"
                >
                  Change Patient
                </button>
              )}
            </div>
          </div>
        )}

        {/* Medical Note Form */}
        {selectedPatient && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Note Header */}
            <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-4">Note Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Note Title *
                  </label>
                  <input
                    type="text"
                    value={noteData.title}
                    onChange={(e) => setNoteData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="Enter note title..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Note Type
                  </label>
                  <select
                    value={noteData.type}
                    onChange={(e) => setNoteData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="emergency">Emergency</option>
                    <option value="routine">Routine Check</option>
                    <option value="specialist">Specialist Referral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={noteData.priority}
                    onChange={(e) => setNoteData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date
                  </label>
                  <div className="flex items-center space-x-2 px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Information */}
            <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-4">Clinical Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Symptoms
                  </label>
                  <textarea
                    value={noteData.symptoms}
                    onChange={(e) => setNoteData(prev => ({ ...prev, symptoms: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="Patient's reported symptoms..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Physical Examination
                  </label>
                  <textarea
                    value={noteData.examination}
                    onChange={(e) => setNoteData(prev => ({ ...prev, examination: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="Physical examination findings..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Diagnosis
                  </label>
                  <textarea
                    value={noteData.diagnosis}
                    onChange={(e) => setNoteData(prev => ({ ...prev, diagnosis: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="Clinical diagnosis..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Treatment Plan
                  </label>
                  <textarea
                    value={noteData.treatment}
                    onChange={(e) => setNoteData(prev => ({ ...prev, treatment: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="Treatment plan and interventions..."
                  />
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-4">Additional Notes</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Detailed Notes *
                  </label>
                  <textarea
                    value={noteData.content}
                    onChange={(e) => setNoteData(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="Detailed consultation notes, observations, and additional information..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Recommendations
                  </label>
                  <textarea
                    value={noteData.recommendations}
                    onChange={(e) => setNoteData(prev => ({ ...prev, recommendations: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="Recommendations for patient care, lifestyle changes, etc..."
                  />
                </div>
              </div>
            </div>

            {/* Follow-up Information */}
            <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-4">Follow-up</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="followUpRequired"
                    checked={noteData.followUpRequired}
                    onChange={(e) => setNoteData(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                    className="w-4 h-4 text-accent-600 bg-primary-700 border-primary-600 rounded focus:ring-accent-500"
                  />
                  <label htmlFor="followUpRequired" className="text-white font-medium">
                    Follow-up appointment required
                  </label>
                </div>

                {noteData.followUpRequired && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Recommended Follow-up Date
                    </label>
                    <input
                      type="date"
                      value={noteData.followUpDate}
                      onChange={(e) => setNoteData(prev => ({ ...prev, followUpDate: e.target.value }))}
                      className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/doctor/dashboard')}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center px-6 py-3 bg-success-600 hover:bg-success-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Medical Note'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default DoctorNotes
