import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { doctorsAPI } from '../../services/api'
import { toast } from 'react-hot-toast'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Stethoscope, 
  GraduationCap, 
  DollarSign, 
  Clock, 
  Edit, 
  Save, 
  X, 
  ArrowLeft,
  Plus,
  Trash2,
  Building2,
  Award,
  Globe,
  Camera,
  Heart,
  Shield,
  Users
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const DoctorProfile = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    specialization: '',
    licenseNumber: '',
    medicalRegistrationNumber: '',
    experience: '',
    professionalBio: '',
    profileImage: '',
    profileImageFile: null,
    languages: [],
    servicesProvided: [],
    onlineConsultationAvailable: true,
    offlineConsultationAvailable: true,
    workplaces: [],
    qualifications: [],
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    }
  })
  const [errors, setErrors] = useState({})

  const servicesOptions = [
    'General Consultation', 'Vaccination', 'Health Checkup', 'Emergency Care',
    'Diagnostic Tests', 'Prescription Refill', 'Follow-up Consultation',
    'Specialist Referral', 'Medical Certificates', 'Chronic Disease Management',
    'Preventive Care', 'Mental Health Support'
  ]

  // Helper function to convert 24-hour time to 12-hour format with AM/PM
  const formatTime = (time24) => {
    if (!time24) return ''
    
    const [hours, minutes] = time24.split(':')
    const hour24 = parseInt(hours, 10)
    const minute = minutes || '00'
    
    if (hour24 === 0) {
      return `12:${minute} AM`
    } else if (hour24 < 12) {
      return `${hour24}:${minute} AM`
    } else if (hour24 === 12) {
      return `12:${minute} PM`
    } else {
      return `${hour24 - 12}:${minute} PM`
    }
  }

  // Helper function to format time range for display
  const formatTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return ''
    return `${formatTime(startTime)} - ${formatTime(endTime)}`
  }

  // Load doctor profile data
  const loadProfile = async () => {
    try {
      console.log('🔄 Loading profile data...')
      setIsLoading(true)
      const response = await doctorsAPI.getDoctor(user._id)
      
      console.log('📥 Profile response:', response)
      
      if (response.data.status === 'success') {
        const doctor = response.data.data.doctor
        console.log('✅ Raw doctor data from backend:', doctor)
        console.log('✅ Doctor workplaces:', doctor.workplaces)
        console.log('✅ Doctor servicesProvided:', doctor.servicesProvided)
        console.log('✅ Doctor professionalBio:', doctor.professionalBio)
        console.log('✅ Doctor medicalRegistrationNumber:', doctor.medicalRegistrationNumber)
        console.log('✅ Doctor experience:', doctor.experience)
        
        // Debug missing fields specifically
        console.log('🔍 MISSING FIELDS DEBUG:', {
          medicalRegistrationNumber: {
            exists: !!doctor.medicalRegistrationNumber,
            value: doctor.medicalRegistrationNumber
          },
          experience: {
            exists: !!doctor.experience,
            value: doctor.experience
          },
          professionalBio: {
            exists: !!doctor.professionalBio,
            value: doctor.professionalBio
          },
          servicesProvided: {
            exists: doctor.servicesProvided?.length > 0,
            count: doctor.servicesProvided?.length,
            values: doctor.servicesProvided
          },
          workplaces: {
            exists: doctor.workplaces?.length > 0,
            count: doctor.workplaces?.length,
            hospitalNames: doctor.workplaces?.map(w => w.hospital?.name || w.hospital)
          }
        })
        
        setProfileData(doctor)
        
        // Update form data with loaded profile data
        setFormData({
          firstName: doctor.firstName || '',
          lastName: doctor.lastName || '',
          email: doctor.email || '',
          phone: doctor.phone || '',
          dateOfBirth: doctor.dateOfBirth ? new Date(doctor.dateOfBirth).toISOString().split('T')[0] : '',
          gender: doctor.gender || '',
          specialization: doctor.specialization || '',
          licenseNumber: doctor.licenseNumber || '',
          medicalRegistrationNumber: doctor.medicalRegistrationNumber || '',
          experience: doctor.experience || '',
          professionalBio: doctor.professionalBio || doctor.bio || '',
          profileImage: doctor.profileImage || '',
          profileImageFile: null,
          languages: doctor.languages || ['English'],
          servicesProvided: doctor.servicesProvided || [],
          onlineConsultationAvailable: doctor.onlineConsultationAvailable !== false,
          offlineConsultationAvailable: doctor.offlineConsultationAvailable !== false,
          workplaces: (doctor.workplaces || []).map(workplace => ({
            ...workplace,
            hospital: workplace.hospital?.name || workplace.hospital || '',
            consultationFee: workplace.consultationFee || 0,
            phone: workplace.phone || '',
            availableSlots: workplace.availableSlots && workplace.availableSlots.length > 0 
              ? workplace.availableSlots 
              : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => ({
                  day,
                  startTime: '09:00',
                  endTime: '17:00',
                  isAvailable: false
                }))
          })),
          qualifications: doctor.qualifications || [],
          emergencyContact: {
            name: doctor.emergencyContact?.name || '',
            relationship: doctor.emergencyContact?.relationship || '',
            phone: doctor.emergencyContact?.phone || '',
            email: doctor.emergencyContact?.email || ''
          },
          address: {
            street: doctor.address?.street || '',
            city: doctor.address?.city || '',
            state: doctor.address?.state || '',
            zipCode: doctor.address?.zipCode || '',
            country: doctor.address?.country || 'India'
          }
        })
        
        console.log(' Form data after loading:', {
          medicalRegistrationNumber: doctor.medicalRegistrationNumber || '',
          experience: doctor.experience || '',
          professionalBio: doctor.professionalBio || doctor.bio || '',
          servicesProvided: doctor.servicesProvided || [],
          workplaces: doctor.workplaces || [],
          // Verify all critical fields are loaded
          allFieldsLoaded: {
            medicalRegistrationNumber: !!doctor.medicalRegistrationNumber,
            experience: !!doctor.experience,
            professionalBio: !!(doctor.professionalBio || doctor.bio),
            servicesProvided: (doctor.servicesProvided || []).length > 0,
            workplaces: (doctor.workplaces || []).length > 0
          }
        })
      } else {
        console.error('Failed to load profile data:', response.data.message)
        toast.error('Failed to load profile data')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?._id) {
      loadProfile()
    }
  }, [user])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }))
  }

  const handleArrayNestedInputChange = (field, index, nestedField, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => 
        i === index ? { ...item, [nestedField]: value } : item
      )
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          profileImage: e.target.result,
          profileImageFile: file
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Toggle service selection
  const toggleService = (service) => {
    console.log('🔄 Toggling service:', service)
    setFormData(prev => {
      const currentServices = prev.servicesProvided || []
      const isSelected = currentServices.includes(service)
      
      let newServices
      if (isSelected) {
        // Remove service
        newServices = currentServices.filter(s => s !== service)
        console.log('➖ Removed service:', service)
      } else {
        // Add service
        newServices = [...currentServices, service]
        console.log('➕ Added service:', service)
      }
      
      console.log('📋 Updated services list:', newServices)
      return {
        ...prev,
        servicesProvided: newServices
      }
    })
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (!formData.specialization) newErrors.specialization = 'Specialization is required'
    // Only require license number during initial setup
    if (!formData.licenseNumber.trim() && !profileData?.profileSetupCompleted) {
      newErrors.licenseNumber = 'License number is required'
    }
    // Only require medical registration number during initial setup
    if (!formData.medicalRegistrationNumber.trim() && !profileData?.profileSetupCompleted) {
      newErrors.medicalRegistrationNumber = 'Medical registration number is required'
    }
    if (!formData.professionalBio.trim()) newErrors.professionalBio = 'Professional bio is required'
    if (!formData.experience.trim()) newErrors.experience = 'Experience is required'
    
    if (formData.qualifications.length === 0) {
      newErrors.qualifications = 'At least one qualification is required'
    }
    
    if (formData.workplaces.length === 0) {
      newErrors.workplaces = 'At least one workplace is required'
    }
    
    if (formData.servicesProvided.length === 0) {
      newErrors.servicesProvided = 'At least one service must be selected'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('🔄 Form submission started')
    console.log('📋 Current form data:', {
      firstName: formData.firstName,
      lastName: formData.lastName,
      experience: formData.experience,
      professionalBio: formData.professionalBio,
      servicesProvided: formData.servicesProvided,
      workplacesCount: formData.workplaces.length
    })
    
    // Prevent duplicate submissions
    if (loading) {
      console.log('⚠️ Profile update already in progress, ignoring duplicate submission')
      return
    }
    
    // Validate form
    if (!validateForm()) {
      console.log('❌ Form validation failed:', errors)
      toast.error('Please fix the validation errors before submitting')
      return
    }
    
    setLoading(true)
    setErrors({})
    
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
      submitData.append('offlineConsultationAvailable', formData.offlineConsultationAvailable !== false)
      
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

      console.log('� Submitting profile update...')
      console.log('🔍 Key fields being submitted:', {
        experience: formData.experience,
        professionalBio: formData.professionalBio?.substring(0, 50) + '...',
        servicesProvided: formData.servicesProvided,
        workplacesCount: formData.workplaces.length
      })
      
      // Make the API call
      console.log('📡 Making profile update API call...')
      const response = await doctorsAPI.updateProfile(submitData)
      console.log('✅ Profile update response:', response)
      
      // Check response status
      if (response?.data?.status === 'success') {
        console.log('✅ Profile updated successfully')
        toast.success('Profile updated successfully!')
        setIsEditing(false)
        
        // Refresh profile data to show updated information
        console.log('🔄 Refreshing profile data after update...')
        try {
          await loadProfile()
          console.log('✅ Profile data refreshed successfully')
        } catch (loadError) {
          console.error('❌ Error refreshing profile data:', loadError)
          toast.warning('Profile updated but failed to refresh display. Please reload the page.')
        }
      } else {
        console.error('❌ Profile update failed:', response?.data)
        toast.error(response?.data?.message || 'Failed to update profile. Please try again.')
      }
      
    } catch (error) {
      console.error('❌ Profile update error:', error)
      
      // Handle different types of errors with specific messages
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.error('Request timeout. Please check your connection and try again.')
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        toast.error('Network error. Please check your internet connection and server status.')
      } else if (error.response?.status === 413) {
        toast.error('File too large. Please use a smaller image.')
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.')
      } else if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.')
      } else if (error.response?.status === 403) {
        toast.error('Access denied. You do not have permission to update this profile.')
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        // Handle validation errors
        const errorMessages = error.response.data.errors.join(', ')
        toast.error(`Validation errors: ${errorMessages}`)
      } else {
        toast.error('Failed to update profile. Please try again.')
      }
      
      // Keep editing mode open so user can try again
      setIsEditing(true)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = () => {
    // Initialize form data with current profile data when entering edit mode
    if (profileData) {
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: profileData.gender || '',
        specialization: profileData.specialization || '',
        licenseNumber: profileData.licenseNumber || '',
        medicalRegistrationNumber: profileData.medicalRegistrationNumber || '',
        experience: profileData.experience || '',
        professionalBio: profileData.professionalBio || profileData.bio || '',
        profileImage: profileData.profileImage || '',
        profileImageFile: null,
        languages: profileData.languages || ['English'],
        servicesProvided: profileData.servicesProvided || [],
        onlineConsultationAvailable: profileData.onlineConsultationAvailable !== false,
        offlineConsultationAvailable: profileData.offlineConsultationAvailable !== false,
        workplaces: (profileData.workplaces || []).map(workplace => ({
          ...workplace,
          hospital: workplace.hospital?.name || workplace.hospital || '',
          consultationFee: workplace.consultationFee || 0,
          phone: workplace.phone || '',
          availableSlots: workplace.availableSlots && workplace.availableSlots.length > 0 
            ? workplace.availableSlots 
            : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => ({
                day,
                startTime: '09:00',
                endTime: '17:00',
                isAvailable: false
              }))
        })),
        qualifications: profileData.qualifications || [],
        emergencyContact: {
          name: profileData.emergencyContact?.name || '',
          relationship: profileData.emergencyContact?.relationship || '',
          phone: profileData.emergencyContact?.phone || '',
          email: profileData.emergencyContact?.email || ''
        },
        address: {
          street: profileData.address?.street || '',
          city: profileData.address?.city || '',
          state: profileData.address?.state || '',
          zipCode: profileData.address?.zipCode || '',
          country: profileData.address?.country || 'India'
        }
      })
      
      console.log('🔄 Form initialized for editing with profile data:', {
        workplaces: profileData.workplaces?.length || 0,
        availabilitySlots: profileData.workplaces?.map(w => w.availableSlots?.length || 0),
        fullWorkplaces: JSON.stringify(profileData.workplaces, null, 2)
      })
      
      // Debug each workplace being initialized
      console.log('🏥 INITIALIZING WORKPLACES FOR EDIT MODE:')
      profileData.workplaces?.forEach((workplace, index) => {
        console.log(`Original Workplace ${index + 1}:`, {
          hospital: workplace.hospital?.name || workplace.hospital,
          consultationFee: workplace.consultationFee,
          availableSlots: workplace.availableSlots,
          availableSlotsCount: workplace.availableSlots?.length || 0
        })
        
        const processedWorkplace = {
          ...workplace,
          hospital: workplace.hospital?.name || workplace.hospital || '',
          consultationFee: workplace.consultationFee || 0,
          phone: workplace.phone || '',
          availableSlots: workplace.availableSlots && workplace.availableSlots.length > 0 
            ? workplace.availableSlots 
            : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => ({
                day,
                startTime: '09:00',
                endTime: '17:00',
                isAvailable: false
              }))
        }
        
        console.log(`Processed Workplace ${index + 1}:`, {
          hospital: processedWorkplace.hospital,
          consultationFee: processedWorkplace.consultationFee,
          availableSlots: processedWorkplace.availableSlots,
          availableSlotsCount: processedWorkplace.availableSlots?.length || 0
        })
      })
    }
    setIsEditing(true)
  }

  if (isLoading && !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
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
            className="flex items-center text-white hover:text-success-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center space-x-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 space-y-8">
          {/* Profile Header */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-green-400 to-blue-500 p-1">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  {formData.profileImage ? (
                    <img
                      src={formData.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-success-600 text-white p-2 rounded-full cursor-pointer hover:bg-success-700 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mt-4">
              Dr. {profileData?.firstName} {profileData?.lastName}
            </h1>
            <p className="text-success-400 text-lg">{profileData?.specialization}</p>
          </div>

          {/* Personal Information Section */}
          <div className="bg-white/5 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    placeholder="Enter first name"
                  />
                ) : (
                  <p className="text-white">{profileData?.firstName || 'Not provided'}</p>
                )}
                {errors.firstName && <p className="text-error-400 text-sm mt-1">{errors.firstName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Last Name *</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    placeholder="Enter last name"
                  />
                ) : (
                  <p className="text-white">{profileData?.lastName || 'Not provided'}</p>
                )}
                {errors.lastName && <p className="text-error-400 text-sm mt-1">{errors.lastName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <p className="text-white flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {profileData?.email}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone *</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-white flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {profileData?.phone || 'Not provided'}
                  </p>
                )}
                {errors.phone && <p className="text-error-400 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white"
                  />
                ) : (
                  <p className="text-white flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {profileData?.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                {isEditing ? (
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="text-white capitalize">{profileData?.gender || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white/5 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Stethoscope className="w-5 h-5 mr-2" />
              Professional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Specialization *</label>
                {isEditing ? (
                  <select
                    value={formData.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">Select specialization</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="Gynecology">Gynecology</option>
                    <option value="ENT">ENT</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                  </select>
                ) : (
                  <p className="text-white">{profileData?.specialization || 'Not provided'}</p>
                )}
                {errors.specialization && <p className="text-error-400 text-sm mt-1">{errors.specialization}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  License Number {!profileData?.profileSetupCompleted && '*'}
                  {profileData?.profileSetupCompleted && (
                    <span className="text-xs text-warning-400 ml-2">(Cannot be edited after setup)</span>
                  )}
                </label>
                {isEditing && !profileData?.profileSetupCompleted ? (
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    placeholder="Enter license number (optional)"
                  />
                ) : (
                  <p className="text-white">{profileData?.licenseNumber || 'Not provided'}</p>
                )}
                {errors.licenseNumber && <p className="text-error-400 text-sm mt-1">{errors.licenseNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Medical Registration Number *
                  {profileData?.profileSetupCompleted && (
                    <span className="text-xs text-warning-400 ml-2">(Cannot be edited after setup)</span>
                  )}
                </label>
                {isEditing && !profileData?.profileSetupCompleted ? (
                  <input
                    type="text"
                    value={formData.medicalRegistrationNumber}
                    onChange={(e) => handleInputChange('medicalRegistrationNumber', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    placeholder="Enter registration number (required)"
                  />
                ) : (
                  <p className="text-white">{profileData?.medicalRegistrationNumber || 'Not provided'}</p>
                )}
                {errors.medicalRegistrationNumber && <p className="text-error-400 text-sm mt-1">{errors.medicalRegistrationNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Experience (Years) *</label>
                {isEditing ? (
                  <div>
                    <input
                      type="number"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 ${
                        errors.experience ? 'border-red-400' : 'border-gray-600'
                      }`}
                      placeholder="e.g., 5"
                      min="0"
                      max="50"
                      required
                    />
                    {errors.experience && <p className="text-red-400 text-sm mt-1">{errors.experience}</p>}
                  </div>
                ) : (
                  <p className="text-white">{profileData?.experience ? `${profileData.experience} years` : 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Professional Bio *</label>
              {isEditing ? (
                <textarea
                  value={formData.professionalBio}
                  onChange={(e) => handleInputChange('professionalBio', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                  placeholder="Tell us about your professional background and expertise..."
                  rows="4"
                />
              ) : (
                <p className="text-white">{profileData?.professionalBio || profileData?.bio || 'Not provided'}</p>
              )}
              {errors.professionalBio && <p className="text-error-400 text-sm mt-1">{errors.professionalBio}</p>}
            </div>
          </div>

          {/* Qualifications */}
          <div className="bg-white/5 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2" />
              Qualifications *
            </h2>
            {isEditing ? (
              <div className="space-y-4">
                {formData.qualifications.map((qualification, index) => (
                  <div key={index} className="border border-gray-600 rounded-lg p-4 bg-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={qualification.degree || ''}
                        onChange={(e) => handleArrayNestedInputChange('qualifications', index, 'degree', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                        placeholder="e.g., MBBS, MD, MS"
                      />
                      <input
                        type="text"
                        value={qualification.institution || ''}
                        onChange={(e) => handleArrayNestedInputChange('qualifications', index, 'institution', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                        placeholder="e.g., AIIMS, Medical College"
                      />
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={qualification.year || ''}
                          onChange={(e) => handleArrayNestedInputChange('qualifications', index, 'year', e.target.value)}
                          className="flex-1 px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                          placeholder="Year"
                          min="1950"
                          max={new Date().getFullYear()}
                        />
                        {formData.qualifications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newQualifications = formData.qualifications.filter((_, i) => i !== index)
                              handleInputChange('qualifications', newQualifications)
                            }}
                            className="px-3 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newQualifications = [...formData.qualifications, { degree: '', institution: '', year: '' }]
                    handleInputChange('qualifications', newQualifications)
                  }}
                  className="w-full py-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-300 hover:border-success-500 hover:text-success-400"
                >
                  + Add Qualification
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {profileData?.qualifications?.length > 0 ? (
                  profileData.qualifications.map((qualification, index) => (
                    <div key={index} className="text-white">
                      <span className="font-medium">{qualification.degree}</span> from{' '}
                      <span className="text-success-400">{qualification.institution}</span> ({qualification.year})
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No qualifications added</p>
                )}
              </div>
            )}
            {errors.qualifications && <p className="text-error-400 text-sm mt-1">{errors.qualifications}</p>}
          </div>

          {/* Services Provided */}
          <div className="bg-white/5 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Services Provided *
            </h2>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {servicesOptions.map(service => (
                  <label
                    key={service}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                      formData.servicesProvided.includes(service)
                        ? 'border-success-500 bg-success-500/20 text-success-300'
                        : 'border-gray-600 bg-white/5 hover:border-success-400'
                    }`}
                    onClick={() => toggleService(service)}
                  >
                    <input
                      type="checkbox"
                      checked={formData.servicesProvided.includes(service)}
                      onChange={() => toggleService(service)}
                      className="w-4 h-4 text-success-600 border-gray-300 rounded focus:ring-success-500 mr-3"
                    />
                    <span className="text-sm font-medium text-white">{service}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profileData?.servicesProvided?.length > 0 ? (
                  profileData.servicesProvided.map((service, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-success-500/20 text-success-300 rounded-full text-sm"
                    >
                      {service}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400">No services selected</p>
                )}
              </div>
            )}
            {errors.servicesProvided && <p className="text-error-400 text-sm mt-1">{errors.servicesProvided}</p>}
          </div>

          {/* Consultation Options */}
          <div className="bg-white/5 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Consultation Options
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Online Consultation</label>
                {isEditing ? (
                  <select
                    value={formData.onlineConsultationAvailable}
                    onChange={(e) => handleInputChange('onlineConsultationAvailable', e.target.value === 'true')}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="true">Available</option>
                    <option value="false">Not Available</option>
                  </select>
                ) : (
                  <p className="text-white">
                    {profileData?.onlineConsultationAvailable !== false ? 'Available' : 'Not Available'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Offline Consultation</label>
                {isEditing ? (
                  <select
                    value={formData.offlineConsultationAvailable}
                    onChange={(e) => handleInputChange('offlineConsultationAvailable', e.target.value === 'true')}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="true">Available</option>
                    <option value="false">Not Available</option>
                  </select>
                ) : (
                  <p className="text-white">
                    {profileData?.offlineConsultationAvailable !== false ? 'Available' : 'Not Available'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Workplaces */}
          <div className="bg-white/5 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Workplaces & Availability *
            </h2>
            {isEditing ? (
              <div className="space-y-4">
                {formData.workplaces.map((workplace, index) => (
                  <div key={index} className="border border-gray-600 rounded-lg p-6 bg-white/5 space-y-4">
                    {/* Workplace Type Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Workplace Type *</label>
                      <select
                        value={workplace.type || 'hospital'}
                        onChange={(e) => handleArrayNestedInputChange('workplaces', index, 'type', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                      >
                        <option value="hospital">Hospital</option>
                        <option value="clinic">Clinic</option>
                        <option value="lab">Laboratory</option>
                        <option value="diagnostic_center">Diagnostic Center</option>
                        <option value="nursing_home">Nursing Home</option>
                        <option value="medical_center">Medical Center</option>
                        <option value="polyclinic">Polyclinic</option>
                        <option value="specialty_center">Specialty Center</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Workplace Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {workplace.type === 'hospital' ? 'Hospital Name' : 
                           workplace.type === 'clinic' ? 'Clinic Name' :
                           workplace.type === 'lab' ? 'Laboratory Name' :
                           workplace.type === 'diagnostic_center' ? 'Diagnostic Center Name' :
                           workplace.type === 'nursing_home' ? 'Nursing Home Name' :
                           workplace.type === 'medical_center' ? 'Medical Center Name' :
                           workplace.type === 'polyclinic' ? 'Polyclinic Name' :
                           workplace.type === 'specialty_center' ? 'Specialty Center Name' :
                           'Workplace Name'} *
                        </label>
                        <input
                          type="text"
                          value={typeof workplace?.hospital === 'object' ? workplace?.hospital?.name || '' : workplace?.hospital || ''}
                          onChange={(e) => handleArrayNestedInputChange('workplaces', index, 'hospital', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                          placeholder={`e.g., ${workplace.type === 'hospital' ? 'Apollo Hospital' : 
                                              workplace.type === 'clinic' ? 'City Medical Clinic' :
                                              workplace.type === 'lab' ? 'PathLab Diagnostics' :
                                              workplace.type === 'diagnostic_center' ? 'Advanced Imaging Center' :
                                              workplace.type === 'nursing_home' ? 'Care Plus Nursing Home' :
                                              workplace.type === 'medical_center' ? 'Metro Medical Center' :
                                              workplace.type === 'polyclinic' ? 'Family Polyclinic' :
                                              workplace.type === 'specialty_center' ? 'Heart Care Center' :
                                              'Your Workplace Name'}`}
                        />
                      </div>
                      {/* Phone Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
                        <input
                          type="tel"
                          value={workplace.phone || ''}
                          onChange={(e) => handleArrayNestedInputChange('workplaces', index, 'phone', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                          placeholder="e.g., +91 98765 43210"
                        />
                      </div>
                      {/* Consultation Fee */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Consultation Fee (₹) *</label>
                        <input
                          type="number"
                          value={workplace.consultationFee || ''}
                          onChange={(e) => handleArrayNestedInputChange('workplaces', index, 'consultationFee', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                          placeholder="e.g., 500"
                        />
                      </div>
                    </div>

                    {/* Complete Address Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">Complete Address *</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Street Address */}
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            value={workplace.address?.street || ''}
                            onChange={(e) => {
                              const newAddress = { ...workplace.address, street: e.target.value };
                              handleArrayNestedInputChange('workplaces', index, 'address', newAddress);
                            }}
                            className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                            placeholder="Street Address (e.g., 123 Main Street, Sector 5)"
                          />
                        </div>
                        {/* City */}
                        <div>
                          <input
                            type="text"
                            value={workplace.address?.city || ''}
                            onChange={(e) => {
                              const newAddress = { ...workplace.address, city: e.target.value };
                              handleArrayNestedInputChange('workplaces', index, 'address', newAddress);
                            }}
                            className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                            placeholder="City (e.g., Kolkata)"
                          />
                        </div>
                        {/* State */}
                        <div>
                          <input
                            type="text"
                            value={workplace.address?.state || ''}
                            onChange={(e) => {
                              const newAddress = { ...workplace.address, state: e.target.value };
                              handleArrayNestedInputChange('workplaces', index, 'address', newAddress);
                            }}
                            className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                            placeholder="State (e.g., West Bengal)"
                          />
                        </div>
                        {/* ZIP Code */}
                        <div>
                          <input
                            type="text"
                            value={workplace.address?.zipCode || ''}
                            onChange={(e) => {
                              const newAddress = { ...workplace.address, zipCode: e.target.value };
                              handleArrayNestedInputChange('workplaces', index, 'address', newAddress);
                            }}
                            className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                            placeholder="ZIP Code (e.g., 700001)"
                          />
                        </div>
                        {/* Country */}
                        <div>
                          <input
                            type="text"
                            value={workplace.address?.country || 'India'}
                            onChange={(e) => {
                              const newAddress = { ...workplace.address, country: e.target.value };
                              handleArrayNestedInputChange('workplaces', index, 'address', newAddress);
                            }}
                            className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                            placeholder="Country (e.g., India)"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Available Days and Time Slots */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-300 mb-3">Available Days & Working Hours</label>
                      <div className="space-y-3">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                          const currentWorkplace = isEditing ? formData.workplaces?.[index] : workplace;
                          console.log('🕒 Debug availability for', day, ':', JSON.stringify(currentWorkplace?.availableSlots, null, 2));
                          
                          const daySlot = currentWorkplace?.availableSlots?.find(slot => slot.day === day) || { day, startTime: '09:00', endTime: '17:00', isAvailable: false }
                          
                          console.log('🔍 Edit mode - formData.workplaces[', index, ']:', JSON.stringify(formData.workplaces?.[index], null, 2));
                          
                          return (
                            <div key={day} className="flex items-center space-x-4 p-3 bg-white/10 rounded-lg border border-gray-600">
                              <div className="flex items-center min-w-[120px]">
                                <input
                                  type="checkbox"
                                  checked={daySlot.isAvailable}
                                  onChange={(e) => {
                                    console.log(`🔄 Checkbox changed for ${day}:`, {
                                      checked: e.target.checked,
                                      currentDaySlot: daySlot,
                                      workplaceIndex: index,
                                      currentWorkplace: currentWorkplace
                                    });
                                    
                                    const newSlots = currentWorkplace?.availableSlots ? [...currentWorkplace.availableSlots] : []
                                    const existingIndex = newSlots.findIndex(slot => slot.day === day)
                                    
                                    if (existingIndex >= 0) {
                                      newSlots[existingIndex] = { ...newSlots[existingIndex], isAvailable: e.target.checked }
                                    } else {
                                      newSlots.push({ day, startTime: '09:00', endTime: '17:00', isAvailable: e.target.checked })
                                    }
                                    
                                    console.log(`📝 Updated slots for workplace ${index}:`, newSlots);
                                    
                                    if (isEditing) {
                                      handleArrayNestedInputChange('workplaces', index, 'availableSlots', newSlots)
                                      
                                      // Log the updated form data
                                      setTimeout(() => {
                                        console.log(`✅ Form data after checkbox update:`, {
                                          workplaceIndex: index,
                                          updatedWorkplace: formData.workplaces[index],
                                          allWorkplaces: formData.workplaces.map((w, i) => ({
                                            index: i,
                                            hospital: w.hospital,
                                            availableSlotsCount: w.availableSlots?.length || 0,
                                            availableDays: w.availableSlots?.filter(s => s.isAvailable).map(s => s.day) || []
                                          }))
                                        });
                                      }, 100);
                                    }
                                  }}
                                  className="w-4 h-4 text-success-600 border-gray-300 rounded focus:ring-success-500 mr-2"
                                />
                                <span className="text-sm font-medium capitalize text-white">{day}</span>
                              </div>
                              
                              {daySlot.isAvailable ? (
                                <div className="flex items-center space-x-2 flex-1">
                                  <input
                                    type="time"
                                    value={daySlot.startTime || '09:00'}
                                    onChange={(e) => {
                                      const newSlots = currentWorkplace?.availableSlots ? [...currentWorkplace.availableSlots] : []
                                      const existingIndex = newSlots.findIndex(slot => slot.day === day)
                                      
                                      if (existingIndex >= 0) {
                                        newSlots[existingIndex] = { ...newSlots[existingIndex], startTime: e.target.value }
                                      } else {
                                        newSlots.push({ day, startTime: e.target.value, endTime: '17:00', isAvailable: true })
                                      }
                                      
                                      if (isEditing) {
                                        handleArrayNestedInputChange('workplaces', index, 'availableSlots', newSlots)
                                      }
                                    }}
                                    className="px-3 py-2 bg-white/10 border border-gray-600 rounded-md text-sm text-white"
                                  />
                                  <span className="text-gray-300">to</span>
                                  <input
                                    type="time"
                                    value={daySlot.endTime || '17:00'}
                                    onChange={(e) => {
                                      const newSlots = currentWorkplace?.availableSlots ? [...currentWorkplace.availableSlots] : []
                                      const existingIndex = newSlots.findIndex(slot => slot.day === day)
                                      
                                      if (existingIndex >= 0) {
                                        newSlots[existingIndex] = { ...newSlots[existingIndex], endTime: e.target.value }
                                      } else {
                                        newSlots.push({ day, startTime: '09:00', endTime: e.target.value, isAvailable: true })
                                      }
                                      
                                      if (isEditing) {
                                        handleArrayNestedInputChange('workplaces', index, 'availableSlots', newSlots)
                                      }
                                    }}
                                    className="px-3 py-2 bg-white/10 border border-gray-600 rounded-md text-sm text-white"
                                  />
                                </div>
                              ) : null}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {formData.workplaces.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newWorkplaces = formData.workplaces.filter((_, i) => i !== index)
                          handleInputChange('workplaces', newWorkplaces)
                        }}
                        className="mt-4 text-error-400 hover:text-error-300 text-sm font-medium"
                      >
                        Remove Workplace
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newWorkplaces = [...formData.workplaces, { 
                      type: 'hospital',
                      hospital: '', 
                      phone: '',
                      consultationFee: '', 
                      address: {
                        street: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        country: 'India'
                      },
                      availableSlots: [
                        { day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: false },
                        { day: 'tuesday', startTime: '09:00', endTime: '17:00', isAvailable: false },
                        { day: 'wednesday', startTime: '09:00', endTime: '17:00', isAvailable: false },
                        { day: 'thursday', startTime: '09:00', endTime: '17:00', isAvailable: false },
                        { day: 'friday', startTime: '09:00', endTime: '17:00', isAvailable: false },
                        { day: 'saturday', startTime: '09:00', endTime: '17:00', isAvailable: false },
                        { day: 'sunday', startTime: '09:00', endTime: '17:00', isAvailable: false }
                      ]
                    }]
                    handleInputChange('workplaces', newWorkplaces)
                  }}
                  className="w-full py-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-300 hover:border-success-500 hover:text-success-400"
                >
                  + Add Another Workplace
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {profileData?.workplaces?.length > 0 ? (
                  profileData.workplaces.map((workplace, index) => (
                    <div key={index} className="border border-gray-600 rounded-lg p-4 bg-white/5">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-medium text-white">
                              {typeof workplace.hospital === 'object' ? workplace.hospital?.name : workplace.hospital}
                            </h3>
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full capitalize">
                              {workplace.type || 'hospital'}
                            </span>
                          </div>
                          {/* Display phone number if available */}
                          {workplace.phone && (
                            <div className="text-sm text-gray-400 mb-1">
                              📞 {workplace.phone}
                            </div>
                          )}
                          {/* Display workplace address if available */}
                          {workplace.address && (workplace.address.street || workplace.address.city) && (
                            <div className="text-sm text-gray-400 mb-2">
                              📍 {workplace.address.street && `${workplace.address.street}, `}
                              {workplace.address.city && `${workplace.address.city}`}
                              {workplace.address.state && `, ${workplace.address.state}`}
                              {workplace.address.zipCode && ` - ${workplace.address.zipCode}`}
                            </div>
                          )}
                          {/* Fallback to hospital address if workplace address not available */}
                          {(!workplace.address || (!workplace.address.street && !workplace.address.city)) && 
                           typeof workplace.hospital === 'object' && workplace.hospital?.address && (
                            <div className="text-sm text-gray-400 mb-2">
                              📍 {workplace.hospital.address.street}, {workplace.hospital.address.city}
                            </div>
                          )}
                        </div>
                        <span className="text-success-400 font-medium">₹{workplace.consultationFee}</span>
                      </div>
                      <div className="text-sm text-gray-300">
                        Available: {(() => {
                          console.log('🕒 Workplace availability slots:', workplace.availableSlots);
                          
                          // Enhanced debugging to see exact slot values
                          if (workplace.availableSlots && workplace.availableSlots.length > 0) {
                            workplace.availableSlots.forEach((slot, index) => {
                              console.log(`Slot ${index + 1}: ${slot.day} - Available: ${slot.isAvailable} (type: ${typeof slot.isAvailable}) (${slot.startTime}-${slot.endTime})`);
                            });
                          }
                          
                          if (!workplace.availableSlots || workplace.availableSlots.length === 0) {
                            return 'No availability set';
                          }
                          
                          // Filter for only available days since backend now preserves all slots
                          const availableSlots = workplace.availableSlots
                            .filter(slot => slot.isAvailable === true)
                            .map(slot => {
                              const day = slot.day ? slot.day.charAt(0).toUpperCase() + slot.day.slice(1) : 'Unknown';
                              const timeRange = formatTimeRange(slot.startTime, slot.endTime);
                              return `${day} (${timeRange})`;
                            });
                          
                          console.log('🎯 Filtered available slots:', availableSlots);
                          return availableSlots.length > 0 ? availableSlots.join(', ') : 'No availability set';
                        })()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No workplaces added</p>
                )}
              </div>
            )}
            {errors.workplaces && <p className="text-error-400 text-sm mt-1">{errors.workplaces}</p>}
          </div>

          {/* Emergency Contact */}
          <div className="bg-white/5 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Emergency Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contact Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.emergencyContact.name}
                    onChange={(e) => handleNestedInputChange('emergencyContact', 'name', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    placeholder="Enter contact name"
                  />
                ) : (
                  <p className="text-white">{profileData?.emergencyContact?.name || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Relationship</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.emergencyContact.relationship}
                    onChange={(e) => handleNestedInputChange('emergencyContact', 'relationship', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    placeholder="e.g., Spouse, Parent, Sibling"
                  />
                ) : (
                  <p className="text-white">{profileData?.emergencyContact?.relationship || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => handleNestedInputChange('emergencyContact', 'phone', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-white">{profileData?.emergencyContact?.phone || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email (Optional)</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.emergencyContact.email}
                    onChange={(e) => handleNestedInputChange('emergencyContact', 'email', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    placeholder="Enter email address"
                  />
                ) : (
                  <p className="text-white">{profileData?.emergencyContact?.email || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white/5 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Address Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Street Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => handleNestedInputChange('address', 'street', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    placeholder="Enter street address"
                  />
                ) : (
                  <p className="text-white">{profileData?.address?.street || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleNestedInputChange('address', 'city', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    placeholder="Enter city"
                  />
                ) : (
                  <p className="text-white">{profileData?.address?.city || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleNestedInputChange('address', 'state', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    placeholder="Enter state"
                  />
                ) : (
                  <p className="text-white">{profileData?.address?.state || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">ZIP Code</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) => handleNestedInputChange('address', 'zipCode', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    placeholder="Enter ZIP code"
                  />
                ) : (
                  <p className="text-white">{profileData?.address?.zipCode || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) => handleNestedInputChange('address', 'country', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    placeholder="Enter country"
                  />
                ) : (
                  <p className="text-white">{profileData?.address?.country || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile
