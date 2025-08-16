import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, FileText, X, Calendar, User, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { reportsAPI } from '../../services/api'

const UploadReport = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    type: 'lab',
    date: '',
    description: '',
    doctorName: '',
    hospital: ''
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const reportTypes = [
    { value: 'lab', label: 'Lab Report', description: 'Blood tests, urine tests, etc.' },
    { value: 'imaging', label: 'Imaging Report', description: 'X-rays, CT scans, MRI, etc.' },
    { value: 'prescription', label: 'Prescription', description: 'Medicine prescriptions' },
    { value: 'consultation', label: 'Consultation Report', description: 'Doctor visit summaries' },
    { value: 'discharge', label: 'Discharge Summary', description: 'Hospital discharge reports' },
    { value: 'other', label: 'Other', description: 'Other medical documents' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileSelect = (file) => {
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload only PDF, JPEG, or PNG files')
        return
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        toast.error('File size must be less than 10MB')
        return
      }

      setSelectedFile(file)
      toast.success('File selected successfully')
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragleave' || e.type === 'dragover') {
      setDragActive(e.type !== 'dragleave')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
  }

  const mapToBackendReportType = (uiType) => {
    switch (uiType) {
      case 'lab':
        return 'lab-report'
      case 'imaging':
        return 'x-ray'
      case 'prescription':
        return 'prescription'
      case 'consultation':
        return 'other'
      case 'discharge':
        return 'discharge-summary'
      default:
        return 'other'
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.title.trim()) {
      toast.error('Please enter a report title')
      return
    }

    if (!formData.date) {
      toast.error('Please select a report date')
      return
    }

    if (!selectedFile) {
      toast.error('Please select a file to upload')
      return
    }

    setIsUploading(true)

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        reportType: mapToBackendReportType(formData.type),
        testDate: formData.date, // ISO (yyyy-mm-dd) from input
        labName: formData.hospital?.trim() || '',
        doctorName: formData.doctorName?.trim() || '',
        file: selectedFile
      }

      const res = await reportsAPI.uploadReport(payload)
      if (res?.data?.status === 'success') {
        toast.success('Report uploaded successfully!')
        navigate('/patient/reports')
      } else {
        toast.error(res?.data?.message || 'Failed to upload report')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload report. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/patient/reports"
          className="bg-primary-700 hover:bg-primary-600 text-white p-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Upload Medical Report</h1>
          <p className="mt-2 text-primary-300">Share your medical reports with your healthcare providers</p>
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl border border-primary-600 shadow-lg">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Report Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
              Report Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Blood Test Results, X-Ray Report"
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              required
            />
          </div>

          {/* Report Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-white mb-2">
              Report Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              required
            >
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          {/* Report Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-white mb-2">
                Report Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="doctorName" className="block text-sm font-medium text-white mb-2">
                Doctor Name
              </label>
              <input
                type="text"
                id="doctorName"
                name="doctorName"
                value={formData.doctorName}
                onChange={handleInputChange}
                placeholder="e.g., Dr. John Smith"
                className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Hospital */}
          <div>
            <label htmlFor="hospital" className="block text-sm font-medium text-white mb-2">
              Hospital/Clinic Name
            </label>
            <input
              type="text"
              id="hospital"
              name="hospital"
              value={formData.hospital}
              onChange={handleInputChange}
              placeholder="e.g., City General Hospital"
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Brief description of the report or any additional notes..."
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent resize-none"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Upload File *
            </label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-accent-500 bg-accent-500/10'
                  : 'border-primary-500 hover:border-primary-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-3">
                    <FileText className="w-8 h-8 text-accent-500" />
                    <div className="text-left">
                      <p className="text-white font-medium">{selectedFile.name}</p>
                      <p className="text-primary-300 text-sm">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-error-400 hover:text-error-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-primary-400 mx-auto" />
                  <div>
                    <p className="text-white font-medium mb-2">
                      Drag and drop your file here, or click to browse
                    </p>
                    <p className="text-primary-300 text-sm">
                      Supported formats: PDF, JPEG, PNG (Max 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    onChange={handleFileInputChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-warning-900/30 border border-warning-700 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-warning-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-warning-200 font-medium mb-1">Important Privacy Notice</p>
                <p className="text-warning-300">
                  Your medical reports will be securely stored and only accessible to you and your authorized healthcare providers. 
                  Please ensure you have the right to share this medical information.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-primary-600">
            <Link
              to="/patient/reports"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors text-center font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadReport
