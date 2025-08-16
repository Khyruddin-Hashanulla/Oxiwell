import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { doctorsAPI } from '../../services/api'
import { toast } from 'react-hot-toast'
import { 
  Stethoscope, Clock, MapPin, FileText, Save, ArrowRight, CheckCircle, 
  GraduationCap, User, Camera, Phone, Globe, Heart, Building2, Upload
} from 'lucide-react'

const DoctorProfileSetup = () => {
  const { user, updateProfile, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 6

  const [formData, setFormData] = useState({
    // Personal Information (prefilled)
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    
    // Professional Information (prefilled)
    specialization: '',
    licenseNumber: '',
    medicalRegistrationNumber: '',
    experience: '',
    qualifications: [{ degree: '', institution: '', year: '' }],
    
    // Profile & Bio
    professionalBio: '',
    profileImageFile: null,
    profileImagePreview: '',
    languages: ['English'],
    
    // Services & Consultation
    servicesProvided: [],
    onlineConsultationAvailable: false,
    offlineConsultationAvailable: true,
    
    // Workplaces & Availability (per hospital)
    workplaces: [{
      type: 'hospital',
      hospital: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      },
      consultationFee: '',
      availableSlots: [{ day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true }]
    }],
    
    // Emergency Contact
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    },
    
    // Address
    address: { 
      street: '', 
      city: '', 
      state: '', 
      zipCode: '', 
      country: 'India' 
    }
  })

  const [errors, setErrors] = useState({})

  const specializations = [
    'General Medicine', 'Cardiology', 'Dermatology', 'Pediatrics', 'Orthopedics',
    'Neurology', 'Psychiatry', 'Gynecology', 'ENT', 'Ophthalmology', 'Radiology',
    'Anesthesiology', 'Emergency Medicine', 'Internal Medicine', 'Surgery'
  ]

  const servicesOptions = [
    'General Consultation', 'Health Checkup', 'Vaccination', 'Minor Surgery',
    'Diagnostic Tests', 'Emergency Care', 'Follow-up Consultation', 'Prescription Refill',
    'Health Counseling', 'Preventive Care', 'Chronic Disease Management'
  ]

  const relationshipOptions = [
    'Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Colleague', 'Other'
  ]

  // Load existing doctor data on component mount
  useEffect(() => {
    let isMounted = true
    let hasLoadedData = false

    const loadDoctorData = async () => {
      // Prevent duplicate calls
      if (hasLoadedData || !isMounted) {
        console.log('⏭️ Skipping duplicate data load call')
        return
      }

      try {
        setDataLoading(true)
        
        // Wait for authentication to complete
        if (authLoading) {
          console.log('Waiting for authentication to complete...')
          return
        }
        
        // Ensure we have a user ID before making the API call
        if (!user?._id) {
          console.error('No user ID available for data loading')
          setDataLoading(false)
          return
        }

        // Mark as loading to prevent duplicate calls
        hasLoadedData = true

        // Add a small delay to ensure token is properly set
        await new Promise(resolve => setTimeout(resolve, 500))

        console.log('Loading doctor data for user:', user._id)
        const response = await doctorsAPI.getDoctor(user._id)
        
        // Check if component is still mounted before updating state
        if (!isMounted) return

        console.log('🔍 Full API response:', response)
        console.log('📊 Response status:', response?.status)
        console.log('📋 Response data:', response?.data)
        console.log('👨‍⚕️ Doctor data:', response?.data?.data?.doctor)
        console.log('🔑 Response data keys:', response?.data ? Object.keys(response.data) : 'No data')
        console.log('🏗️ Response data structure:', JSON.stringify(response?.data, null, 2))
        
        // Check if response and data exist
        const doctorData = response?.data?.data?.doctor
        if (!doctorData) {
          console.error('❌ No doctor data received from API')
          console.error('🔍 Response structure:', {
            hasResponse: !!response,
            hasData: !!response?.data,
            hasNestedData: !!response?.data?.data,
            hasDoctor: !!response?.data?.data?.doctor,
            responseKeys: response ? Object.keys(response) : 'No response',
            dataKeys: response?.data ? Object.keys(response.data) : 'No data'
          })
          
          // Try to use fallback data from auth context
          if (user && isMounted) {
            console.log('🔄 Using fallback data from auth context:', user)
            const fallbackData = {
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              email: user.email || '',
              phone: user.phone || '',
              gender: user.gender || '',
              dateOfBirth: user.dateOfBirth || '',
              specialization: user.specialization || '',
              licenseNumber: user.licenseNumber || '',
              medicalRegistrationNumber: user.medicalRegistrationNumber || '',
              experience: user.experience || '',
              qualifications: user.qualifications || [],
              professionalBio: user.professionalBio || '',
              profileImage: user.profileImage || '',
              languages: user.languages || [],
              servicesProvided: user.servicesProvided || [],
              onlineConsultationAvailable: user.onlineConsultationAvailable || false,
              offlineConsultationAvailable: user.offlineConsultationAvailable !== false,
              workplaces: user.workplaces || [],
              emergencyContact: user.emergencyContact || {},
              address: user.address || {}
            }
            
            setFormData(prev => ({ ...prev, ...fallbackData }))
            console.log('✅ Form data updated with fallback information')
          }
        } else {
          // Update form with doctor data
          const updatedFormData = {
            firstName: doctorData.firstName || '',
            lastName: doctorData.lastName || '',
            email: doctorData.email || '',
            phone: doctorData.phone || '',
            gender: doctorData.gender || '',
            dateOfBirth: doctorData.dateOfBirth || '',
            specialization: doctorData.specialization || '',
            licenseNumber: doctorData.licenseNumber || '',
            medicalRegistrationNumber: doctorData.medicalRegistrationNumber || '',
            experience: doctorData.experience || '',
            qualifications: doctorData.qualifications || [{ degree: '', institution: '', year: '' }],
            professionalBio: doctorData.professionalBio || '',
            profileImage: doctorData.profileImage || '',
            languages: doctorData.languages || [],
            servicesProvided: doctorData.servicesProvided || [],
            onlineConsultationAvailable: doctorData.onlineConsultationAvailable || false,
            offlineConsultationAvailable: doctorData.offlineConsultationAvailable !== false,
            workplaces: doctorData.workplaces || [],
            emergencyContact: doctorData.emergencyContact || {},
            address: doctorData.address || {}
          }
          
          if (isMounted) {
            setFormData(prev => ({ ...prev, ...updatedFormData }))
            console.log('✅ Form data updated with doctor information')
          }
        }
      } catch (error) {
        console.error('❌ Error loading doctor data:', error)
        
        // Reset the flag on error to allow retry
        hasLoadedData = false
        
        // On error, try to use fallback data from auth context
        if (user && isMounted) {
          console.log('🔄 Using fallback data from auth context due to error')
          const fallbackData = {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            gender: user.gender || '',
            dateOfBirth: user.dateOfBirth || '',
            specialization: user.specialization || '',
            licenseNumber: user.licenseNumber || '',
            medicalRegistrationNumber: user.medicalRegistrationNumber || '',
            experience: user.experience || '',
            qualifications: user.qualifications || [],
            professionalBio: user.professionalBio || '',
            profileImage: user.profileImage || '',
            languages: user.languages || [],
            servicesProvided: user.servicesProvided || [],
            onlineConsultationAvailable: user.onlineConsultationAvailable || false,
            offlineConsultationAvailable: user.offlineConsultationAvailable !== false,
            workplaces: user.workplaces || [],
            emergencyContact: user.emergencyContact || {},
            address: user.address || {}
          }
          
          setFormData(prev => ({ ...prev, ...fallbackData }))
          console.log('✅ Form data updated with fallback information')
        }
      } finally {
        if (isMounted) {
          setDataLoading(false)
        }
      }
    }

    // Only load data if we have user and auth is not loading
    if (!authLoading && user?._id) {
      loadDoctorData()
    } else if (!authLoading && !user) {
      console.log('No user available after auth completion, skipping data load')
      setDataLoading(false)
    }

    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [user?._id, authLoading]) // Only depend on user ID and auth loading state

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleNestedInputChange = (parentField, childField, value) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }))
    if (errors[`${parentField}.${childField}`]) {
      setErrors(prev => ({ ...prev, [`${parentField}.${childField}`]: '' }))
    }
  }

  const handleArrayNestedInputChange = (arrayField, index, childField, value) => {
    setFormData(prev => {
      const newArray = [...prev[arrayField]]
      
      // Handle nested object properties (e.g., address.street, address.city)
      if (childField.includes('.')) {
        const [parentField, nestedField] = childField.split('.')
        newArray[index] = {
          ...newArray[index],
          [parentField]: {
            ...newArray[index][parentField],
            [nestedField]: value
          }
        }
      } else {
        // Handle simple properties
        newArray[index] = {
          ...newArray[index],
          [childField]: value
        }
      }
      
      return {
        ...prev,
        [arrayField]: newArray
      }
    })
    if (errors[`${arrayField}.${index}.${childField}`]) {
      setErrors(prev => ({ ...prev, [`${arrayField}.${index}.${childField}`]: '' }))
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profileImageFile: file,
          profileImagePreview: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const validateStep = (step) => {
    const newErrors = {}
    
    if (step === 1) {
      // Step 1: Personal Information
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        newErrors.firstName = 'First name is required'
        newErrors.lastName = 'Last name is required'
        newErrors.email = 'Email is required'
        newErrors.phone = 'Phone number is required'
      }
    } else if (step === 2) {
      // Step 2: Professional Information
      if (!formData.specialization || !formData.medicalRegistrationNumber || !formData.experience) {
        newErrors.specialization = 'Specialization is required'
        newErrors.medicalRegistrationNumber = 'Medical registration number is required'
        newErrors.experience = 'Years of experience is required'
      }
      
      // Validate qualifications
      if (!formData.qualifications || !Array.isArray(formData.qualifications) || formData.qualifications.length === 0) {
        newErrors.qualifications = 'At least one qualification is required'
      } else {
        // Check if all qualifications are complete
        for (let i = 0; i <formData.qualifications.length; i++) {
          const qual = formData.qualifications[i]
          if (!qual.degree?.trim() || !qual.institution?.trim() || !qual.year) {
            newErrors.qualifications = 'All qualification fields (degree, institution, year) must be completed'
            break
          }
        }
      }
    } else if (step === 3) {
      // Step 3: Profile & Bio
      if (!formData.professionalBio) {
        newErrors.professionalBio = 'Professional bio is required'
      }
    } else if (step === 4) {
      // Step 4: Services & Consultation
      if (!formData.servicesProvided.length) {
        newErrors.servicesProvided = 'At least one service is required'
      }
    } else if (step === 5) {
      // Step 5: Workplaces & Availability
      if (!formData.workplaces.length) {
        newErrors.workplaces = 'At least one workplace is required'
      } else {
        // Check if all workplaces are complete
        for (let i = 0; i < formData.workplaces.length; i++) {
          const workplace = formData.workplaces[i]
          if (!workplace.type || !workplace.hospital || !workplace.phone || !workplace.address.street || !workplace.address.city || !workplace.address.state || !workplace.address.zipCode || !workplace.consultationFee) {
            newErrors.workplaces = 'All workplace fields must be completed'
            break
          }
        }
      }
    } else if (step === 6) {
      // Step 6: Emergency Contact & Address
      if (!formData.emergencyContact.name || !formData.emergencyContact.relationship || !formData.emergencyContact.phone) {
        newErrors.emergencyContact = {
          name: 'Name is required',
          relationship: 'Relationship is required',
          phone: 'Phone number is required'
        }
      }
      if (!formData.address.street || !formData.address.city || !formData.address.state || !formData.address.zipCode) {
        newErrors.address = {
          street: 'Street address is required',
          city: 'City is required',
          state: 'State is required',
          zipCode: 'ZIP code is required'
        }
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return
    setLoading(true)
    try {
      // Convert form data to FormData for multipart/form-data submission
      const submitData = new FormData()
      
      // Add basic fields
      submitData.append('firstName', formData.firstName || '')
      submitData.append('lastName', formData.lastName || '')
      submitData.append('email', formData.email || '')
      submitData.append('phone', formData.phone || '')
      submitData.append('gender', formData.gender || '')
      submitData.append('dateOfBirth', formData.dateOfBirth || '')
      submitData.append('specialization', formData.specialization || '')
      submitData.append('licenseNumber', formData.licenseNumber || '')
      submitData.append('medicalRegistrationNumber', formData.medicalRegistrationNumber || '')
      submitData.append('experience', formData.experience || '')
      submitData.append('professionalBio', formData.professionalBio || '')
      submitData.append('onlineConsultationAvailable', formData.onlineConsultationAvailable || false)
      submitData.append('offlineConsultationAvailable', formData.offlineConsultationAvailable || true)
      
      // Add JSON fields as strings
      submitData.append('languages', JSON.stringify(formData.languages || []))
      submitData.append('servicesProvided', JSON.stringify(formData.servicesProvided || []))
      submitData.append('workplaces', JSON.stringify(formData.workplaces || []))
      submitData.append('emergencyContact', JSON.stringify(formData.emergencyContact || {}))
      submitData.append('address', JSON.stringify(formData.address || {}))
      submitData.append('qualifications', JSON.stringify(formData.qualifications || []))
      
      // Add profile image if exists
      if (formData.profileImageFile) {
        submitData.append('profileImage', formData.profileImageFile)
      }
      
      console.log('🔍 Submitting profile setup with FormData')
      console.log('🔍 FormData entries:')
      for (let pair of submitData.entries()) {
        console.log(`  ${pair[0]}:`, pair[1])
      }
      
      const response = await doctorsAPI.completeProfileSetup(submitData)
      console.log('✅ Profile setup response:', response)
      
      // Only show success toast if API call was successful
      toast.success('Profile setup completed!')
      
      // Navigate directly to dashboard without calling updateProfile
      // The profile data will be refreshed when the dashboard loads
      console.log('🔄 Navigating to dashboard...')
      navigate('/doctor/dashboard')
    } catch (error) {
      console.error('❌ Profile setup error:', error)
      
      // Extract error message from response if available
      let errorMessage = 'Failed to complete setup'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
      // Don't navigate on error, stay on the setup page
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <User className="w-16 h-16 text-accent-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-white">Personal Information</h2>
              <p className="text-accent-300">Complete your personal details</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 ${errors.firstName ? 'border-red-400' : 'border-primary-500'}`}
                  placeholder="John"
                />
                {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 ${errors.lastName ? 'border-red-400' : 'border-primary-500'}`}
                  placeholder="Doe"
                />
                {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 ${errors.email ? 'border-red-400' : 'border-primary-500'}`}
                  placeholder="john.doe@example.com"
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Phone *</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 ${errors.phone ? 'border-red-400' : 'border-primary-500'}`}
                  placeholder="+91 1234567890"
                />
                {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Stethoscope className="w-16 h-16 text-accent-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-white">Professional Information</h2>
              <p className="text-accent-300">Complete your professional details</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Specialization *</label>
                <select
                  value={formData.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white ${errors.specialization ? 'border-red-400' : 'border-primary-500'}`}
                >
                  <option value="" className="text-gray-800">Select Specialization</option>
                  {specializations.map(specialization => (
                    <option key={specialization} value={specialization} className="text-gray-800">{specialization}</option>
                  ))}
                </select>
                {errors.specialization && <p className="text-red-400 text-sm mt-1">{errors.specialization}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">License Number</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 border-primary-500"
                  placeholder="e.g., 123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Medical Registration Number *</label>
                <input
                  type="text"
                  value={formData.medicalRegistrationNumber}
                  onChange={(e) => handleInputChange('medicalRegistrationNumber', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 ${errors.medicalRegistrationNumber ? 'border-red-400' : 'border-primary-500'}`}
                  placeholder="e.g., 123456"
                />
                {errors.medicalRegistrationNumber && <p className="text-red-400 text-sm mt-1">{errors.medicalRegistrationNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Years of Experience *</label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 ${errors.experience ? 'border-red-400' : 'border-primary-500'}`}
                  placeholder="e.g., 5"
                  min="0"
                />
                {errors.experience && <p className="text-red-400 text-sm mt-1">{errors.experience}</p>}
              </div>
            </div>

            {/* Qualifications Section */}
            <div className="mt-8">
              <label className="block text-sm font-medium mb-4 text-white">Qualifications *</label>
              <div className="space-y-4">
                {(formData.qualifications && Array.isArray(formData.qualifications) ? formData.qualifications : [{ degree: '', institution: '', year: '' }]).map((qualification, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-primary-700/20 border-primary-600">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">Degree *</label>
                        <input
                          type="text"
                          value={qualification?.degree || ''}
                          onChange={(e) => handleArrayNestedInputChange('qualifications', index, 'degree', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg bg-white/10 text-white placeholder-gray-400 border-primary-500"
                          placeholder="e.g., MBBS, MD, MS"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">Institution *</label>
                        <input
                          type="text"
                          value={qualification?.institution || ''}
                          onChange={(e) => handleArrayNestedInputChange('qualifications', index, 'institution', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg bg-white/10 text-white placeholder-gray-400 border-primary-500"
                          placeholder="e.g., AIIMS, Medical College"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">Year *</label>
                        <input
                          type="number"
                          value={qualification?.year || ''}
                          onChange={(e) => handleArrayNestedInputChange('qualifications', index, 'year', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg bg-white/10 text-white placeholder-gray-400 border-primary-500"
                          placeholder="e.g., 2020"
                          min="1950"
                          max={new Date().getFullYear()}
                        />
                      </div>
                    </div>
                    {(formData.qualifications && formData.qualifications.length > 1) && (
                      <button
                        type="button"
                        onClick={() => {
                          const newQualifications = formData.qualifications.filter((_, i) => i !== index)
                          handleInputChange('qualifications', newQualifications)
                        }}
                        className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove Qualification
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const currentQualifications = formData.qualifications && Array.isArray(formData.qualifications) ? formData.qualifications : []
                    const newQualifications = [...currentQualifications, { degree: '', institution: '', year: '' }]
                    handleInputChange('qualifications', newQualifications)
                  }}
                  className="w-full py-2 border-2 border-dashed border-primary-500 rounded-lg text-accent-300 hover:border-accent-400 hover:text-accent-400 transition-colors"
                >
                  + Add Another Qualification
                </button>
              </div>
              {errors.qualifications && <p className="text-red-400 text-sm mt-2">{errors.qualifications}</p>}
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <FileText className="w-16 h-16 text-accent-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-white">Profile & Bio</h2>
              <p className="text-accent-300">Complete your profile and bio</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Professional Bio *</label>
                <textarea
                  value={formData.professionalBio}
                  onChange={(e) => handleInputChange('professionalBio', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 ${errors.professionalBio ? 'border-red-400' : 'border-primary-500'}`}
                  rows="4"
                  placeholder="Tell patients about your experience, expertise, and approach to healthcare..."
                />
                {errors.professionalBio && <p className="text-red-400 text-sm mt-1">{errors.professionalBio}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Languages Spoken</label>
                <input
                  type="text"
                  value={formData.languages?.join(', ') || ''}
                  onChange={(e) => handleInputChange('languages', e.target.value.split(',').map(lang => lang.trim()))}
                  className="w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 border-primary-500"
                  placeholder="e.g., English, Hindi, Marathi"
                />
              </div>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <Heart className="w-16 h-16 text-accent-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-white">Services & Consultation</h2>
              <p className="text-accent-300">Select your medical services and consultation preferences</p>
            </div>

            {/* Services Provided Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="w-5 h-5 text-accent-400" />
                <h3 className="text-lg font-semibold text-white">Medical Services Offered *</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {servicesOptions.map((service, index) => {
                  const serviceIcons = {
                    'General Consultation': '🩺',
                    'Health Checkup': '💉',
                    'Vaccination': '💉',
                    'Minor Surgery': '🔬',
                    'Diagnostic Tests': '🧪',
                    'Emergency Care': '🚨',
                    'Follow-up Consultation': '📋',
                    'Prescription Refill': '💊',
                    'Health Counseling': '🗣️',
                    'Preventive Care': '🛡️',
                    'Chronic Disease Management': '📊'
                  }
                  
                  const isSelected = formData.servicesProvided?.includes(service) || false
                  
                  return (
                    <div
                      key={service}
                      className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        isSelected ? 'scale-105' : ''
                      }`}
                      onClick={() => {
                        const updatedServices = isSelected
                          ? formData.servicesProvided.filter(s => s !== service)
                          : [...(formData.servicesProvided || []), service]
                        handleInputChange('servicesProvided', updatedServices)
                      }}
                    >
                      <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        isSelected
                          ? 'border-accent-400 bg-accent-500/20 shadow-lg shadow-accent-500/25'
                          : 'border-primary-500/50 bg-white/5 hover:border-accent-400/70 hover:bg-white/10'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <div className={`text-2xl transition-transform duration-300 ${
                            isSelected ? 'scale-110' : 'group-hover:scale-110'
                          }`}>
                            {serviceIcons[service] || '🩺'}
                          </div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium transition-colors duration-300 ${
                              isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'
                            }`}>
                              {service}
                            </span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                            isSelected
                              ? 'border-accent-400 bg-accent-500'
                              : 'border-gray-400 group-hover:border-accent-400'
                          }`}>
                            {isSelected && (
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {errors.servicesProvided && (
                <div className="flex items-center space-x-2 text-red-400 text-sm">
                  <span>⚠️</span>
                  <p>{errors.servicesProvided}</p>
                </div>
              )}
            </div>

            {/* Consultation Options Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="w-5 h-5 text-accent-400" />
                <h3 className="text-lg font-semibold text-white">Consultation Options</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Online Consultation Card */}
                <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                  formData.onlineConsultationAvailable
                    ? 'border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/25'
                    : 'border-primary-500/50 bg-white/5 hover:border-blue-400/70'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">💻</div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">Online Consultation</h4>
                        <p className="text-sm text-gray-300">Video/Audio calls with patients</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.onlineConsultationAvailable || false}
                        onChange={(e) => handleInputChange('onlineConsultationAvailable', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                  
                  {formData.onlineConsultationAvailable && (
                    <div className="space-y-2 text-sm text-blue-200 animate-fadeIn">
                      <div className="flex items-center space-x-2">
                        <span>✓</span>
                        <span>Reach patients anywhere</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>✓</span>
                        <span>Flexible scheduling</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>✓</span>
                        <span>Digital prescriptions</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* In-Person Consultation Card */}
                <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                  formData.offlineConsultationAvailable
                    ? 'border-green-400 bg-green-500/20 shadow-lg shadow-green-500/25'
                    : 'border-primary-500/50 bg-white/5 hover:border-green-400/70'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">🏥</div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">In-Person Consultation</h4>
                        <p className="text-sm text-gray-300">Face-to-face appointments at clinic</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.offlineConsultationAvailable !== false}
                        onChange={(e) => handleInputChange('offlineConsultationAvailable', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                  
                  {formData.offlineConsultationAvailable && (
                    <div className="space-y-2 text-sm text-green-200 animate-fadeIn">
                      <div className="flex items-center space-x-2">
                        <span>✓</span>
                        <span>Physical examination</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>✓</span>
                        <span>Diagnostic procedures</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>✓</span>
                        <span>Personal interaction</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Consultation Summary */}
            {(formData.onlineConsultationAvailable || formData.offlineConsultationAvailable) && (
              <div className="p-6 rounded-xl bg-accent-500/10 border border-accent-500/30">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-xl">📋</span>
                  <h4 className="text-lg font-semibold text-white">Consultation Summary</h4>
                </div>
                <div className="text-accent-200 text-sm">
                  You offer{' '}
                  {formData.onlineConsultationAvailable && formData.offlineConsultationAvailable
                    ? 'both online and in-person consultations'
                    : formData.onlineConsultationAvailable
                    ? 'online consultations only'
                    : 'in-person consultations only'
                  }{' '}
                  with {formData.servicesProvided?.length || 0} medical services selected.
                </div>
              </div>
            )}
          </div>
        )
      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <Building2 className="w-16 h-16 text-accent-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-white">Workplaces & Availability</h2>
              <p className="text-accent-300">Configure your practice locations and working hours</p>
            </div>
            
            <div className="space-y-6">
              {(formData.workplaces && Array.isArray(formData.workplaces) ? formData.workplaces : [{ type: 'hospital', hospital: '', phone: '', address: { street: '', city: '', state: '', zipCode: '', country: 'India' }, consultationFee: '', availableSlots: [{ day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true }] }]).map((workplace, index) => {
                const workplaceIcons = {
                  'hospital': '🏥',
                  'clinic': '🏢', 
                  'other': '📍'
                }
                
                return (
                  <div key={index} className="relative group">
                    {/* Workplace Card */}
                    <div className="p-6 rounded-xl border-2 border-primary-500/50 bg-white/5 hover:border-accent-400/70 hover:bg-white/10 transition-all duration-300">
                      {/* Workplace Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl">{workplaceIcons[workplace.type] || '🏥'}</div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">Workplace {index + 1}</h3>
                            <p className="text-sm text-accent-300 capitalize">{workplace.type} Practice</p>
                          </div>
                        </div>
                        {(formData.workplaces && formData.workplaces.length > 1) && (
                          <button
                            type="button"
                            onClick={() => {
                              const newWorkplaces = formData.workplaces.filter((_, i) => i !== index)
                              handleInputChange('workplaces', newWorkplaces)
                            }}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                            title="Remove Workplace"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Basic Information Section */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h4 className="text-md font-semibold text-white">Basic Information</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">Workplace Type *</label>
                            <select
                              value={workplace.type}
                              onChange={(e) => handleArrayNestedInputChange('workplaces', index, 'type', e.target.value)}
                              className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors ${errors.workplaces && errors.workplaces[index] && errors.workplaces[index].type ? 'border-red-400' : 'border-primary-500/50'}`}
                            >
                              <option value="hospital">Hospital</option>
                              <option value="clinic">Clinic</option>
                              <option value="other">Other</option>
                            </select>
                            {errors.workplaces && errors.workplaces[index] && errors.workplaces[index].type && <p className="text-red-400 text-sm mt-1">{errors.workplaces[index].type}</p>}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">Institution Name *</label>
                            <input
                              type="text"
                              value={workplace.hospital}
                              onChange={(e) => handleArrayNestedInputChange('workplaces', index, 'hospital', e.target.value)}
                              className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors ${errors.workplaces && errors.workplaces[index] && errors.workplaces[index].hospital ? 'border-red-400' : 'border-primary-500/50'}`}
                              placeholder="e.g., Apollo Hospital"
                            />
                            {errors.workplaces && errors.workplaces[index] && errors.workplaces[index].hospital && <p className="text-red-400 text-sm mt-1">{errors.workplaces[index].hospital}</p>}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">Contact Phone *</label>
                            <input
                              type="text"
                              value={workplace.phone}
                              onChange={(e) => handleArrayNestedInputChange('workplaces', index, 'phone', e.target.value)}
                              className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors ${errors.workplaces && errors.workplaces[index] && errors.workplaces[index].phone ? 'border-red-400' : 'border-primary-500/50'}`}
                              placeholder="+91 1234567890"
                            />
                            {errors.workplaces && errors.workplaces[index] && errors.workplaces[index].phone && <p className="text-red-400 text-sm mt-1">{errors.workplaces[index].phone}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Address & Fee Section */}
                      <div className="space-y-6 mt-8">
                        <div className="flex items-center space-x-2 mb-4">
                          <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <h4 className="text-md font-semibold text-white">Address & Consultation Fee</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Address Section */}
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-300">Street Address *</label>
                              <input
                                type="text"
                                value={workplace.address.street}
                                onChange={(e) => handleArrayNestedInputChange('workplaces', index, 'address.street', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors ${errors.workplaces && errors.workplaces[index] && errors.workplaces[index].address && errors.workplaces[index].address.street ? 'border-red-400' : 'border-primary-500/50'}`}
                                placeholder="e.g., 123 Main Street"
                              />
                              {errors.workplaces && errors.workplaces[index] && errors.workplaces[index].address && errors.workplaces[index].address.street && <p className="text-red-400 text-sm mt-1">{errors.workplaces[index].address.street}</p>}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">City *</label>
                                <input
                                  type="text"
                                  value={workplace.address.city}
                                  onChange={(e) => handleArrayNestedInputChange('workplaces', index, 'address.city', e.target.value)}
                                  className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors ${errors.workplaces && errors.workplaces[index] && errors.workplaces[index].address && errors.workplaces[index].address.city ? 'border-red-400' : 'border-primary-500/50'}`}
                                  placeholder="e.g., Mumbai"
                                />
                                {errors.workplaces && errors.workplaces[index] && errors.workplaces[index].address && errors.workplaces[index].address.city && <p className="text-red-400 text-sm mt-1">{errors.workplaces[index].address.city}</p>}
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">State *</label>
                                <input
                                  type="text"
                                  value={workplace.address.state}
                                  onChange={(e) => handleArrayNestedInputChange('workplaces', index, 'address.state', e.target.value)}
                                  className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors ${errors.workplaces && errors.workplaces[index] && errors.workplaces[index].address && errors.workplaces[index].address.state ? 'border-red-400' : 'border-primary-500/50'}`}
                                  placeholder="e.g., Maharashtra"
                                />
                                {errors.workplaces && errors.workplaces[index] && errors.workplaces[index].address && errors.workplaces[index].address.state && <p className="text-red-400 text-sm mt-1">{errors.workplaces[index].address.state}</p>}
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-300">ZIP Code *</label>
                              <input
                                type="text"
                                value={workplace.address.zipCode}
                                onChange={(e) => handleArrayNestedInputChange('workplaces', index, 'address.zipCode', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors ${errors.workplaces && errors.workplaces[index] && errors.workplaces[index].address && errors.workplaces[index].address.zipCode ? 'border-red-400' : 'border-primary-500/50'}`}
                                placeholder="e.g., 400001"
                              />
                              {errors.workplaces && errors.workplaces[index] && errors.workplaces[index].address && errors.workplaces[index].address.zipCode && <p className="text-red-400 text-sm mt-1">{errors.workplaces[index].address.zipCode}</p>}
                            </div>
                          </div>
                          
                          {/* Consultation Fee Card */}
                          <div className="p-6 rounded-xl bg-success-500/10 border border-success-500/30">
                            <div className="flex items-center space-x-2 mb-4">
                              <svg className="w-5 h-5 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <h5 className="text-md font-semibold text-white">Consultation Fee</h5>
                            </div>
                            
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-success-400 text-lg font-semibold">₹</span>
                              </div>
                              <input
                                type="number"
                                value={workplace.consultationFee}
                                onChange={(e) => handleArrayNestedInputChange('workplaces', index, 'consultationFee', e.target.value)}
                                className={`w-full pl-8 pr-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-success-500 focus:border-success-500 transition-colors ${errors.workplaces && errors.workplaces[index] && errors.workplaces[index].consultationFee ? 'border-red-400' : 'border-success-500/50'}`}
                                placeholder="500"
                              />
                            </div>
                            {errors.workplaces && errors.workplaces[index] && errors.workplaces[index].consultationFee && <p className="text-red-400 text-sm mt-1">{errors.workplaces[index].consultationFee}</p>}
                            
                            <p className="text-success-200 text-sm mt-2">
                              Fee charged per consultation at this location
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Weekly Schedule Section */}
                      <div className="space-y-6 mt-8">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h4 className="text-md font-semibold text-white">Weekly Schedule</h4>
                          </div>
                          
                          {/* Quick Action Buttons */}
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                const weekdaySlots = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => ({
                                  day, startTime: '09:00', endTime: '17:00', isAvailable: true
                                }))
                                handleArrayNestedInputChange('workplaces', index, 'availableSlots', weekdaySlots)
                              }}
                              className="px-3 py-1 text-xs bg-accent-500/20 text-accent-300 rounded-lg hover:bg-accent-500/30 transition-colors"
                            >
                              Weekdays
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const allDaySlots = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => ({
                                  day, startTime: '09:00', endTime: '17:00', isAvailable: true
                                }))
                                handleArrayNestedInputChange('workplaces', index, 'availableSlots', allDaySlots)
                              }}
                              className="px-3 py-1 text-xs bg-accent-500/20 text-accent-300 rounded-lg hover:bg-accent-500/30 transition-colors"
                            >
                              All Days
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                            const daySlot = workplace?.availableSlots?.find(slot => slot.day === day) || { day, startTime: '09:00', endTime: '17:00', isAvailable: false }
                            const dayIcons = {
                              'monday': '🌟',
                              'tuesday': '💼',
                              'wednesday': '⚡',
                              'thursday': '🎯',
                              'friday': '🚀',
                              'saturday': '🌅',
                              'sunday': '☀️'
                            }
                            
                            return (
                              <div key={day} className={`flex items-center space-x-4 p-4 rounded-lg border transition-all duration-300 ${
                                daySlot.isAvailable 
                                  ? 'bg-accent-500/10 border-accent-500/30' 
                                  : 'bg-white/5 border-primary-500/30'
                              }`}>
                                <div className="flex items-center min-w-[140px]">
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={daySlot.isAvailable}
                                      onChange={(e) => {
                                        const newSlots = workplace?.availableSlots ? [...workplace.availableSlots] : []
                                        const existingIndex = newSlots.findIndex(slot => slot.day === day)
                                        
                                        if (existingIndex >= 0) {
                                          newSlots[existingIndex] = { ...newSlots[existingIndex], isAvailable: e.target.checked }
                                        } else {
                                          newSlots.push({ day, startTime: '09:00', endTime: '17:00', isAvailable: e.target.checked })
                                        }
                                        
                                        handleArrayNestedInputChange('workplaces', index, 'availableSlots', newSlots)
                                      }}
                                      className="sr-only peer"
                                    />
                                    <div className={`relative w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                      daySlot.isAvailable
                                        ? 'border-accent-400 bg-accent-500'
                                        : 'border-gray-400 hover:border-accent-400'
                                    }`}>
                                      {daySlot.isAvailable && (
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                      )}
                                    </div>
                                  </label>
                                  <div className="ml-3 flex items-center space-x-2">
                                    <span className="text-lg">{dayIcons[day]}</span>
                                    <span className={`text-sm font-medium capitalize transition-colors ${
                                      daySlot.isAvailable ? 'text-white' : 'text-gray-400'
                                    }`}>
                                      {day}
                                    </span>
                                  </div>
                                </div>
                                
                                {daySlot.isAvailable && (
                                  <div className="flex items-center space-x-3 flex-1 animate-fadeIn">
                                    <input
                                      type="time"
                                      value={daySlot.startTime}
                                      onChange={(e) => {
                                        const newSlots = workplace?.availableSlots ? [...workplace.availableSlots] : []
                                        const existingIndex = newSlots.findIndex(slot => slot.day === day)
                                        
                                        if (existingIndex >= 0) {
                                          newSlots[existingIndex] = { ...newSlots[existingIndex], startTime: e.target.value }
                                        } else {
                                          newSlots.push({ day, startTime: e.target.value, endTime: '17:00', isAvailable: true })
                                        }
                                        
                                        handleArrayNestedInputChange('workplaces', index, 'availableSlots', newSlots)
                                      }}
                                      className="px-3 py-2 border border-accent-500/50 rounded-lg bg-white/10 text-white text-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                                    />
                                    <span className="text-accent-300 text-sm">to</span>
                                    <input
                                      type="time"
                                      value={daySlot.endTime}
                                      onChange={(e) => {
                                        const newSlots = workplace?.availableSlots ? [...workplace.availableSlots] : []
                                        const existingIndex = newSlots.findIndex(slot => slot.day === day)
                                        
                                        if (existingIndex >= 0) {
                                          newSlots[existingIndex] = { ...newSlots[existingIndex], endTime: e.target.value }
                                        } else {
                                          newSlots.push({ day, startTime: '09:00', endTime: e.target.value, isAvailable: true })
                                        }
                                        
                                        handleArrayNestedInputChange('workplaces', index, 'availableSlots', newSlots)
                                      }}
                                      className="px-3 py-2 border border-accent-500/50 rounded-lg bg-white/10 text-white text-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                                    />
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {/* Add Another Workplace Button */}
              <button
                type="button"
                onClick={() => {
                  const currentWorkplaces = formData.workplaces && Array.isArray(formData.workplaces) ? formData.workplaces : []
                  const newWorkplaces = [...currentWorkplaces, { type: 'hospital', hospital: '', phone: '', address: { street: '', city: '', state: '', zipCode: '', country: 'India' }, consultationFee: '', availableSlots: [{ day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true }] }]
                  handleInputChange('workplaces', newWorkplaces)
                }}
                className="w-full py-4 border-2 border-dashed border-accent-400/50 rounded-xl text-accent-300 hover:border-accent-400 hover:text-accent-200 hover:bg-accent-500/5 transition-all duration-300 flex items-center justify-center space-x-2 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-medium">Add Another Workplace</span>
              </button>
            </div>
          </div>
        )
      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Heart className="w-16 h-16 text-accent-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-white">Emergency Contact & Address</h2>
              <p className="text-accent-300">Add your emergency contact and address details</p>
            </div>
            
            {/* Emergency Contact Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-white">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Name *</label>
                  <input
                    type="text"
                    value={formData.emergencyContact.name}
                    onChange={(e) => handleNestedInputChange('emergencyContact', 'name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 ${errors.emergencyContact && errors.emergencyContact.name ? 'border-red-400' : 'border-primary-500'}`}
                    placeholder="e.g., John Doe"
                  />
                  {errors.emergencyContact && errors.emergencyContact.name && <p className="text-red-400 text-sm mt-1">{errors.emergencyContact.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Relationship *</label>
                  <select
                    value={formData.emergencyContact.relationship}
                    onChange={(e) => handleNestedInputChange('emergencyContact', 'relationship', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 ${errors.emergencyContact && errors.emergencyContact.relationship ? 'border-red-400' : 'border-primary-500'}`}
                  >
                    <option value="" className="text-gray-800">Select Relationship</option>
                    {relationshipOptions.map(relationship => (
                      <option key={relationship} value={relationship} className="text-gray-800">{relationship}</option>
                    ))}
                  </select>
                  {errors.emergencyContact && errors.emergencyContact.relationship && <p className="text-red-400 text-sm mt-1">{errors.emergencyContact.relationship}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Phone *</label>
                  <input
                    type="text"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => handleNestedInputChange('emergencyContact', 'phone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 ${errors.emergencyContact && errors.emergencyContact.phone ? 'border-red-400' : 'border-primary-500'}`}
                    placeholder="+91 1234567890"
                  />
                  {errors.emergencyContact && errors.emergencyContact.phone && <p className="text-red-400 text-sm mt-1">{errors.emergencyContact.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Email</label>
                  <input
                    type="email"
                    value={formData.emergencyContact.email}
                    onChange={(e) => handleNestedInputChange('emergencyContact', 'email', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 border-primary-500"
                    placeholder="john.doe@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Address Information</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Street Address *</label>
                  <input
                    type="text"
                    value={formData.address.street || ''}
                    onChange={(e) => handleNestedInputChange('address', 'street', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 ${errors.address && errors.address.street ? 'border-red-400' : 'border-primary-500'}`}
                    placeholder="e.g., 123 Main Street, Apartment 4B"
                  />
                  {errors.address && errors.address.street && <p className="text-red-400 text-sm mt-1">{errors.address.street}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">City *</label>
                    <input
                      type="text"
                      value={formData.address.city || ''}
                      onChange={(e) => handleNestedInputChange('address', 'city', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 ${errors.address && errors.address.city ? 'border-red-400' : 'border-primary-500'}`}
                      placeholder="e.g., Mumbai"
                    />
                    {errors.address && errors.address.city && <p className="text-red-400 text-sm mt-1">{errors.address.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">State *</label>
                    <input
                      type="text"
                      value={formData.address.state || ''}
                      onChange={(e) => handleNestedInputChange('address', 'state', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 ${errors.address && errors.address.state ? 'border-red-400' : 'border-primary-500'}`}
                      placeholder="e.g., Maharashtra"
                    />
                    {errors.address && errors.address.state && <p className="text-red-400 text-sm mt-1">{errors.address.state}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">ZIP Code *</label>
                    <input
                      type="text"
                      value={formData.address.zipCode || ''}
                      onChange={(e) => handleNestedInputChange('address', 'zipCode', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 ${errors.address && errors.address.zipCode ? 'border-red-400' : 'border-primary-500'}`}
                      placeholder="e.g., 400001"
                    />
                    {errors.address && errors.address.zipCode && <p className="text-red-400 text-sm mt-1">{errors.address.zipCode}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Country</label>
                    <input
                      type="text"
                      value={formData.address.country || 'India'}
                      onChange={(e) => handleNestedInputChange('address', 'country', e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-gray-400 border-primary-500"
                      placeholder="e.g., India"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return <div>Step {currentStep} content</div>
    }
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
          <p className="text-white">Loading your profile data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-accent-300">Welcome, Dr. {user?.firstName}! Set up your profile for patient bookings.</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-white">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-accent-300">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-primary-700 rounded-full h-2">
            <div className="bg-accent-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 mb-8 border border-white/20">
          {renderStepContent()}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 1 
                ? 'bg-primary-600 text-primary-300 cursor-not-allowed' 
                : 'bg-primary-700 text-white hover:bg-primary-600'
            }`}
          >
            Previous
          </button>

          {currentStep < totalSteps ? (
            <button 
              onClick={handleNext} 
              className="px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 flex items-center font-medium transition-colors"
            >
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 flex items-center disabled:opacity-50 font-medium transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Completing...
                </>
              ) : (
                <>
                  Complete Setup <Save className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorProfileSetup