import React, { useState, useEffect } from 'react'
import { Pill, Clock, User, Calendar, AlertTriangle, CheckCircle, Download, Search, Filter } from 'lucide-react'
import { patientsAPI } from '../../services/api'
import { toast } from 'react-hot-toast'

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([])
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Fetch real prescriptions data from API
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setIsLoading(true)
        console.log('🔍 Fetching patient prescriptions...')
        const response = await patientsAPI.getPrescriptions()
        console.log('📋 Raw prescriptions response:', response)
        
        // Handle different possible response structures
        const prescriptionsData = response?.data?.data?.prescriptions || response?.data?.prescriptions || response?.data || []
        console.log('💊 Extracted prescriptions data:', prescriptionsData)
        console.log('📊 Number of prescriptions found:', prescriptionsData.length)
        
        setPrescriptions(Array.isArray(prescriptionsData) ? prescriptionsData : [])
        setFilteredPrescriptions(Array.isArray(prescriptionsData) ? prescriptionsData : [])
      } catch (error) {
        console.error('❌ Error fetching prescriptions:', error)
        console.error('🔍 Error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        })
        toast.error('Failed to load prescriptions')
        setPrescriptions([])
        setFilteredPrescriptions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrescriptions()
  }, [])

  // Filter prescriptions based on status and search term
  useEffect(() => {
    let filtered = prescriptions

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(prescription => prescription.status === filter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(prescription => {
        const medicationName = prescription.medications?.[0]?.name || '';
        const doctorName = prescription.doctor ? `Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}` : '';
        const notes = prescription.generalInstructions || prescription.notes || '';
        const diagnosis = prescription.diagnosis || '';
        
        return medicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
               diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    setFilteredPrescriptions(filtered)
  }, [prescriptions, filter, searchTerm])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-success-500" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-primary-500" />
      case 'expired':
        return <AlertTriangle className="h-5 w-5 text-error-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-warning-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800'
      case 'completed':
        return 'bg-primary-100 text-primary-800'
      case 'expired':
        return 'bg-error-100 text-error-800'
      default:
        return 'bg-warning-100 text-warning-800'
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-success-500 text-white">
            Active
          </span>
        )
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-500 text-white">
            Completed
          </span>
        )
      case 'expired':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-error-500 text-white">
            Expired
          </span>
        )
      default:
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-warning-500 text-white">
            Pending
          </span>
        )
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Ongoing'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isExpiringSoon = (endDate) => {
    if (!endDate) return false
    const end = new Date(endDate)
    const today = new Date()
    const diffTime = end - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 3 && diffDays > 0
  }

  // Download prescription as PDF/text
  const handleDownloadPrescription = (prescription) => {
    const prescriptionText = `
PRESCRIPTION DETAILS
====================

Prescription Number: ${prescription.prescriptionNumber || 'N/A'}
Date: ${new Date(prescription.createdAt).toLocaleDateString()}
Doctor: ${prescription.doctor ? `Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}` : 'Unknown Doctor'}
Status: ${prescription.status || 'active'}

PATIENT INFORMATION
===================
Valid Until: ${prescription.validUntil ? new Date(prescription.validUntil).toLocaleDateString() : 'N/A'}

DIAGNOSIS
=========
${prescription.diagnosis || 'No diagnosis provided'}

MEDICATIONS
===========
${prescription.medications?.map((med, index) => `
${index + 1}. ${med.name || 'Unknown medication'}
   Dosage: ${med.dosage || 'Not specified'}
   Frequency: ${med.frequency || 'Not specified'}
   Duration: ${med.duration || 'Not specified'}
   Instructions: ${med.instructions || 'No specific instructions'}
`).join('') || 'No medications listed'}

ADDITIONAL NOTES
================
${prescription.generalInstructions || prescription.notes || 'No additional notes'}

DIGITAL SIGNATURE
=================
${prescription.digitalSignature || 'N/A'}
    `.trim()

    // Create and download the file
    const blob = new Blob([prescriptionText], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `prescription-${prescription.prescriptionNumber || Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    toast.success('Prescription downloaded successfully!')
  }

  // Export all prescriptions
  const handleExportAll = () => {
    if (prescriptions.length === 0) {
      toast.error('No prescriptions to export')
      return
    }

    const allPrescriptionsText = `
MY PRESCRIPTIONS EXPORT
=======================
Export Date: ${new Date().toLocaleDateString()}
Total Prescriptions: ${prescriptions.length}

${prescriptions.map((prescription, index) => `
PRESCRIPTION ${index + 1}
${'='.repeat(20)}

Prescription Number: ${prescription.prescriptionNumber || 'N/A'}
Date: ${new Date(prescription.createdAt).toLocaleDateString()}
Doctor: ${prescription.doctor ? `Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}` : 'Unknown Doctor'}
Status: ${prescription.status || 'active'}
Valid Until: ${prescription.validUntil ? new Date(prescription.validUntil).toLocaleDateString() : 'N/A'}

Diagnosis: ${prescription.diagnosis || 'No diagnosis provided'}

Medications:
${prescription.medications?.map((med, medIndex) => `
  ${medIndex + 1}. ${med.name || 'Unknown medication'}
     Dosage: ${med.dosage || 'Not specified'}
     Frequency: ${med.frequency || 'Not specified'}
     Duration: ${med.duration || 'Not specified'}
     Instructions: ${med.instructions || 'No specific instructions'}
`).join('') || '  No medications listed'}

Notes: ${prescription.generalInstructions || prescription.notes || 'No additional notes'}

`).join('\n')}
    `.trim()

    const blob = new Blob([allPrescriptionsText], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `all-prescriptions-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    toast.success('All prescriptions exported successfully!')
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
          <h1 className="text-3xl font-bold text-white">My Prescriptions</h1>
          <p className="mt-2 text-primary-300">Manage your medications and prescriptions</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-all duration-200" onClick={handleExportAll}>
            <Download className="w-4 h-4 mr-2" />
            Export All
          </button>
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
              placeholder="Search medications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All', count: prescriptions.length },
              { key: 'active', label: 'Active', count: prescriptions.filter(p => p.status === 'active').length },
              { key: 'completed', label: 'Completed', count: prescriptions.filter(p => p.status === 'completed').length },
              { key: 'expired', label: 'Expired', count: prescriptions.filter(p => p.status === 'expired').length }
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-300 text-sm font-medium">Total Medications</p>
              <p className="text-3xl font-bold text-white mt-2">
                {prescriptions.reduce((sum, p) => sum + (p.medications?.length || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-300 text-sm font-medium">Active Medications</p>
              <p className="text-3xl font-bold text-white mt-2">
                {prescriptions.filter(p => p.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-300 text-sm font-medium">Refills Available</p>
              <p className="text-3xl font-bold text-white mt-2">
                {prescriptions.reduce((sum, p) => sum + (p.refillsRemaining || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-300 text-sm font-medium">Expiring Soon</p>
              <p className="text-3xl font-bold text-white mt-2">
                {prescriptions.filter(p => {
                  if (!p.validUntil) return false;
                  const validUntil = new Date(p.validUntil);
                  const today = new Date();
                  const diffTime = validUntil - today;
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 7 && diffDays > 0;
                }).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-12 text-center border border-primary-600">
            <Pill className="w-16 h-16 text-primary-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No prescriptions found</h3>
            <p className="text-primary-300 mb-6">
              {filter === 'all' 
                ? "You don't have any prescriptions yet." 
                : `No ${filter} prescriptions found.`}
            </p>
          </div>
        ) : (
          filteredPrescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {prescription.medications?.[0]?.name || 'No medication name'}
                      </h3>
                      <p className="text-primary-300 text-sm mb-2">
                        {prescription.medications?.[0]?.dosage || 'No dosage'} - {prescription.medications?.[0]?.frequency || 'No frequency'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-primary-300">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {prescription.doctor ? `Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}` : 'Unknown Doctor'}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(prescription.createdAt || prescription.prescribedDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(prescription.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center text-primary-300">
                        <span className="font-medium text-white">Duration:</span>
                        <span className="ml-2">{prescription.medications?.[0]?.duration || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center text-primary-300">
                        <span className="font-medium text-white">Prescription #:</span>
                        <span className="ml-2">{prescription.prescriptionNumber || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-primary-300">
                        <span className="font-medium text-white">Status:</span>
                        <span className="ml-2 capitalize">{prescription.status || 'active'}</span>
                      </div>
                      {prescription.validUntil && (
                        <div className="flex items-center text-primary-300">
                          <span className="font-medium text-white">Valid Until:</span>
                          <span className="ml-2">{new Date(prescription.validUntil).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-primary-700 bg-opacity-50 rounded-lg">
                    <p className="text-sm text-primary-300">
                      <span className="font-medium text-white">Instructions:</span> {prescription.medications?.[0]?.instructions || 'No specific instructions'}
                    </p>
                    {prescription.notes && (
                      <p className="text-sm text-primary-300 mt-2">
                        <span className="font-medium text-white">Notes:</span> {prescription.generalInstructions || prescription.notes}
                      </p>
                    )}
                    {prescription.diagnosis && (
                      <p className="text-sm text-primary-300 mt-2">
                        <span className="font-medium text-white">Diagnosis:</span> {prescription.diagnosis}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2 lg:w-32">
                  {prescription.status === 'active' && prescription.refillsRemaining > 0 && (
                    <button className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors text-sm font-medium">
                      Request Refill
                    </button>
                  )}
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium" onClick={() => handleDownloadPrescription(prescription)}>
                    Download
                  </button>
                  {prescription.status === 'active' && (
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors text-sm font-medium">
                      Set Reminder
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Prescriptions
