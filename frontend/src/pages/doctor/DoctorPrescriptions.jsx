import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
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
  const { id: prescriptionId } = useParams()
  const [searchParams] = useSearchParams()
  const appointmentId = searchParams.get('appointmentId')
  
  const isEditMode = Boolean(prescriptionId)
  const id = useParams().id
  
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
    
    // Fetch prescription details for edit mode
    if (isEditMode && id) {
      console.log('🔍 Edit mode detected, fetching prescription:', id)
      fetchPrescriptionDetails(id)
    }
  }, [isEditMode, id])

  // Debug prescriptionData changes
  useEffect(() => {
    if (isEditMode) {
      console.log('🔍 PrescriptionData state changed:', {
        medications: prescriptionData.medications?.length || 0,
        investigations: prescriptionData.investigations?.length || 0,
        investigationsArray: prescriptionData.investigations,
        notes: prescriptionData.notes ? 'has-notes' : 'no-notes'
      })
    }
  }, [prescriptionData, isEditMode])

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

  const fetchPrescriptionDetails = async (id) => {
    try {
      setIsLoading(true)
      console.log('🔍 Fetching prescription details for ID:', id)
      const resp = await prescriptionsAPI.getPrescription(id)
      console.log('🔍 Fetch prescription details resp:', resp)
      
      // Try multiple possible response structures
      let p = null
      if (resp?.data?.data?.prescription) {
        p = resp.data.data.prescription
        console.log('🔍 Found prescription in resp.data.data.prescription')
      } else if (resp?.data?.prescription) {
        p = resp.data.prescription
        console.log('🔍 Found prescription in resp.data.prescription')
      } else if (resp?.data) {
        p = resp.data
        console.log('🔍 Found prescription in resp.data')
      } else {
        console.log('❌ No prescription data found in response')
        toast.error('No prescription data found')
        return
      }
      
      console.log('🔍 Normalized prescription object:', p)
      console.log('🔍 Prescription medications:', p.medications)
      console.log('🔍 Prescription recommendedTests:', p.recommendedTests)
      console.log('🔍 Prescription generalInstructions:', p.generalInstructions)
      
      if (p) {
        // Prefill patient selection
        if (p.patient) {
          console.log('🔍 Setting selected patient:', p.patient)
          setSelectedPatient(p.patient)
        }
        
        // Process all prescription data in a single state update
        const processedMedications = (p.medications || []).map(med => ({
          ...med,
          // Store frequency directly - no mapping needed
          frequency: med.frequency
        }))
        
        // Process investigations from backend recommendedTests
        console.log('🔍 Processing investigations from recommendedTests:', p.recommendedTests)
        let processedInvestigations = []
        if (Array.isArray(p.recommendedTests) && p.recommendedTests.length > 0) {
          processedInvestigations = p.recommendedTests.map(test => {
            if (typeof test === 'string') {
              return { name: test, description: '' }
            }
            if (test && typeof test === 'object') {
              return { 
                name: test.testName || test.name || '', 
                description: test.instructions || test.description || '' 
              }
            }
            return { name: '', description: '' }
          })
        } else {
          console.log('🔍 No investigations found, adding empty investigation')
          // Add empty investigation for editing
          processedInvestigations = [{ name: '', description: '' }]
          console.log('🔍 Added empty investigation for editing')
        }
        console.log('🔍 Final investigations array:', processedInvestigations)
        
        // Single state update with all processed data
        setPrescriptionData(prev => ({
          ...prev,
          patientId: p.patient._id,
          caseHistory: p.diagnosis || '',
          medications: processedMedications,
          investigations: processedInvestigations,
          notes: p.generalInstructions || p.notes || p.additionalNotes || '',
          followUpDate: p.followUpDate ? String(p.followUpDate).slice(0, 10) : ''
        }))
        
        console.log('🔍 Final prescription data after processing:', {
          medications: processedMedications?.length || 0,
          investigations: processedInvestigations?.length || 0,
          investigationsData: processedInvestigations,
          firstInvestigation: processedInvestigations[0],
          notes: p.generalInstructions || p.notes || 'no-notes'
        })
      }
    } catch (error) {
      console.error('Error fetching prescription details:', error)
      toast.error('Failed to load prescription')
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
    console.log('🔍 updateInvestigation called:', { index, field, value })
    setPrescriptionData(prev => ({
      ...prev,
      investigations: prev.investigations.map((inv, i) => 
        i === index ? { ...inv, [field]: value } : inv
      )
    }))
    console.log('🔍 Investigation updated, new state should be:', { index, field, value })
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
      // Build payload aligned to backend schema
      const normalizeInvestigations = (items) => {
        console.log('🔍 normalizeInvestigations input:', items)
        if (!Array.isArray(items)) return []
        const result = items
          .map((it) => {
            console.log('🔍 Processing investigation item:', it)
            if (typeof it === 'string') return it.trim()
            if (it && typeof it === 'object') {
              // Handle both testName (backend format) and name (frontend format)
              const name = it.testName || it.name || ''
              console.log('🔍 Extracted name:', name)
              return name.trim()
            }
            console.log('🔍 Unknown format, returning empty')
            return ''
          })
          .filter(Boolean)
        console.log('🔍 normalizeInvestigations result:', result)
        return result
      }
      
      // Process and normalize medications
      const processedMedications = prescriptionData.medications.map(med => {
        // Store medication data directly - no normalization needed
        const medicationData = {
          name: med.name?.trim() || '',
          dosage: med.dosage?.trim() || '',
          frequency: med.frequency?.trim() || '',
          duration: med.duration?.trim() || '',
          instructions: med.instructions?.trim() || ''
        }
        
        // Include customFrequency only if frequency is 'custom'
        if (med.frequency === 'custom' && med.customFrequency) {
          medicationData.customFrequency = med.customFrequency?.trim() || ''
        }
        
        console.log('🔍 Final medication payload:', medicationData)
        return medicationData
      })

      const payload = {
        patient: prescriptionData.patientId,
        appointment: prescriptionData.appointmentId || undefined,
        diagnosis: prescriptionData.caseHistory,
        medications: processedMedications,
        generalInstructions: prescriptionData.notes || '',
        recommendedTests: prescriptionData.investigations
          .filter(inv => inv.name && inv.name.trim()) // Only include investigations with names
          .map(inv => ({
            testName: inv.name.trim(),
            urgency: 'routine',
            instructions: inv.description && inv.description.trim() ? inv.description.trim() : undefined
          })),
        followUpDate: prescriptionData.followUpDate || undefined
      }

      console.log('🔍 Submitting prescription payload:', payload)
      
      // Detailed payload validation logging
      console.log('🔍 Payload validation check:')
      console.log('- Patient ID:', payload.patient)
      console.log('- Diagnosis:', payload.diagnosis)
      console.log('- Medications count:', payload.medications?.length)
      console.log('- Medications details:', payload.medications)
      console.log('- General instructions:', payload.generalInstructions)
      console.log('- Recommended tests:', payload.recommendedTests)
      console.log('- Follow-up date:', payload.followUpDate)
      
      // Check for empty required fields
      if (!payload.patient) console.warn('⚠️ Missing patient ID')
      if (!payload.diagnosis) console.warn('⚠️ Missing diagnosis')
      if (!payload.medications || payload.medications.length === 0) console.warn('⚠️ No medications')
      
      payload.medications?.forEach((med, index) => {
        if (!med.name) console.warn(`⚠️ Medication ${index + 1} missing name`)
        if (!med.dosage) console.warn(`⚠️ Medication ${index + 1} missing dosage`)
        if (!med.frequency) console.warn(`⚠️ Medication ${index + 1} missing frequency`)
        if (!med.duration) console.warn(`⚠️ Medication ${index + 1} missing duration`)
        if (med.frequency === 'custom' && !med.customFrequency) {
          console.warn(`⚠️ Medication ${index + 1} has custom frequency but no customFrequency value`)
        }
      })

      if (isEditMode) {
        const resp = await prescriptionsAPI.updatePrescription(id, payload)
        console.log('✅ Prescription updated:', resp)
        toast.success('Prescription updated successfully')
      } else {
        const resp = await prescriptionsAPI.createPrescription(payload)
        console.log('✅ Prescription created:', resp)
        toast.success('Prescription created successfully')
      }
      navigate('/doctor/prescriptions')
    } catch (error) {
      console.error('❌ Error creating prescription:', error)
      console.log('🔍 Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        fullResponse: error.response
      })
      // Log the specific validation errors if available
      if (error.response?.data?.errors) {
        console.log('🚨 Validation errors:', error.response.data.errors)
        // Log each validation error in detail
        if (Array.isArray(error.response.data.errors)) {
          error.response.data.errors.forEach((err, index) => {
            console.log(`🚨 Validation Error ${index + 1}:`, err)
          })
        }
      }
      if (error.response?.data?.message) {
        console.log('🚨 Backend error message:', error.response.data.message)
      }
      
      // Show user-friendly error message based on validation errors
      let errorMessage = 'Failed to update prescription'
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        if (Array.isArray(errors) && errors.length > 0) {
          const firstError = errors[0]
          if (firstError.path && firstError.message) {
            errorMessage = `Validation error: ${firstError.message}`
          }
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPatients = (Array.isArray(patients) ? patients : []).filter(patient =>
    patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
        <span className="ml-4 text-white">
          {isEditMode ? 'Loading prescription details...' : 'Loading...'}
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
          <button
            onClick={() => navigate('/doctor/dashboard')}
            className="flex items-center text-white hover:text-accent-400 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white text-center sm:text-left">Write Prescription</h1>
          <div className="hidden sm:block w-32"></div>
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
                className="w-full pl-10 pr-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm sm:text-base"
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
          <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-4 sm:p-6 border border-primary-600 shadow-lg mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </h3>
                  <p className="text-gray-300 text-sm sm:text-base truncate">{selectedPatient.email}</p>
                </div>
              </div>
              {!appointmentId && (
                <button
                  onClick={() => setShowPatientSearch(true)}
                  className="text-accent-400 hover:text-accent-300 transition-colors text-sm sm:text-base flex-shrink-0 self-start sm:self-center"
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
            <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-4 sm:p-6 border border-primary-600 shadow-lg mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Case History</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Case History *
                </label>
                <textarea
                  value={prescriptionData.caseHistory}
                  onChange={(e) => setPrescriptionData(prev => ({ ...prev, caseHistory: e.target.value }))}
                  rows={5}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm sm:text-base"
                  placeholder="Enter detailed case history including diagnosis, symptoms, and relevant medical information..."
                />
              </div>
            </div>

            {/* Medications */}
            <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-4 sm:p-6 border border-primary-600 shadow-lg mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-white">Medications</h2>
                <button
                  type="button"
                  onClick={addMedication}
                  className="flex items-center px-3 sm:px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medication
                </button>
              </div>

              <div className="space-y-4">
                {prescriptionData.medications.map((medication, index) => (
                  <div key={index} className="bg-primary-600 bg-opacity-50 rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-3">
                      <h3 className="text-base sm:text-lg font-medium text-white">Medication {index + 1}</h3>
                      {prescriptionData.medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="text-error-400 hover:text-error-300 transition-colors self-start sm:self-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                          Medicine Name *
                        </label>
                        <input
                          type="text"
                          value={medication.name}
                          placeholder="Enter medicine name"
                          onChange={(e) => updateMedication(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm sm:text-base"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                          Dosage *
                        </label>
                        <input
                          type="text"
                          value={medication.dosage}
                          onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                          className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm sm:text-base"
                          placeholder="e.g., 500mg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                          Frequency *
                        </label>
                        <select
                          value={medication.frequency || ''}
                          onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                          className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm sm:text-base"
                          required
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
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                          {/* Special cases */}
                          <option value="As needed">As needed</option>
                          {/* Custom option at the end */}
                          <option value="custom">Custom frequency</option>
                        </select>
                        {/* Custom frequency input */}
                        {medication.frequency === 'custom' && (
                          <input
                            type="text"
                            value={medication.customFrequency || ''}
                            onChange={(e) => updateMedication(index, 'customFrequency', e.target.value)}
                            placeholder="Enter custom frequency (e.g., Every other day, Twice monthly)"
                            className="w-full px-3 py-2 mt-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm sm:text-base"
                            required
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                          Duration *
                        </label>
                        <input
                          type="text"
                          value={medication.duration}
                          onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                          className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm sm:text-base"
                          placeholder="e.g., 7 days"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                          Instructions *
                        </label>
                        <input
                          type="text"
                          value={medication.instructions}
                          onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                          className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm sm:text-base"
                          placeholder="e.g., Take after meals"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Investigations */}
            <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-4 sm:p-6 border border-primary-600 shadow-lg mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-white">Investigations</h2>
                <button
                  type="button"
                  onClick={addInvestigation}
                  className="flex items-center px-3 sm:px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Investigation
                </button>
              </div>

              <div className="space-y-4">
                {prescriptionData.investigations.map((investigation, index) => (
                  <div key={index} className="bg-primary-600 bg-opacity-50 rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-3">
                      <h3 className="text-base sm:text-lg font-medium text-white">Investigation {index + 1}</h3>
                      {prescriptionData.investigations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInvestigation(index)}
                          className="text-error-400 hover:text-error-300 transition-colors self-start sm:self-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                          Investigation Name *
                        </label>
                        <input
                          type="text"
                          value={investigation?.name || ''}
                          ref={(input) => {
                            if (input && index === 0) {
                              console.log('🔍 Investigation input render:', {
                                index,
                                investigation,
                                name: investigation?.name,
                                value: investigation?.name || '',
                                inputValue: input.value
                              })
                            }
                          }}
                          onChange={(e) => updateInvestigation(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                          placeholder="e.g., Blood Test"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={investigation?.description || ''}
                          ref={(input) => {
                            if (input && index === 0) {
                              console.log('🔍 Investigation description render:', {
                                index,
                                investigation,
                                description: investigation?.description,
                                value: investigation?.description || '',
                                inputValue: input.value
                              })
                            }
                          }}
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
            <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-4 sm:p-6 border border-primary-600 shadow-lg">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Additional Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={prescriptionData.notes}
                    onChange={(e) => setPrescriptionData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm sm:text-base"
                    placeholder="Any additional notes or instructions..."
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={prescriptionData.followUpDate}
                    onChange={(e) => setPrescriptionData(prev => ({ ...prev, followUpDate: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={() => navigate('/doctor/dashboard')}
                className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto flex items-center justify-center px-4 sm:px-6 py-3 bg-success-600 hover:bg-success-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Prescription' : 'Create Prescription')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default DoctorPrescriptions
