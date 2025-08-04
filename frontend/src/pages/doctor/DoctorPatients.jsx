import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { doctorsAPI } from '../../services/api'
import { toast } from 'react-hot-toast'
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Eye
} from 'lucide-react'

const DoctorPatients = () => {
  const { user } = useAuth()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('lastVisit') // name, lastVisit, age
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const patientsPerPage = 12

  useEffect(() => {
    fetchPatients()
  }, [currentPage, sortBy, sortOrder])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching doctor patients...')
      
      const params = {
        page: currentPage,
        limit: patientsPerPage,
        sortBy,
        order: sortOrder
      }

      const response = await doctorsAPI.getPatients(params)
      const data = response?.data?.data || {}
      
      setPatients(data.patients || [])
      setTotalPages(Math.ceil((data.total || 0) / patientsPerPage))
      
      console.log('✅ Patients loaded:', data.patients?.length || 0)
    } catch (error) {
      console.error('❌ Error fetching patients:', error)
      toast.error('Failed to load patients')
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient => {
    const fullName = patient.fullName || `${patient.firstName || ''} ${patient.lastName || ''}`.trim()
    const email = patient.email || ''
    const phone = patient.phone || ''
    
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           phone.includes(searchTerm)
  })

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A'
    try {
      const today = new Date()
      const birthDate = new Date(dateOfBirth)
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      return age
    } catch {
      return 'N/A'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  const getBloodGroupColor = (bloodGroup) => {
    const colors = {
      'A+': 'bg-red-100 text-red-800',
      'A-': 'bg-red-200 text-red-900',
      'B+': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-200 text-blue-900',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-200 text-purple-900',
      'O+': 'bg-green-100 text-green-800',
      'O-': 'bg-green-200 text-green-900'
    }
    return colors[bloodGroup] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-400"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                My Patients
              </h1>
              <p className="text-gray-300">
                Manage and view all your registered patients
              </p>
            </div>
            <Link
              to="/doctor/dashboard"
              className="bg-primary-700 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl border border-primary-600 shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-primary-700 border border-primary-600 rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="lastVisit">Last Visit</option>
                  <option value="name">Name</option>
                  <option value="age">Age</option>
                </select>
              </div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-primary-700 border border-primary-600 rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Patients Grid */}
        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl border border-primary-600 shadow-lg">
          <div className="p-6">
            {filteredPatients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient._id}
                    className="bg-primary-700 bg-opacity-50 rounded-lg p-6 hover:bg-opacity-70 transition-all border border-primary-600"
                  >
                    {/* Patient Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {patient.fullName || `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown Patient'}
                          </h3>
                          <p className="text-sm text-gray-300">
                            Age: {calculateAge(patient.dateOfBirth)}
                          </p>
                        </div>
                      </div>
                      {patient.bloodGroup && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getBloodGroupColor(patient.bloodGroup)}`}>
                          {patient.bloodGroup}
                        </span>
                      )}
                    </div>

                    {/* Patient Details */}
                    <div className="space-y-3 mb-4">
                      {patient.email && (
                        <div className="flex items-center space-x-2 text-sm text-gray-300">
                          <Mail className="w-4 h-4" />
                          <span>{patient.email}</span>
                        </div>
                      )}
                      {patient.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-300">
                          <Phone className="w-4 h-4" />
                          <span>{patient.phone}</span>
                        </div>
                      )}
                      {patient.gender && (
                        <div className="flex items-center space-x-2 text-sm text-gray-300">
                          <User className="w-4 h-4" />
                          <span className="capitalize">{patient.gender}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <Clock className="w-4 h-4" />
                        <span>Last visit: {formatDate(patient.lastVisit)}</span>
                      </div>
                    </div>

                    {/* Patient Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-primary-600 bg-opacity-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-semibold text-white">
                          {patient.appointments?.length || 0}
                        </div>
                        <div className="text-xs text-gray-300">Appointments</div>
                      </div>
                      <div className="bg-primary-600 bg-opacity-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-semibold text-white">
                          {patient.prescriptions?.length || 0}
                        </div>
                        <div className="text-xs text-gray-300">Prescriptions</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Link
                        to={`/doctor/patients/${patient._id}`}
                        className="flex-1 bg-accent-600 hover:bg-accent-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </Link>
                      <Link
                        to={`/doctor/patients/${patient._id}/history`}
                        className="flex-1 bg-primary-600 hover:bg-primary-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                      >
                        <FileText className="w-4 h-4" />
                        <span>History</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No patients found</h3>
                <p className="text-gray-300">
                  {searchTerm ? 'Try adjusting your search terms' : 'No patients registered yet'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-primary-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-300">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="bg-primary-700 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="bg-primary-700 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorPatients
