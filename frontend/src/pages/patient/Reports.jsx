import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Upload, Download, Eye, Calendar, User, Plus, Search, Filter } from 'lucide-react'
import { patientsAPI } from '../../services/api'
import { toast } from 'react-hot-toast'

const Reports = () => {
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Fetch patient reports from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true)
        const params = {}
        // Map our simple filter to backend reportType(s)
        if (filter !== 'all') {
          // Basic mapping for legacy filter buttons
          const map = {
            lab: 'lab-report',
            imaging: 'x-ray',
            prescription: 'prescription'
          }
          if (map[filter]) params.reportType = map[filter]
        }
        if (searchTerm) params.search = searchTerm

        const { data } = await patientsAPI.getReports(params)
        const items = data?.data?.reports || []
        setReports(items)
        setFilteredReports(items)
      } catch (error) {
        console.error('❌ Error fetching reports:', error)
        toast.error('Failed to load reports')
        setReports([])
        setFilteredReports([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filter reports based on type and search term
  useEffect(() => {
    let filtered = reports

    // Filter by type (map UI filter -> backend reportType variants)
    if (filter !== 'all') {
      const typeGroups = {
        lab: ['lab-report', 'blood-test', 'urine-test', 'pathology'],
        imaging: ['x-ray', 'mri', 'ct-scan', 'ultrasound', 'radiology', 'echo'],
        prescription: ['prescription']
      }
      const allowed = typeGroups[filter] || []
      filtered = filtered.filter(report => allowed.includes(report.reportType))
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(report => {
        const title = report.title || ''
        const description = report.description || ''
        const doctorName = report.doctorName || `${report.reviewedBy?.firstName || ''} ${report.reviewedBy?.lastName || ''}`
        return (
          title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctorName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }

    setFilteredReports(filtered)
  }, [reports, filter, searchTerm])

  const getReportTypeIcon = (type) => {
    switch (type) {
      case 'lab-report':
      case 'blood-test':
      case 'urine-test':
      case 'pathology':
        return <FileText className="w-5 h-5 text-blue-500" />
      case 'x-ray':
      case 'mri':
      case 'ct-scan':
      case 'ultrasound':
      case 'radiology':
      case 'echo':
        return <Eye className="w-5 h-5 text-purple-500" />
      case 'prescription':
        return <FileText className="w-5 h-5 text-green-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  const getReportTypeBadge = (type) => {
    const imaging = ['x-ray', 'mri', 'ct-scan', 'ultrasound', 'radiology', 'echo']
    if (['lab-report', 'blood-test', 'urine-test', 'pathology'].includes(type)) return 'bg-blue-100 text-blue-800'
    if (imaging.includes(type)) return 'bg-purple-100 text-purple-800'
    if (type === 'prescription') return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-800'
  }

  const primaryFileUrl = (report) => {
    const file = Array.isArray(report.files) && report.files.length > 0 ? report.files[0] : null
    return file?.cloudinaryUrl || file?.url || null
  }

  const handleDownloadReport = (report) => {
    try {
      const url = primaryFileUrl(report)
      if (url) {
        const a = document.createElement('a')
        a.href = url
        a.download = `${(report.title || 'report').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${(report.testDate || report.createdAt || '').toString()}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        toast.success(`Downloaded ${report.title || 'report'}`)
        return
      }

      // Fallback: generate a simple text file
      const element = document.createElement('a')
      const content = `Medical Report: ${report.title}\n\nDate: ${report.testDate ? new Date(report.testDate).toLocaleDateString() : 'N/A'}\nDoctor: ${report.doctorName || (report.reviewedBy ? `${report.reviewedBy.firstName} ${report.reviewedBy.lastName}` : 'N/A')}\nType: ${report.reportType || 'N/A'}\n\nDescription:\n${report.description || ''}`
      const file = new Blob([content], { type: 'text/plain' })
      element.href = URL.createObjectURL(file)
      element.download = `${(report.title || 'report').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${(report.testDate || report.createdAt || '').toString()}.txt`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      toast.success(`Downloaded ${report.title || 'report'}`)
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download report')
    }
  }

  const handleViewReport = (report) => {
    try {
      const url = primaryFileUrl(report)
      if (url) {
        // Open actual file if available
        const newWindow = window.open(url, '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes')
        if (!newWindow) toast.error('Please allow popups to view reports')
        else toast.success(`Opened ${report.title || 'report'}`)
        return
      }

      const reportContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            ${report.title || 'Medical Report'}
          </h2>
          <div style="margin: 20px 0;">
            <p><strong>Date:</strong> ${report.testDate ? new Date(report.testDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Doctor:</strong> ${report.doctorName || (report.reviewedBy ? `${report.reviewedBy.firstName} ${report.reviewedBy.lastName}` : 'N/A')}</p>
            <p><strong>Type:</strong> ${report.reportType || 'N/A'}</p>
            <p><strong>Status:</strong> ${report.status || 'N/A'}</p>
          </div>
          <div style="margin: 20px 0;">
            <h3 style="color: #374151;">Description:</h3>
            <p style="background: #f3f4f6; padding: 15px; border-radius: 8px; line-height: 1.6;">
              ${report.description || ''}
            </p>
          </div>
          <div style="margin-top: 30px; text-align: center;">
            <p style="color: #6b7280; font-size: 14px;">
              This is a preview. In a real implementation, this would show the actual medical report document.
            </p>
          </div>
        </div>
      `

      const newWindow = window.open('', '_blank', 'width=700,height=600,scrollbars=yes,resizable=yes')
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${report.title || 'Medical Report'} - Medical Report</title>
              <meta charset="utf-8">
              <style>
                body { margin: 0; padding: 20px; background: #f9fafb; }
              </style>
            </head>
            <body>
              ${reportContent}
            </body>
          </html>
        `)
        newWindow.document.close()
        toast.success(`Opened ${report.title || 'report'}`)
      } else {
        toast.error('Please allow popups to view reports')
      }
    } catch (error) {
      console.error('View error:', error)
      toast.error('Failed to open report')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Medical Reports</h1>
          <p className="mt-2 text-primary-300">View and manage your medical reports</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            to="/patient/reports/upload"
            className="inline-flex items-center px-4 py-2 bg-accent-600 text-white font-medium rounded-lg hover:bg-accent-700 transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Report
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All', count: reports.length },
              { key: 'lab', label: 'Lab Reports', count: reports.filter(r => ['lab-report','blood-test','urine-test','pathology'].includes(r.reportType)).length },
              { key: 'imaging', label: 'Imaging', count: reports.filter(r => ['x-ray','mri','ct-scan','ultrasound','radiology','echo'].includes(r.reportType)).length },
              { key: 'prescription', label: 'Prescriptions', count: reports.filter(r => r.reportType === 'prescription').length }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === filterOption.key
                    ? 'bg-accent-600 text-white shadow-lg'
                    : 'bg-primary-600 text-primary-300 hover:bg-primary-500 hover:text-white'
                }`}
              >
                {filterOption.label}
                <span className="ml-2 text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                  {filterOption.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-300 text-sm font-medium">Total Reports</p>
              <p className="text-3xl font-bold text-white mt-2">{reports.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-300 text-sm font-medium">Lab Reports</p>
              <p className="text-3xl font-bold text-white mt-2">
                {reports.filter(r => ['lab-report','blood-test','urine-test','pathology'].includes(r.reportType)).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-300 text-sm font-medium">Imaging Reports</p>
              <p className="text-3xl font-bold text-white mt-2">
                {reports.filter(r => ['x-ray','mri','ct-scan','ultrasound','radiology','echo'].includes(r.reportType)).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-12 text-center border border-primary-600">
            <FileText className="w-16 h-16 text-primary-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No reports found</h3>
            <p className="text-primary-300 mb-6">
              {filter === 'all' 
                ? "You don't have any medical reports yet." 
                : `No ${filter} reports found.`}
            </p>
            <Link
              to="/patient/reports/upload"
              className="inline-flex items-center px-4 py-2 bg-accent-600 text-white font-medium rounded-lg hover:bg-accent-700 transition-all duration-200"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First Report
            </Link>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report._id}
              className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      {getReportTypeIcon(report.reportType)}
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {report.title}
                        </h3>
                        <p className="text-primary-300 text-sm mb-2">
                          {report.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-primary-300">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {report.doctorName || (report.reviewedBy ? `${report.reviewedBy.firstName} ${report.reviewedBy.lastName}` : '—')}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {report.testDate ? new Date(report.testDate).toLocaleDateString() : (report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '—')}
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getReportTypeBadge(report.reportType)}`}>
                      {(report.reportType || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2 lg:w-32">
                  <button 
                    onClick={() => handleViewReport(report)}
                    className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button 
                    onClick={() => handleDownloadReport(report)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Reports
