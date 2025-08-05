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
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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

  // Load doctor profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true)
        const response = await doctorsAPI.getDoctor(user._id)
        
        if (response.data.status === 'success') {
          const doctor = response.data.data.doctor
          setProfileData(doctor)
          
          // Pre-fill form with current data
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
            experience: doctor.experience?.toString() || '',
            professionalBio: doctor.professionalBio || doctor.bio || '',
            profileImage: doctor.profileImage || '',
            profileImageFile: null,
            languages: doctor.languages || ['English'],
            servicesProvided: doctor.servicesProvided || [],
            onlineConsultationAvailable: doctor.onlineConsultationAvailable !== false,
            offlineConsultationAvailable: doctor.offlineConsultationAvailable !== false,
            workplaces: doctor.workplaces || [],
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
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        toast.error('Failed to load profile data')
      } finally {
        setIsLoading(false)
      }
    }

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

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (!formData.specialization) newErrors.specialization = 'Specialization is required'
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required'
    if (!formData.professionalBio.trim()) newErrors.professionalBio = 'Professional bio is required'
    
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsLoading(true)

      // Create FormData for file upload
      const submitData = new FormData()

      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'profileImage' && formData[key] instanceof File) {
          submitData.append('profileImage', formData[key])
        } else if (typeof formData[key] === 'object' && formData[key] !== null) {
          submitData.append(key, JSON.stringify(formData[key]))
        } else if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key])
        }
      })

      console.log(' Submitting profile update data...')
      
      // Use updateProfile instead of completeProfileSetup
      const response = await doctorsAPI.updateProfile(submitData)
      
      console.log(' Profile update response:', response.data)

      toast.success('Profile updated successfully!')
      setIsEditing(false)
      
      // Refresh profile data
      const response2 = await doctorsAPI.getDoctor(user._id)
      if (response2.data.status === 'success') {
        setProfileData(response2.data.data.doctor)
        await updateUser()
      }
      
    } catch (error) {
      console.error(' Profile update error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to update profile'
      toast.error(errorMessage)
      setErrors({ submit: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/doctor/dashboard')}
            className="flex items-center text-white hover:text-green-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center space-x-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
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
                <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mt-4">
              Dr. {profileData?.firstName} {profileData?.lastName}
            </h1>
            <p className="text-green-400 text-lg">{profileData?.specialization}</p>
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
                {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
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
                {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
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
                {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
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
                {errors.specialization && <p className="text-red-400 text-sm mt-1">{errors.specialization}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">License Number *</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    placeholder="Enter license number"
                  />
                ) : (
                  <p className="text-white">{profileData?.licenseNumber || 'Not provided'}</p>
                )}
                {errors.licenseNumber && <p className="text-red-400 text-sm mt-1">{errors.licenseNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Medical Registration Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.medicalRegistrationNumber}
                    onChange={(e) => handleInputChange('medicalRegistrationNumber', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    placeholder="Enter registration number"
                  />
                ) : (
                  <p className="text-white">{profileData?.medicalRegistrationNumber || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Experience (Years)</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    placeholder="Enter years of experience"
                    min="0"
                  />
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
              {errors.professionalBio && <p className="text-red-400 text-sm mt-1">{errors.professionalBio}</p>}
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
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
                  className="w-full py-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-300 hover:border-green-500 hover:text-green-400"
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
                      <span className="text-green-400">{qualification.institution}</span> ({qualification.year})
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No qualifications added</p>
                )}
              </div>
            )}
            {errors.qualifications && <p className="text-red-400 text-sm mt-1">{errors.qualifications}</p>}
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
                        ? 'border-green-500 bg-green-500/20 text-green-300'
                        : 'border-gray-600 bg-white/5 hover:border-green-400'
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
                      className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm"
                    >
                      {service}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400">No services selected</p>
                )}
              </div>
            )}
            {errors.servicesProvided && <p className="text-red-400 text-sm mt-1">{errors.servicesProvided}</p>}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Hospital *</label>
                        <input
                          type="text"
                          value={workplace?.hospital || ''}
                          onChange={(e) => handleArrayNestedInputChange('workplaces', index, 'hospital', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                          placeholder="e.g., Apollo Hospital"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Consultation Fee *</label>
                        <input
                          type="number"
                          value={workplace?.consultationFee || ''}
                          onChange={(e) => handleArrayNestedInputChange('workplaces', index, 'consultationFee', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                          placeholder="e.g., 500"
                        />
                      </div>
                    </div>

                    {/* Available Days and Time Slots */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-300 mb-3">Available Days & Working Hours</label>
                      <div className="space-y-3">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                          const daySlot = workplace?.availableSlots?.find(slot => slot.day === day) || { day, startTime: '09:00', endTime: '17:00', isAvailable: false }
                          return (
                            <div key={day} className="flex items-center space-x-4 p-3 bg-white/10 rounded-lg border border-gray-600">
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
                                <span className="text-sm font-medium capitalize text-white">{day}</span>
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
                                    className="px-3 py-2 bg-white/10 border border-gray-600 rounded-md text-sm text-white"
                                  />
                                  <span className="text-gray-300">to</span>
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
                                    className="px-3 py-2 bg-white/10 border border-gray-600 rounded-md text-sm text-white"
                                  />
                                </div>
                              )}
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
                        className="mt-4 text-red-400 hover:text-red-300 text-sm font-medium"
                      >
                        Remove Workplace
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newWorkplaces = [...formData.workplaces, { hospital: '', consultationFee: '', availableSlots: [{ day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true }] }]
                    handleInputChange('workplaces', newWorkplaces)
                  }}
                  className="w-full py-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-300 hover:border-green-500 hover:text-green-400"
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
                        <h3 className="text-lg font-medium text-white">{workplace.hospital}</h3>
                        <span className="text-green-400 font-medium">₹{workplace.consultationFee}</span>
                      </div>
                      <div className="text-sm text-gray-300">
                        Available: {workplace.availableSlots?.filter(slot => slot.isAvailable).map(slot => 
                          `${slot.day.charAt(0).toUpperCase() + slot.day.slice(1)} (${slot.startTime}-${slot.endTime})`
                        ).join(', ') || 'No availability set'}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No workplaces added</p>
                )}
              </div>
            )}
            {errors.workplaces && <p className="text-red-400 text-sm mt-1">{errors.workplaces}</p>}
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
