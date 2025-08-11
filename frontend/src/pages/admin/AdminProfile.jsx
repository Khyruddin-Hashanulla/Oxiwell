import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { User, Mail, Phone, Calendar, MapPin, Edit3, Save, X, ArrowLeft, Shield, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { adminsAPI } from '../../services/api'

const AdminProfile = () => {
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
    watch
  } = useForm()

  // Load admin profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true)
        const response = await adminsAPI.getAdmin(user._id)
        console.log('🔍 Admin profile API response:', response)
        console.log('🔍 Response data structure:', response.data)
        
        if (response.data.status === 'success') {
          console.log('🔍 Admin data from API:', response.data.data)
          const admin = response.data.data.user || response.data.data.admin || response.data.data
          console.log('🔍 Extracted admin object:', admin)
          setProfileData(admin)
          
          // Pre-fill form with current data
          reset({
            firstName: admin.firstName || '',
            lastName: admin.lastName || '',
            email: admin.email || '',
            phone: admin.phone || '',
            dateOfBirth: admin.dateOfBirth ? new Date(admin.dateOfBirth).toISOString().split('T')[0] : '',
            gender: admin.gender || '',
            address: admin.address 
              ? typeof admin.address === 'string' 
                ? admin.address 
                : `${admin.address.street || ''} ${admin.address.city || ''} ${admin.address.state || ''} ${admin.address.country || ''}`.trim()
              : '',
            department: admin.department || '',
            position: admin.position || '',
            employeeId: admin.employeeId || '',
            permissions: admin.permissions || [],
            bio: admin.bio || ''
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
  }, [user, reset])

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      
      // Format data for backend
      const updateData = {
        ...data,
        permissions: data.permissions || []
      }

      const response = await adminsAPI.updateAdminProfile(updateData)
      console.log('🔍 Admin profile update API response:', response)
      console.log('🔍 Response data structure:', response.data)
      
      if (response.data.status === 'success') {
        console.log('🔍 Updated admin data from API:', response.data.data)
        const updatedAdmin = response.data.data.user || response.data.data.admin || response.data.data
        console.log('🔍 Extracted updated admin object:', updatedAdmin)
        toast.success('Profile updated successfully!')
        setIsEditing(false)
        
        // Update auth context with new data
        await updateProfile(updatedAdmin)
        
        // Reload profile data
        setProfileData(updatedAdmin)
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
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 text-gray-400 hover:text-white hover:bg-primary-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
            <p className="mt-2 text-gray-300">Manage your administrative information</p>
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
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors disabled:opacity-50"
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

          {/* Administrative Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Administrative Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Employee ID</label>
                {isEditing ? (
                  <input
                    {...register('employeeId')}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="Enter employee ID"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white">
                    {profileData?.employeeId || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                {isEditing ? (
                  <input
                    {...register('department')}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="Enter department"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white">
                    {profileData?.department || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
                {isEditing ? (
                  <input
                    {...register('position')}
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="Enter position/title"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white">
                    {profileData?.position || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white flex items-center">
                  <Settings className="w-4 h-4 mr-2 text-gray-400" />
                  Administrator
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Permissions</label>
                {isEditing ? (
                  <div className="w-full p-4 bg-primary-700 border border-primary-600 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { value: 'user_management', label: 'User Management' },
                        { value: 'doctor_approval', label: 'Doctor Approval' },
                        { value: 'system_settings', label: 'System Settings' },
                        { value: 'reports_access', label: 'Reports Access' },
                        { value: 'audit_logs', label: 'Audit Logs' },
                        { value: 'data_export', label: 'Data Export' },
                        { value: 'backup_restore', label: 'Backup & Restore' },
                        { value: 'security_management', label: 'Security Management' }
                      ].map((permission) => (
                        <label key={permission.value} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={watch('permissions')?.includes(permission.value) || false}
                            onChange={(e) => {
                              const currentPermissions = watch('permissions') || []
                              const newPermissions = e.target.checked
                                ? [...currentPermissions, permission.value]
                                : currentPermissions.filter(p => p !== permission.value)
                              setValue('permissions', newPermissions)
                            }}
                            className="w-4 h-4 text-accent-600 bg-primary-600 border-primary-500 rounded focus:ring-accent-500 focus:ring-2"
                          />
                          <span className="text-gray-300 text-sm">{permission.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white">
                    {profileData?.permissions?.map(perm => {
                      const permissionLabels = {
                        'user_management': 'User Management',
                        'doctor_approval': 'Doctor Approval',
                        'system_settings': 'System Settings',
                        'reports_access': 'Reports Access',
                        'audit_logs': 'Audit Logs',
                        'data_export': 'Data Export',
                        'backup_restore': 'Backup & Restore',
                        'security_management': 'Security Management'
                      }
                      return permissionLabels[perm] || perm
                    }).join(', ') || 'Not provided'}
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

          {/* Contact Information */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 gap-6">
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
                  <div className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white">
                    {profileData?.address 
                      ? typeof profileData.address === 'string' 
                        ? profileData.address 
                        : `${profileData.address.street || ''} ${profileData.address.city || ''} ${profileData.address.state || ''} ${profileData.address.country || ''}`.trim() || 'Not provided'
                      : 'Not provided'}
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

export default AdminProfile
