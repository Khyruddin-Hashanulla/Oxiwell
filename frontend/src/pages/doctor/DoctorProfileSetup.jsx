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
  const { user, updateUser, isLoading: authLoading } = useAuth()
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
      hospital: '',
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
    const loadDoctorData = async () => {
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

        // Add a small delay to ensure token is properly set
        await new Promise(resolve => setTimeout(resolve, 500))

        console.log('Loading doctor data for user:', user._id)
        const response = await doctorsAPI.getDoctor(user._id)
        
        console.log(' Full API response:', response)
        console.log(' Response status:', response?.status)
        console.log(' Response data:', response?.data)
        console.log(' Doctor data:', response?.data?.doctor)
        console.log(' Response data keys:', response?.data ? Object.keys(response.data) : 'No data')
        console.log(' Response data structure:', JSON.stringify(response?.data, null, 2))
        
        // Check if response and data exist
        if (!response?.data?.doctor) {
          console.error(' No doctor data received from API')
          console.error(' Response structure:', {
            hasResponse: !!response,
            hasData: !!response?.data,
            hasDoctor: !!response?.data?.doctor,
            responseKeys: response ? Object.keys(response) : 'No response',
            dataKeys: response?.data ? Object.keys(response.data) : 'No data'
          })
          
          // Try to use fallback data from auth context
          if (user) {
            console.log(' Using fallback data from auth context:', user)
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
              offlineConsultationAvailable: user.offlineConsultationAvailable || true,
              workplaces: user.workplaces || [],
              emergencyContact: user.emergencyContact || {},
              address: user.address || {}
            }
            
            setFormData(fallbackData)
            toast.success('Profile data loaded from session')
          } else {
            toast.error('Failed to load profile data - no data available')
          }
          
          setDataLoading(false)
          return
        }

        const doctorData = response.data.doctor
        console.log('Doctor data loaded successfully:', doctorData)
        
        // Safely prefill form with existing data using optional chaining
        setFormData(prev => ({
          ...prev,
          firstName: doctorData.firstName || user.firstName || '',
          lastName: doctorData.lastName || user.lastName || '',
          email: doctorData.email || user.email || '',
          phone: doctorData.phone || user.phone || '',
          gender: doctorData.gender || user.gender || '',
          dateOfBirth: doctorData.dateOfBirth ? new Date(doctorData.dateOfBirth).toISOString().split('T')[0] : '',
          specialization: doctorData.specialization || user.specialization || '',
          licenseNumber: doctorData.licenseNumber || user.licenseNumber || '',
          medicalRegistrationNumber: doctorData.medicalRegistrationNumber || user.medicalRegistrationNumber || '',
          experience: doctorData.experience || user.experience || '',
          qualifications: (doctorData.qualifications && doctorData.qualifications.length > 0) ? doctorData.qualifications : [{ degree: '', institution: '', year: '' }],
          professionalBio: doctorData.professionalBio || '',
          languages: (doctorData.languages && doctorData.languages.length > 0) ? doctorData.languages : ['English'],
          servicesProvided: doctorData.servicesProvided || [],
          onlineConsultationAvailable: doctorData.onlineConsultationAvailable || false,
          offlineConsultationAvailable: doctorData.offlineConsultationAvailable !== false,
          workplaces: (doctorData.workplaces && doctorData.workplaces.length > 0) ? doctorData.workplaces : [{
            hospital: '',
            consultationFee: '',
            availableSlots: [{ day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true }]
          }],
          emergencyContact: doctorData.emergencyContact || {
            name: '',
            relationship: '',
            phone: '',
            email: ''
          },
          address: doctorData.address || { 
            street: '', 
            city: '', 
            state: '', 
            zipCode: '', 
            country: 'India' 
          },
          profileImagePreview: doctorData.profileImage || ''
        }))
      } catch (error) {
        console.error('Error loading doctor data:', error)
        
        // Handle different types of errors
        if (error.response?.status === 401) {
          toast.error('Authentication failed. Please log in again.')
        } else if (error.response?.status === 404) {
          toast.error('Doctor profile not found')
        } else if (error.response?.status >= 500) {
          toast.error('Server error. Please try again later.')
        } else {
          toast.error('Failed to load profile data. Using default values.')
        }

        // Set default values if API call fails
        setFormData(prev => ({
          ...prev,
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          phone: user?.phone || '',
          gender: user?.gender || '',
          specialization: user?.specialization || '',
          licenseNumber: user?.licenseNumber || '',
          medicalRegistrationNumber: user?.medicalRegistrationNumber || '',
          experience: user?.experience || '',
        }))
      } finally {
        setDataLoading(false)
      }
    }

    // Only load data if we have a user and auth is not loading
    if (user?._id && !authLoading) {
      loadDoctorData()
    } else if (!authLoading && !user?._id) {
      console.log('No user available after auth completion, skipping data load')
      setDataLoading(false)
    }
  }, [user, authLoading])

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
      newArray[index] = {
        ...newArray[index],
        [childField]: value
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
      if (!formData.specialization || !formData.licenseNumber || !formData.medicalRegistrationNumber) {
        newErrors.specialization = 'Specialization is required'
        newErrors.licenseNumber = 'License number is required'
        newErrors.medicalRegistrationNumber = 'Medical registration number is required'
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
          if (!workplace.hospital || !workplace.consultationFee) {
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
      
      await doctorsAPI.completeProfileSetup(submitData)
      toast.success('Profile setup completed!')
      await updateUser()
      navigate('/doctor/dashboard')
    } catch (error) {
      console.error('❌ Profile setup error:', error)
      toast.error('Failed to complete setup')
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
              <User className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Personal Information</h2>
              <p className="text-gray-600">Complete your personal details</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="John"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Doe"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="john.doe@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone *</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="+91 1234567890"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Stethoscope className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Professional Information</h2>
              <p className="text-gray-600">Complete your professional details</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Specialization *</label>
                <select
                  value={formData.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.specialization ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Specialization</option>
                  {specializations.map(specialization => (
                    <option key={specialization} value={specialization}>{specialization}</option>
                  ))}
                </select>
                {errors.specialization && <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">License Number *</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.licenseNumber ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., 123456"
                />
                {errors.licenseNumber && <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Medical Registration Number *</label>
                <input
                  type="text"
                  value={formData.medicalRegistrationNumber}
                  onChange={(e) => handleInputChange('medicalRegistrationNumber', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.medicalRegistrationNumber ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., 123456"
                />
                {errors.medicalRegistrationNumber && <p className="text-red-500 text-sm mt-1">{errors.medicalRegistrationNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Years of Experience</label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg border-gray-300"
                  placeholder="e.g., 5"
                  min="0"
                />
              </div>
            </div>

            {/* Qualifications Section */}
            <div className="mt-8">
              <label className="block text-sm font-medium mb-4">Qualifications *</label>
              <div className="space-y-4">
                {(formData.qualifications && Array.isArray(formData.qualifications) ? formData.qualifications : [{ degree: '', institution: '', year: '' }]).map((qualification, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Degree *</label>
                        <input
                          type="text"
                          value={qualification?.degree || ''}
                          onChange={(e) => handleArrayNestedInputChange('qualifications', index, 'degree', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg border-gray-300"
                          placeholder="e.g., MBBS, MD, MS"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Institution *</label>
                        <input
                          type="text"
                          value={qualification?.institution || ''}
                          onChange={(e) => handleArrayNestedInputChange('qualifications', index, 'institution', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg border-gray-300"
                          placeholder="e.g., AIIMS, Medical College"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Year *</label>
                        <input
                          type="number"
                          value={qualification?.year || ''}
                          onChange={(e) => handleArrayNestedInputChange('qualifications', index, 'year', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg border-gray-300"
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
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600"
                >
                  + Add Another Qualification
                </button>
              </div>
              {errors.qualifications && <p className="text-red-500 text-sm mt-2">{errors.qualifications}</p>}
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <FileText className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Profile & Bio</h2>
              <p className="text-gray-600">Complete your profile and bio</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Professional Bio *</label>
                <textarea
                  value={formData.professionalBio}
                  onChange={(e) => handleInputChange('professionalBio', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.professionalBio ? 'border-red-500' : 'border-gray-300'}`}
                  rows="3"
                  placeholder="Brief description of your expertise and approach..."
                />
                {errors.professionalBio && <p className="text-red-500 text-sm mt-1">{errors.professionalBio}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Profile Image</label>
                <input
                  type="file"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 border rounded-lg border-gray-300"
                />
                {formData.profileImagePreview && (
                  <img src={formData.profileImagePreview} alt="Profile Image" className="w-24 h-24 rounded-full mt-4" />
                )}
              </div>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Globe className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Services & Consultation</h2>
              <p className="text-gray-600">Select your services and consultation options</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-4">Services Provided *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {servicesOptions.map(service => (
                    <label
                      key={service}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                        formData.servicesProvided.includes(service)
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 bg-white hover:border-green-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.servicesProvided.includes(service)}
                        onChange={(e) => {
                          const updatedServices = e.target.checked
                            ? [...formData.servicesProvided, service]
                            : formData.servicesProvided.filter(s => s !== service)
                          handleInputChange('servicesProvided', updatedServices)
                        }}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mr-3"
                      />
                      <span className="text-sm font-medium">{service}</span>
                    </label>
                  ))}
                </div>
                {errors.servicesProvided && <p className="text-red-500 text-sm mt-2">{errors.servicesProvided}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Online Consultation Available</label>
                  <select
                    value={formData.onlineConsultationAvailable}
                    onChange={(e) => handleInputChange('onlineConsultationAvailable', e.target.value === 'true')}
                    className="w-full px-4 py-3 border rounded-lg border-gray-300"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Building2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Workplaces & Availability</h2>
              <p className="text-gray-600">Add your workplaces and availability</p>
            </div>
            <div className="space-y-4">
              {(formData.workplaces && Array.isArray(formData.workplaces) ? formData.workplaces : [{ hospital: '', consultationFee: '', availableSlots: [{ day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true }] }]).map((workplace, index) => (
                <div key={index} className="border rounded-lg p-6 bg-gray-50 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Hospital *</label>
                      <input
                        type="text"
                        value={workplace?.hospital || ''}
                        onChange={(e) => handleArrayNestedInputChange('workplaces', index, 'hospital', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg ${errors.workplaces && errors.workplaces[index] && errors.workplaces[index].hospital ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="e.g., Apollo Hospital"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Consultation Fee *</label>
                      <input
                        type="number"
                        value={workplace?.consultationFee || ''}
                        onChange={(e) => handleArrayNestedInputChange('workplaces', index, 'consultationFee', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg ${errors.workplaces && errors.workplaces[index] && errors.workplaces[index].consultationFee ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="e.g., 500"
                      />
                    </div>
                  </div>

                  {/* Available Days and Time Slots */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-3">Available Days & Working Hours</label>
                    <div className="space-y-3">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                        const daySlot = workplace?.availableSlots?.find(slot => slot.day === day) || { day, startTime: '09:00', endTime: '17:00', isAvailable: false }
                        return (
                          <div key={day} className="flex items-center space-x-4 p-3 bg-white rounded-lg border">
                            <div className="flex items-center min-w-[120px]">
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
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mr-2"
                              />
                              <span className="text-sm font-medium capitalize">{day}</span>
                            </div>
                            
                            {daySlot.isAvailable && (
                              <div className="flex items-center space-x-2 flex-1">
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
                                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                                <span className="text-gray-500">to</span>
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
                                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {(formData.workplaces && formData.workplaces.length > 1) && (
                    <button
                      type="button"
                      onClick={() => {
                        const newWorkplaces = formData.workplaces.filter((_, i) => i !== index)
                        handleInputChange('workplaces', newWorkplaces)
                      }}
                      className="mt-4 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove Workplace
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const currentWorkplaces = formData.workplaces && Array.isArray(formData.workplaces) ? formData.workplaces : []
                  const newWorkplaces = [...currentWorkplaces, { hospital: '', consultationFee: '', availableSlots: [{ day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true }] }]
                  handleInputChange('workplaces', newWorkplaces)
                }}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600"
              >
                + Add Another Workplace
              </button>
            </div>
          </div>
        )
      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Heart className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Emergency Contact & Address</h2>
              <p className="text-gray-600">Add your emergency contact and address details</p>
            </div>
            
            {/* Emergency Contact Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.emergencyContact.name}
                    onChange={(e) => handleNestedInputChange('emergencyContact', 'name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg ${errors.emergencyContact && errors.emergencyContact.name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., John Doe"
                  />
                  {errors.emergencyContact && errors.emergencyContact.name && <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Relationship *</label>
                  <select
                    value={formData.emergencyContact.relationship}
                    onChange={(e) => handleNestedInputChange('emergencyContact', 'relationship', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg ${errors.emergencyContact && errors.emergencyContact.relationship ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Relationship</option>
                    {relationshipOptions.map(relationship => (
                      <option key={relationship} value={relationship}>{relationship}</option>
                    ))}
                  </select>
                  {errors.emergencyContact && errors.emergencyContact.relationship && <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.relationship}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone *</label>
                  <input
                    type="text"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => handleNestedInputChange('emergencyContact', 'phone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg ${errors.emergencyContact && errors.emergencyContact.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="+91 1234567890"
                  />
                  {errors.emergencyContact && errors.emergencyContact.phone && <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.emergencyContact.email}
                    onChange={(e) => handleNestedInputChange('emergencyContact', 'email', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg border-gray-300"
                    placeholder="john.doe@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Address Information</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Street Address *</label>
                  <input
                    type="text"
                    value={formData.address.street || ''}
                    onChange={(e) => handleNestedInputChange('address', 'street', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg ${errors.address && errors.address.street ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., 123 Main Street, Apartment 4B"
                  />
                  {errors.address && errors.address.street && <p className="text-red-500 text-sm mt-1">{errors.address.street}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <input
                      type="text"
                      value={formData.address.city || ''}
                      onChange={(e) => handleNestedInputChange('address', 'city', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg ${errors.address && errors.address.city ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="e.g., Mumbai"
                    />
                    {errors.address && errors.address.city && <p className="text-red-500 text-sm mt-1">{errors.address.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State *</label>
                    <input
                      type="text"
                      value={formData.address.state || ''}
                      onChange={(e) => handleNestedInputChange('address', 'state', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg ${errors.address && errors.address.state ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="e.g., Maharashtra"
                    />
                    {errors.address && errors.address.state && <p className="text-red-500 text-sm mt-1">{errors.address.state}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">ZIP Code *</label>
                    <input
                      type="text"
                      value={formData.address.zipCode || ''}
                      onChange={(e) => handleNestedInputChange('address', 'zipCode', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg ${errors.address && errors.address.zipCode ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="e.g., 400001"
                    />
                    {errors.address && errors.address.zipCode && <p className="text-red-500 text-sm mt-1">{errors.address.zipCode}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Country</label>
                    <input
                      type="text"
                      value={formData.address.country || 'India'}
                      onChange={(e) => handleNestedInputChange('address', 'country', e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg border-gray-300"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white">Loading your profile data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-gray-300">Welcome, Dr. {user?.firstName}! Set up your profile for patient bookings.</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-white">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-300">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
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
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            Previous
          </button>

          {currentStep < totalSteps ? (
            <button 
              onClick={handleNext} 
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center font-medium transition-colors"
            >
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50 font-medium transition-colors"
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
