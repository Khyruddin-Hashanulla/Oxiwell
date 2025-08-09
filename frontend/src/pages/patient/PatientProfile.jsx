import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { User, Mail, Phone, Calendar, MapPin, Edit3, Save, X, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { patientsAPI } from '../../services/api'

const PatientProfile = () => {
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
    setValue
  } = useForm()

  // Load patient profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true)
        // Use the current user data from auth context instead of API call
        // since patients can only access their own profile
        if (user) {
          setProfileData(user)
          
          // Pre-fill form with current data
          reset({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
            gender: user.gender || '',
            address: typeof user.address === 'string' 
              ? user.address 
              : user.address 
                ? `${user.address.street || ''} ${user.address.city || ''} ${user.address.state || ''} ${user.address.country || ''}`.trim()
                : '',
            bloodGroup: user.bloodGroup || '',
            emergencyContactName: user.emergencyContact?.name || '',
            emergencyContactPhone: user.emergencyContact?.phone || '',
            emergencyContactRelationship: user.emergencyContact?.relationship || '',
            allergies: user.allergies?.join(', ') || '',
            medicalHistory: user.medicalHistory?.map(item => `${item.condition} (${item.status})`).join(', ') || ''
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        toast.error('Failed to load profile data')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user, reset])

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      
      // Format data for backend
      const updateData = {
        ...data,
        // Format emergency contact as object
        emergencyContact: {
          name: data.emergencyContactName || '',
          phone: data.emergencyContactPhone || '',
          relationship: data.emergencyContactRelationship || ''
        },
        // Convert allergies from comma-separated string to array
        allergies: data.allergies ? data.allergies.split(',').map(item => item.trim()).filter(item => item) : [],
        // Convert medical history from comma-separated string to array of objects
        medicalHistory: data.medicalHistory 
          ? data.medicalHistory.split(',').map(item => {
              const trimmed = item.trim()
              return trimmed ? {
                condition: trimmed,
                status: 'active', // Default status
                diagnosedDate: new Date() // Default to current date
              } : null
            }).filter(item => item !== null)
          : []
      }

      // Remove the individual emergency contact fields from the data
      delete updateData.emergencyContactName
      delete updateData.emergencyContactPhone
      delete updateData.emergencyContactRelationship

      const response = await patientsAPI.updatePatientProfile(updateData)
      
      if (response.data.status === 'success') {
        toast.success('Profile updated successfully!')
        setIsEditing(false)
        
        // Update auth context with new data
        await updateProfile(response.data.data.patient)
        
        // Reload profile data
        setProfileData(response.data.data.patient)
      } else {
        toast.error(response.data.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    reset() // Reset form to original values
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
            onClick={() => navigate('/patient/dashboard')}
            className="p-2 text-gray-400 hover:text-white hover:bg-primary-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
            <p className="mt-2 text-gray-300">Manage your personal information</p>
          </div>
        </div>
        <div className="flex space-x-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Profile
                  </>
                )}
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
                {errors.firstName && <p className="mt-1 text-sm text-error-400">{errors.firstName.message}</p>}
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
                {errors.lastName && <p className="mt-1 text-sm text-error-400">{errors.lastName.message}</p>}
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
                {errors.email && <p className="mt-1 text-sm text-error-400">{errors.email.message}</p>}
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
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
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

          {/* Contact Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Contact Information
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Emergency Contact Name</label>
                {isEditing ? (
                  <input
                    {...register('emergencyContactName')}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="Enter emergency contact name"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white">
                    {profileData?.emergencyContact?.name || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Emergency Contact Phone</label>
                {isEditing ? (
                  <input
                    {...register('emergencyContactPhone')}
                    type="tel"
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="Enter emergency contact phone"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {profileData?.emergencyContact?.phone || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Emergency Contact Relationship</label>
                {isEditing ? (
                  <input
                    {...register('emergencyContactRelationship')}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="Enter relationship (e.g., spouse, parent)"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white">
                    {profileData?.emergencyContact?.relationship || 'Not provided'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Medical Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Blood Group</label>
                {isEditing ? (
                  <select
                    {...register('bloodGroup')}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  >
                    <option value="">Select blood group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white">
                    {profileData?.bloodGroup || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Allergies</label>
                {isEditing ? (
                  <input
                    {...register('allergies')}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="Enter allergies (comma separated)"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white">
                    {profileData?.allergies?.join(', ') || 'None'}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Medical History</label>
                {isEditing ? (
                  <textarea
                    {...register('medicalHistory')}
                    rows={3}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="Enter medical history (comma separated)"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white min-h-[84px]">
                    {profileData?.medicalHistory?.join(', ') || 'None'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default PatientProfile
