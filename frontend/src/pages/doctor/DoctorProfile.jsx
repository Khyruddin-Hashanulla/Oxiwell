import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
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
  Building,
  Award
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const DoctorProfile = () => {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control
  } = useForm()

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: "workplaces", // unique name for your Field Array
  })

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
          reset({
            firstName: doctor.firstName || '',
            lastName: doctor.lastName || '',
            email: doctor.email || '',
            phone: doctor.phone || '',
            dateOfBirth: doctor.dateOfBirth ? new Date(doctor.dateOfBirth).toISOString().split('T')[0] : '',
            gender: doctor.gender || '',
            address: typeof doctor.address === 'string' 
              ? doctor.address 
              : doctor.address 
                ? `${doctor.address.street || ''} ${doctor.address.city || ''} ${doctor.address.state || ''} ${doctor.address.country || ''}`.trim()
                : '',
            specialization: doctor.specialization || '',
            experience: doctor.experience?.toString() || '',
            qualifications: doctor.qualifications?.map(q => `${q.degree} from ${q.institution} (${q.year})`).join(', ') || '',
            consultationFee: doctor.consultationFee?.toString() || '',
            bio: doctor.bio || '',
            availableHours: doctor.availableHours || '',
            location: doctor.location || '',
            licenseNumber: doctor.licenseNumber || '', // Added missing license number field
            workplaces: doctor.workplaces || []
          })

          // Initialize workplaces field array
          if (doctor.workplaces && doctor.workplaces.length > 0) {
            doctor.workplaces.forEach((workplace, index) => {
              if (index === 0) {
                // Replace the first field
                setValue(`workplaces.0`, workplace)
              } else {
                // Append additional workplaces
                append(workplace)
              }
            })
          }
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
  }, [user, reset])

  // Function to handle edit mode toggle and ensure form is properly populated
  const handleEditToggle = () => {
    if (!isEditing && profileData) {
      // When entering edit mode, re-populate the form with current data
      reset({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: profileData.gender || '',
        address: typeof profileData.address === 'string' 
          ? profileData.address 
          : profileData.address 
            ? `${profileData.address.street || ''} ${profileData.address.city || ''} ${profileData.address.state || ''} ${profileData.address.country || ''}`.trim()
            : '',
        specialization: profileData.specialization || '',
        experience: profileData.experience?.toString() || '',
        qualifications: profileData.qualifications?.map(q => `${q.degree} from ${q.institution} (${q.year})`).join(', ') || '',
        consultationFee: profileData.consultationFee?.toString() || '',
        bio: profileData.bio || '',
        availableHours: profileData.availableHours || '',
        location: profileData.location || '',
        licenseNumber: profileData.licenseNumber || '', // Added missing license number field
        workplaces: profileData.workplaces || []
      })
    }
    setIsEditing(!isEditing)
  }

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      
      // Validate required fields before sending
      if (!data.firstName || data.firstName.trim().length < 2) {
        toast.error('First name must be at least 2 characters')
        setIsLoading(false)
        return
      }
      if (!data.lastName || data.lastName.trim().length < 2) {
        toast.error('Last name must be at least 2 characters')
        setIsLoading(false)
        return
      }
      if (!data.specialization || data.specialization.trim().length < 2) {
        toast.error('Please select a specialization')
        setIsLoading(false)
        return
      }
      
      // Format data for backend
      const updateData = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        phone: data.phone ? data.phone.trim() : undefined, // Only send if provided
        specialization: data.specialization.trim(),
        experience: data.experience ? parseInt(data.experience) : 0,
        consultationFee: data.consultationFee ? parseFloat(data.consultationFee) : 0,
        bio: data.bio ? data.bio.trim() : '',
        availableHours: data.availableHours ? data.availableHours.trim() : '',
        location: data.location ? data.location.trim() : '',
        address: data.address ? data.address.trim() : '', // Added missing address field
        licenseNumber: data.licenseNumber ? data.licenseNumber.trim() : '', // Added missing license number field
        // Convert qualifications from comma-separated string to array of objects
        qualifications: data.qualifications 
          ? data.qualifications.split(',').map(item => {
              const trimmed = item.trim()
              if (!trimmed) return null
              
              // Try to parse format like "MBBS from XYZ University (2020)"
              const match = trimmed.match(/^(.+?)\s+from\s+(.+?)\s*\((\d{4})\)$/)
              if (match) {
                return {
                  degree: match[1].trim(),
                  institution: match[2].trim(),
                  year: parseInt(match[3])
                }
              } else {
                // Fallback for simple format
                return {
                  degree: trimmed,
                  institution: 'Not specified',
                  year: new Date().getFullYear()
                }
              }
            }).filter(item => item !== null)
          : [],
        // Convert workplaces to availableSlots format for backend compatibility
        availableSlots: data.workplaces && data.workplaces.length > 0 
          ? data.workplaces.flatMap(workplace => 
              workplace.schedule ? workplace.schedule
                .filter(slot => slot.isAvailable && slot.startTime && slot.endTime)
                .map(slot => ({
                  day: slot.day.toLowerCase(),
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  location: workplace.name || 'Main clinic'
                }))
              : []
            )
          : []
      }

      // Remove only undefined fields, keep empty strings as they represent intentional clearing
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key]
        }
      })

      console.log('🔍 Doctor profile update data:', updateData)
      console.log('🔍 Location being sent:', updateData.location)
      console.log('🔍 Address being sent:', updateData.address)
      console.log('🔍 Bio being sent:', updateData.bio)
      console.log('🔍 Available hours being sent:', updateData.availableHours)

      console.log('Sending data to backend:', updateData)

      const response = await doctorsAPI.updateDoctorProfile(updateData)
      
      if (response.data.status === 'success') {
        toast.success('Profile updated successfully!')
        setIsEditing(false)
        
        // Update auth context with new data
        if (updateProfile) {
          await updateProfile(response.data.data.doctor)
        }
        
        // Reload profile data
        setProfileData(response.data.data.doctor)
      } else {
        toast.error(response.data.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      console.error('Error details:', error.response?.data)
      
      // Show specific validation errors if available
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map(err => err.msg || err.message).join(', ')
        toast.error(`Validation failed: ${errorMessages}`)
      } else {
        toast.error(error.response?.data?.message || 'Failed to update profile')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/doctor/dashboard')}
            className="p-2 text-gray-400 hover:text-white hover:bg-primary-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
            <p className="mt-2 text-gray-300">Manage your professional information</p>
          </div>
        </div>
        <div className="flex space-x-3">
          {!isEditing ? (
            <button
              onClick={handleEditToggle}
              className="flex items-center px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleEditToggle}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-8 border border-primary-600">
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                {isEditing ? (
                  <input
                    {...register('firstName', { required: 'First name is required' })}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="Enter first name"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white">
                    {profileData?.firstName || 'Not provided'}
                  </div>
                )}
                {errors.firstName && <p className="mt-1 text-sm text-red-400">{errors.firstName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                {isEditing ? (
                  <input
                    {...register('lastName', { required: 'Last name is required' })}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="Enter last name"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white">
                    {profileData?.lastName || 'Not provided'}
                  </div>
                )}
                {errors.lastName && <p className="mt-1 text-sm text-red-400">{errors.lastName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                {isEditing ? (
                  <input
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {profileData?.email || 'Not provided'}
                  </div>
                )}
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                {isEditing ? (
                  <input
                    {...register('phone')}
                    type="tel"
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white">
                    {profileData?.phone || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                {isEditing ? (
                  <input
                    {...register('dateOfBirth')}
                    type="date"
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {profileData?.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                {isEditing ? (
                  <select
                    {...register('gender')}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white">
                    {profileData?.gender || 'Not provided'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Stethoscope className="w-5 h-5 mr-2" />
              Professional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Specialization</label>
                {isEditing ? (
                  <select
                    {...register('specialization', { required: 'Specialization is required' })}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  >
                    <option value="">Select Specialization</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Endocrinology">Endocrinology</option>
                    <option value="Gastroenterology">Gastroenterology</option>
                    <option value="Gynecology">Gynecology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Oncology">Oncology</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Otolaryngology (ENT)">Otolaryngology (ENT)</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="Pulmonology">Pulmonology</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Rheumatology">Rheumatology</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Urology">Urology</option>
                    <option value="Emergency Medicine">Emergency Medicine</option>
                    <option value="Family Medicine">Family Medicine</option>
                    <option value="Internal Medicine">Internal Medicine</option>
                    <option value="Anesthesiology">Anesthesiology</option>
                    <option value="Pathology">Pathology</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white flex items-center">
                    <Stethoscope className="w-4 h-4 mr-2 text-gray-400" />
                    {profileData?.specialization || 'Not specified'}
                  </div>
                )}
                {errors.specialization && (
                  <p className="mt-1 text-sm text-red-400">{errors.specialization.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Experience (years)</label>
                {isEditing ? (
                  <input
                    {...register('experience')}
                    type="number"
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="Enter years of experience"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white flex items-center">
                    <Award className="w-4 h-4 mr-2 text-gray-400" />
                    {profileData?.experience ? `${profileData.experience} years` : 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">License Number</label>
                {isEditing ? (
                  <input
                    {...register('licenseNumber')}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="Enter license number"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white">
                    {profileData?.licenseNumber || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Consultation Fee</label>
                {isEditing ? (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
                    <input
                      {...register('consultationFee', { 
                        required: 'Consultation fee is required',
                        min: { value: 0, message: 'Fee must be positive' }
                      })}
                      type="number"
                      min="0"
                      step="50"
                      className="w-full pl-8 pr-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                      placeholder="Enter consultation fee"
                    />
                  </div>
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                    ₹{profileData?.consultationFee ? Number(profileData.consultationFee).toLocaleString('en-IN') : '0'}
                  </div>
                )}
                {errors.consultationFee && (
                  <p className="mt-1 text-sm text-red-400">{errors.consultationFee.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Qualifications</label>
                {isEditing ? (
                  <input
                    {...register('qualifications')}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="Enter qualifications (comma separated)"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white">
                    {profileData?.qualifications?.map(item => item.degree || item).join(', ') || 'Not provided'}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                {isEditing ? (
                  <textarea
                    {...register('bio')}
                    rows={4}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="Enter professional bio"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white min-h-[100px]">
                    {profileData?.bio || 'Not provided'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact & Availability */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Contact & Availability
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                {isEditing ? (
                  <textarea
                    {...register('address')}
                    rows={3}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="Enter address"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white min-h-[84px]">
                    {profileData?.address 
                      ? typeof profileData.address === 'string' 
                        ? profileData.address 
                        : `${profileData.address.street || ''} ${profileData.address.city || ''} ${profileData.address.state || ''} ${profileData.address.country || ''}`.trim() || 'Not provided'
                      : 'Not provided'
                    }
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Office Location</label>
                {isEditing ? (
                  <input
                    {...register('location')}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="Enter office location"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white">
                    {profileData?.location || 'Not provided'}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Available Hours</label>
                {isEditing ? (
                  <input
                    {...register('availableHours')}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="e.g., Mon-Fri 9:00 AM - 5:00 PM"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    {profileData?.availableHours || 'Not provided'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Workplace & Schedule Management Section */}
          <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Workplace & Schedule Management
            </h2>
            
            {isEditing && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => append({
                    name: '',
                    address: '',
                    phone: '',
                    schedule: [
                      { day: 'Monday', startTime: '', endTime: '', isAvailable: false },
                      { day: 'Tuesday', startTime: '', endTime: '', isAvailable: false },
                      { day: 'Wednesday', startTime: '', endTime: '', isAvailable: false },
                      { day: 'Thursday', startTime: '', endTime: '', isAvailable: false },
                      { day: 'Friday', startTime: '', endTime: '', isAvailable: false },
                      { day: 'Saturday', startTime: '', endTime: '', isAvailable: false },
                      { day: 'Sunday', startTime: '', endTime: '', isAvailable: false }
                    ]
                  })}
                  className="flex items-center px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Workplace
                </button>
              </div>
            )}

            <div className="space-y-6">
              {fields.length === 0 && !isEditing && (
                <div className="text-center py-8 text-gray-400">
                  <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No workplaces added yet</p>
                </div>
              )}

              {fields.map((field, index) => (
                <div key={field.id} className="bg-primary-700 rounded-lg p-4 border border-primary-600">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">
                      Workplace {index + 1}
                    </h3>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Workplace Name
                      </label>
                      {isEditing ? (
                        <input
                          {...register(`workplaces.${index}.name`)}
                          className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                          placeholder="e.g., City Hospital, Private Clinic"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white">
                          {field.name || 'Not specified'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          {...register(`workplaces.${index}.phone`)}
                          type="tel"
                          className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                          placeholder="Workplace contact number"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {field.phone || 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Address
                    </label>
                    {isEditing ? (
                      <textarea
                        {...register(`workplaces.${index}.address`)}
                        rows={2}
                        className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                        placeholder="Full address of the workplace"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white flex items-start">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                        {field.address || 'Not provided'}
                      </div>
                    )}
                  </div>

                  {/* Weekly Schedule */}
                  <div>
                    <h4 className="text-md font-medium text-white mb-3 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Weekly Schedule
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, dayIndex) => (
                        <div key={day} className="flex items-center space-x-4 bg-primary-600 p-3 rounded-lg">
                          <div className="w-20 text-sm text-gray-300">{day}</div>
                          
                          {isEditing ? (
                            <>
                              <label className="flex items-center">
                                <input
                                  {...register(`workplaces.${index}.schedule.${dayIndex}.isAvailable`)}
                                  type="checkbox"
                                  className="mr-2 rounded"
                                />
                                <span className="text-sm text-gray-300">Available</span>
                              </label>
                              
                              <input
                                {...register(`workplaces.${index}.schedule.${dayIndex}.startTime`)}
                                type="time"
                                className="px-3 py-1 bg-primary-500 border border-primary-400 rounded text-white text-sm"
                                placeholder="Start"
                              />
                              
                              <span className="text-gray-400">to</span>
                              
                              <input
                                {...register(`workplaces.${index}.schedule.${dayIndex}.endTime`)}
                                type="time"
                                className="px-3 py-1 bg-primary-500 border border-primary-400 rounded text-white text-sm"
                                placeholder="End"
                              />
                            </>
                          ) : (
                            <div className="flex items-center space-x-4">
                              {field.schedule?.[dayIndex]?.isAvailable ? (
                                <>
                                  <span className="text-green-400 text-sm">Available</span>
                                  <span className="text-gray-300 text-sm">
                                    {field.schedule[dayIndex].startTime || '--:--'} - {field.schedule[dayIndex].endTime || '--:--'}
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-500 text-sm">Not available</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default DoctorProfile
