import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { doctorsAPI, appointmentsAPI, prescriptionsAPI } from '../../services/api'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  User, 
  Calendar, 
  Pill, 
  FileText,
  Search,
  Save,
  X
} from 'lucide-react'

const DoctorPrescriptions = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const appointmentId = searchParams.get('appointmentId')
  
  const [isLoading, setIsLoading] = useState(false)
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPatientSearch, setShowPatientSearch] = useState(!appointmentId)
  
  const [prescriptionData, setPrescriptionData] = useState({
    patientId: '',
    appointmentId: appointmentId || '',
    caseHistory: '',
    medications: [
      {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        customFrequency: ''
      }
    ],
    investigations: [],
    notes: '',
    followUpDate: ''
  })

  useEffect(() => {
    // Always fetch patients list for search functionality
    fetchPatients()
    
    // If there's an appointmentId, also fetch appointment details
    if (appointmentId) {
      fetchAppointmentDetails()
    }
  }, [appointmentId])

  const fetchAppointmentDetails = async () => {
    try {
      setIsLoading(true)
      const response = await appointmentsAPI.getAppointment(appointmentId)
      const appointment = response.data
      
      setSelectedPatient(appointment.patient)
      setPrescriptionData(prev => ({
        ...prev,
        patientId: appointment.patient._id,
        appointmentId: appointmentId
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
      console.log('🔍 Fetching patients for doctor...')
      const response = await doctorsAPI.getPatients()
      console.log('📋 Raw API response:', response)
      console.log('🔍 Response.data structure:', response.data)
      console.log('🔍 Response.data.patients:', response.data.patients)
      console.log('🔍 Response.data.data:', response.data.data)
      
      const patientsData = response?.data?.data?.patients || response?.data?.patients || response?.patients || []
      console.log('👥 Extracted patients data:', patientsData)
      console.log('📊 Number of patients found:', patientsData.length)
      
      setPatients(Array.isArray(patientsData) ? patientsData : [])
    } catch (error) {
      console.error('❌ Error fetching patients:', error)
      console.error('🔍 Error details:', {
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
    setPrescriptionData(prev => ({
      ...prev,
      patientId: patient._id
    }))
    setShowPatientSearch(false)
  }

  const addMedication = () => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
          customFrequency: ''
        }
      ]
    }))
  }

  const removeMedication = (index) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }))
  }

  const updateMedication = (index, field, value) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }))
  }

  const addInvestigation = () => {
    setPrescriptionData(prev => ({
      ...prev,
      investigations: [
        ...prev.investigations,
        {
          name: '',
          description: ''
        }
      ]
    }))
  }

  const removeInvestigation = (index) => {
    setPrescriptionData(prev => ({
      ...prev,
      investigations: prev.investigations.filter((_, i) => i !== index)
    }))
  }

  const updateInvestigation = (index, field, value) => {
    setPrescriptionData(prev => ({
      ...prev,
      investigations: prev.investigations.map((inv, i) => 
        i === index ? { ...inv, [field]: value } : inv
      )
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!prescriptionData.patientId) {
      toast.error('Please select a patient')
      return
    }

    if (prescriptionData.medications.some(med => !med.name || !med.dosage)) {
      toast.error('Please fill in all medication details')
      return
    }

    try {
      setIsLoading(true)
      console.log('🔍 Creating prescription with data:', prescriptionData)
      
      // Transform data to match backend API format
      const apiData = {
        patient: prescriptionData.patientId,  // patientId -> patient
        appointment: prescriptionData.appointmentId || undefined,  // optional
        diagnosis: prescriptionData.caseHistory,  // caseHistory -> diagnosis
        medications: prescriptionData.medications.map(med => ({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency === 'custom' ? med.customFrequency : med.frequency,
          duration: med.duration,
          instructions: med.instructions || ''
        })),
        notes: prescriptionData.notes || '',
        followUpDate: prescriptionData.followUpDate || undefined,
        // Note: investigations are not supported by current backend API
        // They would need to be added to backend schema and validation
      }
      
      console.log('🔄 Transformed API data:', apiData)
      
      // Create prescription using the real API
      const response = await prescriptionsAPI.createPrescription(apiData)
      console.log('✅ Prescription created successfully:', response)
      
      toast.success('Prescription created successfully!')
      navigate('/doctor/dashboard')
    } catch (error) {
      console.error('❌ Error creating prescription:', error)
      console.error('🔍 Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
      toast.error('Failed to create prescription')
    } finally {
      setIsLoading(false)
    }
  }

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
          <h1 className="text-3xl font-bold text-white">Write Prescription</h1>
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

        {/* Prescription Form */}
        {selectedPatient && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Case History */}
            <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-4">Case History</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Case History *
                </label>
                <textarea
                  value={prescriptionData.caseHistory}
                  onChange={(e) => setPrescriptionData(prev => ({ ...prev, caseHistory: e.target.value }))}
                  rows={5}
                  required
                  className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="Enter detailed case history including diagnosis, symptoms, and relevant medical information..."
                />
              </div>
            </div>

            {/* Medications */}
            <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Medications</h2>
                <button
                  type="button"
                  onClick={addMedication}
                  className="flex items-center px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medication
                </button>
              </div>

              <div className="space-y-4">
                {prescriptionData.medications.map((medication, index) => (
                  <div key={index} className="bg-primary-600 bg-opacity-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-white">Medication {index + 1}</h3>
                      {prescriptionData.medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="text-error-400 hover:text-error-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Medicine Name *
                        </label>
                        <input
                          type="text"
                          value={medication.name}
                          onChange={(e) => updateMedication(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                          placeholder="e.g., Paracetamol"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Dosage *
                        </label>
                        <input
                          type="text"
                          value={medication.dosage}
                          onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                          className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                          placeholder="e.g., 500mg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Frequency
                        </label>
                        <select
                          value={medication.frequency}
                          onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                          className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                        >
                          <option value="">Select frequency</option>
                          
                          {/* Daily frequencies */}
                          <option value="Once daily">Once daily</option>
                          <option value="Twice daily">Twice daily</option>
                          <option value="Three times daily">Three times daily</option>
                          <option value="Four times daily">Four times daily</option>
                          <option value="Five times daily">Five times daily</option>
                          <option value="Six times daily">Six times daily</option>
                          
                          {/* Specific timing */}
                          <option value="Every morning">Every morning</option>
                          <option value="Every evening">Every evening</option>
                          <option value="Before meals">Before meals</option>
                          <option value="After meals">After meals</option>
                          <option value="With meals">With meals</option>
                          <option value="At bedtime">At bedtime</option>
                          
                          {/* Interval-based */}
                          <option value="Every 4 hours">Every 4 hours</option>
                          <option value="Every 6 hours">Every 6 hours</option>
                          <option value="Every 8 hours">Every 8 hours</option>
                          <option value="Every 12 hours">Every 12 hours</option>
                          
                          {/* Weekly frequencies */}
                          <option value="Once weekly">Once weekly</option>
                          <option value="Twice weekly">Twice weekly</option>
                          <option value="Three times weekly">Three times weekly</option>
                          
                          {/* Special cases */}
                          <option value="As needed">As needed</option>
                          <option value="As directed">As directed</option>
                          <option value="Single dose">Single dose</option>
                          
                          {/* Custom option */}
                          <option value="custom">Custom frequency...</option>
                        </select>
                        
                        {/* Custom frequency input */}
                        {medication.frequency === 'custom' && (
                          <input
                            type="text"
                            value={medication.customFrequency || ''}
                            onChange={(e) => updateMedication(index, 'customFrequency', e.target.value)}
                            placeholder="Enter custom frequency (e.g., Every other day, Twice monthly)"
                            className="w-full px-3 py-2 mt-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={medication.duration}
                          onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                          className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                          placeholder="e.g., 7 days"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Instructions
                        </label>
                        <input
                          type="text"
                          value={medication.instructions}
                          onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                          className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                          placeholder="e.g., Take after meals"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Investigations */}
            <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Investigations</h2>
                <button
                  type="button"
                  onClick={addInvestigation}
                  className="flex items-center px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Investigation
                </button>
              </div>

              <div className="space-y-4">
                {prescriptionData.investigations.map((investigation, index) => (
                  <div key={index} className="bg-primary-600 bg-opacity-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-white">Investigation {index + 1}</h3>
                      {prescriptionData.investigations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInvestigation(index)}
                          className="text-error-400 hover:text-error-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Investigation Name *
                        </label>
                        <input
                          type="text"
                          value={investigation.name}
                          onChange={(e) => updateInvestigation(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                          placeholder="e.g., Blood Test"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={investigation.description}
                          onChange={(e) => updateInvestigation(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                          placeholder="e.g., Blood test for diabetes"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Notes & Follow-up */}
            <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-4">Additional Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={prescriptionData.notes}
                    onChange={(e) => setPrescriptionData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="Any additional notes or instructions..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={prescriptionData.followUpDate}
                    onChange={(e) => setPrescriptionData(prev => ({ ...prev, followUpDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                </div>
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
                {isLoading ? 'Creating...' : 'Create Prescription'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default DoctorPrescriptions
