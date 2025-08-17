import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Users, 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  RefreshCw,
  Clock,
  Mail,
  Phone,
  Calendar,
  Award
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI } from '../../services/api'

const AdminApprovals = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [pendingDoctors, setPendingDoctors] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [actionLoading, setActionLoading] = useState({})

  // Load pending doctors
  useEffect(() => {
    const loadPendingDoctors = async () => {
      try {
        setIsLoading(true)
        const response = await adminAPI.getPendingDoctors()
        if (response?.data?.status === 'success') {
          // Backend returns doctors array under data.doctors
          setPendingDoctors(response.data.data?.doctors || [])
        } else {
          setPendingDoctors([])
        }
      } catch (error) {
        console.error('Error loading pending doctors:', error)
        toast.error('Failed to load pending approvals')
        setPendingDoctors([]) // Set empty array to prevent crash
      } finally {
        setIsLoading(false)
      }
    }

    loadPendingDoctors()
  }, [])

  // Handle doctor approval
  const handleApproveDoctor = async (doctorId) => {
    try {
      setActionLoading(prev => ({ ...prev, [doctorId]: 'approving' }))
      
      const response = await adminAPI.approveDoctor(doctorId)
      
      if (response.data.status === 'success') {
        toast.success('Doctor approved successfully!')
        setPendingDoctors(prev => prev.filter(doctor => doctor._id !== doctorId))
      }
    } catch (error) {
      console.error('Error approving doctor:', error)
      toast.error('Failed to approve doctor')
    } finally {
      setActionLoading(prev => ({ ...prev, [doctorId]: null }))
    }
  }

  // Handle doctor rejection
  const handleRejectDoctor = async (doctorId) => {
    try {
      setActionLoading(prev => ({ ...prev, [doctorId]: 'rejecting' }))
      
      const response = await adminAPI.rejectDoctor(doctorId)
      
      if (response.data.status === 'success') {
        toast.success('Doctor rejected successfully!')
        setPendingDoctors(prev => prev.filter(doctor => doctor._id !== doctorId))
      }
    } catch (error) {
      console.error('Error rejecting doctor:', error)
      toast.error('Failed to reject doctor')
    } finally {
      setActionLoading(prev => ({ ...prev, [doctorId]: null }))
    }
  }

  // Filter doctors based on search and status
  const filteredDoctors = (Array.isArray(pendingDoctors) ? pendingDoctors : []).filter(doctor => {
    const matchesSearch = 
      doctor.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 bg-primary-700 hover:bg-primary-600 rounded-lg transition-colors self-start"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex flex-col sm:flex-row sm:items-center">
              <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mr-0 sm:mr-3 mb-2 sm:mb-0 text-accent-400" />
              <span>Doctor Approvals</span>
            </h1>
            <p className="text-gray-400 mt-1 text-sm sm:text-base">
              Review and approve doctor registration requests
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="px-3 sm:px-4 py-2 bg-primary-700 hover:bg-primary-600 border border-primary-600 rounded-lg text-white transition-colors flex items-center justify-center text-sm sm:text-base"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-4 sm:p-6 border border-primary-600">
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search doctors by name, email, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm sm:text-base"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Doctors List */}
      <div className="space-y-4">
        {filteredDoctors.length === 0 ? (
          <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-8 border border-primary-600 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Pending Approvals</h3>
            <p className="text-gray-400">
              {searchTerm ? 'No doctors match your search criteria.' : 'All doctor registrations have been processed.'}
            </p>
          </div>
        ) : (
          filteredDoctors.map((doctor) => (
            <div key={doctor._id} className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl border border-primary-600 shadow-lg hover:shadow-xl transition-all duration-300">
              {/* Doctor Header */}
              <div className="p-4 border-b border-primary-600">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center self-start sm:self-auto">
                      <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white text-lg sm:text-xl truncate">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h3>
                      <p className="text-accent-400 font-medium text-base sm:text-lg truncate">
                        {doctor.specialization || 'Specialization not specified'}
                      </p>
                      <p className="text-sm text-gray-300 flex items-center mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        Registered: {new Date(doctor.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <button 
                      className={`bg-success-600 hover:bg-success-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${actionLoading[doctor._id] === 'approving' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleApproveDoctor(doctor._id)}
                      disabled={actionLoading[doctor._id]}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {actionLoading[doctor._id] === 'approving' ? 'Approving...' : 'Approve'}
                    </button>
                    <button 
                      className={`bg-error-600 hover:bg-error-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${actionLoading[doctor._id] === 'rejecting' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleRejectDoctor(doctor._id)}
                      disabled={actionLoading[doctor._id]}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {actionLoading[doctor._id] === 'rejecting' ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Doctor Details */}
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Professional Information */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-accent-400 uppercase tracking-wide flex items-center">
                      <Award className="w-4 h-4 mr-2" />
                      Professional Info
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-gray-400 block">Registration Number</span>
                        <span className="text-white font-medium break-all">
                          {doctor.licenseNumber || 'Not provided'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block">Experience</span>
                        <span className="text-white font-medium">
                          {doctor.experience ? `${doctor.experience} years` : 'Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block">Qualification</span>
                        <span className="text-white font-medium break-words">
                          {doctor.qualifications && doctor.qualifications.length > 0 
                            ? doctor.qualifications.map(q => q.degree).join(', ')
                            : 'Not provided'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-accent-400 uppercase tracking-wide flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Info
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-gray-400 block">Email</span>
                        <span className="text-white font-medium break-all">
                          {doctor.email}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block">Phone</span>
                        <span className="text-white font-medium">
                          {doctor.phone}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block">Status</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                          Pending Approval
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="space-y-3 sm:col-span-2 lg:col-span-1">
                    <h4 className="text-sm font-semibold text-accent-400 uppercase tracking-wide">Additional Info</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-gray-400 block">Gender</span>
                        <span className="text-white font-medium capitalize">
                          {doctor.gender || 'Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block">Date of Birth</span>
                        <span className="text-white font-medium">
                          {doctor.dateOfBirth ? new Date(doctor.dateOfBirth).toLocaleDateString() : 'Not provided'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block">Verification</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${doctor.isVerified ? 'bg-success-100 text-success-800' : 'bg-error-100 text-error-800'}`}>
                          {doctor.isVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Bio (if available) */}
                {doctor.professionalBio && (
                  <div className="mt-6 pt-6 border-t border-primary-600">
                    <h4 className="text-sm font-semibold text-accent-400 uppercase tracking-wide mb-3">Professional Bio</h4>
                    <p className="text-gray-300 leading-relaxed">
                      {doctor.professionalBio}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AdminApprovals
