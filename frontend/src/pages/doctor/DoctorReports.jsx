import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { reportsAPI } from '../../services/api'
import { toast } from 'react-hot-toast'
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  Clock,
  AlertCircle,
  ChevronDown,
  ExternalLink
} from 'lucide-react'

const DoctorReports = () => {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('testDate')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    fetchReports()
  }, [filterType, filterStatus, sortBy, sortOrder])

  const fetchReports = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching doctor reports...')
      
      const params = {
        sortBy,
        order: sortOrder
      }

      if (filterType !== 'all') {
        params.reportType = filterType
      }
      if (filterStatus !== 'all') {
        params.status = filterStatus
      }

      const response = await reportsAPI.getReports(params)
      const data = response?.data?.data || []
      
      setReports(Array.isArray(data) ? data : [])
      console.log('📊 Reports fetched:', data.length)
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('Failed to load reports')
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = reports.filter(report => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      report.title?.toLowerCase().includes(searchLower) ||
      report.patient?.firstName?.toLowerCase().includes(searchLower) ||
      report.patient?.lastName?.toLowerCase().includes(searchLower) ||
      report.reportType?.toLowerCase().includes(searchLower) ||
      report.labName?.toLowerCase().includes(searchLower)
    )
  })

  const handleViewReport = (report) => {
    if (report.files && report.files.length > 0 && report.files[0].cloudinaryUrl) {
      window.open(report.files[0].cloudinaryUrl, '_blank')
    } else {
      toast.error('No file available for this report')
    }
  }

  const handleDownloadReport = (report) => {
    if (report.files && report.files.length > 0 && report.files[0].cloudinaryUrl) {
      const link = document.createElement('a')
      link.href = report.files[0].cloudinaryUrl
      link.download = report.files[0].originalName || `${report.title}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      toast.error('No file available for download')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getReportTypeColor = (type) => {
    const colors = {
      'lab-report': 'bg-blue-100 text-blue-800',
      'blood-test': 'bg-red-100 text-red-800',
      'urine-test': 'bg-yellow-100 text-yellow-800',
      'x-ray': 'bg-purple-100 text-purple-800',
      'mri': 'bg-indigo-100 text-indigo-800',
      'ct-scan': 'bg-green-100 text-green-800',
      'ultrasound': 'bg-teal-100 text-teal-800',
      'ecg': 'bg-orange-100 text-orange-800',
      'prescription': 'bg-pink-100 text-pink-800',
      'discharge-summary': 'bg-gray-100 text-gray-800',
      'other': 'bg-slate-100 text-slate-800'
    }
    return colors[type] || colors.other
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'reviewed': 'bg-green-100 text-green-800',
      'archived': 'bg-gray-100 text-gray-800'
    }
    return colors[status] || colors.pending
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Patient Reports</h1>
        <p className="mt-2 text-primary-300">View and manage patient medical reports</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl border border-primary-600 shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>

          {/* Report Type Filter */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 appearance-none"
            >
              <option value="all">All Types</option>
              <option value="lab-report">Lab Report</option>
              <option value="blood-test">Blood Test</option>
              <option value="x-ray">X-Ray</option>
              <option value="mri">MRI</option>
              <option value="ct-scan">CT Scan</option>
              <option value="ultrasound">Ultrasound</option>
              <option value="prescription">Prescription</option>
              <option value="other">Other</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="archived">Archived</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field)
                setSortOrder(order)
              }}
              className="w-full px-4 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 appearance-none"
            >
              <option value="testDate-desc">Newest First</option>
              <option value="testDate-asc">Oldest First</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl border border-primary-600 shadow-lg">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500 mx-auto"></div>
            <p className="mt-4 text-primary-300">Loading reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-primary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Reports Found</h3>
            <p className="text-primary-300">
              {searchTerm ? 'No reports match your search criteria.' : 'No patient reports available.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-primary-600">
            {filteredReports.map((report) => (
              <div key={report._id} className="p-6 hover:bg-primary-700/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="bg-accent-600 p-2 rounded-lg">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{report.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReportTypeColor(report.reportType)}`}>
                            {report.reportType?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status?.charAt(0).toUpperCase() + report.status?.slice(1)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-primary-300">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>
                              {report.patient?.firstName} {report.patient?.lastName}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>Test Date: {formatDate(report.testDate)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>Uploaded: {formatDate(report.createdAt)}</span>
                          </div>
                        </div>
                        
                        {report.description && (
                          <p className="mt-2 text-primary-300 text-sm">{report.description}</p>
                        )}
                        
                        {report.labName && (
                          <p className="mt-1 text-primary-400 text-sm">Lab: {report.labName}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewReport(report)}
                      className="bg-primary-600 hover:bg-primary-500 text-white p-2 rounded-lg transition-colors"
                      title="View Report"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadReport(report)}
                      className="bg-accent-600 hover:bg-accent-700 text-white p-2 rounded-lg transition-colors"
                      title="Download Report"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {!loading && filteredReports.length > 0 && (
        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl border border-primary-600 shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{filteredReports.length}</div>
              <div className="text-primary-300 text-sm">Total Reports</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {filteredReports.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-primary-300 text-sm">Pending Review</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {filteredReports.filter(r => r.status === 'reviewed').length}
              </div>
              <div className="text-primary-300 text-sm">Reviewed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {new Set(filteredReports.map(r => r.patient?._id)).size}
              </div>
              <div className="text-primary-300 text-sm">Unique Patients</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorReports
