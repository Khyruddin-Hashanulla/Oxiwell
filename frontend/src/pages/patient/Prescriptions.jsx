import React, { useState, useEffect } from 'react'
import { Pill, Clock, User, Calendar, AlertTriangle, CheckCircle, Download, Search, Filter } from 'lucide-react'
import { patientsAPI } from '../../services/api'
import { toast } from 'react-hot-toast'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

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
    try {
      console.log('🔍 Generating professional prescription PDF:', prescription)
      console.log('🔍 Prescription data structure:', {
        patient: prescription.patient,
        doctor: prescription.doctor,
        medications: prescription.medications,
        diagnosis: prescription.diagnosis,
        recommendedTests: prescription.recommendedTests,
        generalInstructions: prescription.generalInstructions
      })
      
      // Create new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      const pageWidth = doc.internal.pageSize.width
      const pageHeight = doc.internal.pageSize.height
      let yPosition = 20
      
      // Colors
      const primaryBlue = [41, 128, 185]
      const darkGray = [52, 73, 94]
      const lightGray = [149, 165, 166]
      const medicalGreen = [39, 174, 96]
      
      // Header - Hospital/Clinic Information
      // Use real doctor workplace information instead of hardcoded data
      // Get primary workplace or first available workplace
      const primaryWorkplace = prescription.doctor?.workplaces?.find(w => w.isPrimary) || 
                              prescription.doctor?.workplaces?.[0]
      
      const workplaceName = primaryWorkplace?.hospital?.name || 'OXIWELL HEALTH CENTER'
      const workplaceAddress = primaryWorkplace?.address 
        ? `${primaryWorkplace.address.street}, ${primaryWorkplace.address.city}, ${primaryWorkplace.address.state} - ${primaryWorkplace.address.zipCode}`
        : '123 Medical District, Healthcare City, State - 123456'
      const workplacePhone = primaryWorkplace?.phone || primaryWorkplace?.hospital?.phone || '+91-1234567890'
      const workplaceEmail = primaryWorkplace?.hospital?.email || 'contact@oxiwell.com'
      
      doc.setFillColor(...primaryBlue)
      doc.rect(0, 0, pageWidth, 35, 'F')
      
      // Hospital Logo Area (placeholder)
      doc.setFillColor(255, 255, 255)
      doc.circle(25, 17.5, 8, 'F')
      doc.setTextColor(...primaryBlue)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(workplaceName.substring(0, 2).toUpperCase(), 21, 20)
      
      // Hospital Name and Details
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text(workplaceName.toUpperCase(), 40, 15)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Advanced Healthcare & Medical Services', 40, 21)
      doc.text(`Email: ${workplaceEmail} | Phone: ${workplacePhone}`, 40, 26)
      doc.text(`Address: ${workplaceAddress}`, 40, 31)
      
      yPosition = 45
      
      // Doctor Information Section
      doc.setFillColor(248, 249, 250)
      doc.rect(10, yPosition, pageWidth - 20, 25, 'F')
      doc.setDrawColor(...lightGray)
      doc.rect(10, yPosition, pageWidth - 20, 25, 'S')
      
      yPosition += 8
      doc.setTextColor(...darkGray)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      // Handle different possible doctor data structures
      const doctorFirstName = prescription.doctor?.firstName || 'Unknown'
      const doctorLastName = prescription.doctor?.lastName || ''
      const doctorName = `Dr. ${doctorFirstName} ${doctorLastName}`.trim()
      doc.text(doctorName, 15, yPosition)
      
      yPosition += 6
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      // Get doctor information with fallbacks
      const doctorSpecialization = prescription.doctor?.specialization || 'General Medicine'
      const doctorRegNo = prescription.doctor?.medicalRegistrationNumber || 'Not Available'
      const doctorLicense = prescription.doctor?.licenseNumber || 'Not Available'
      
      // Get doctor qualifications
      const doctorDegrees = prescription.doctor?.qualifications?.length > 0 
        ? prescription.doctor.qualifications.map(q => q.degree).join(', ')
        : `MBBS, MD ${doctorSpecialization}`
      
      const doctorInfo = [
        `${doctorSpecialization} Specialist`,
        doctorDegrees,
        `Reg. No: ${doctorRegNo}`,
        `License: ${doctorLicense}`
      ]
      
      doctorInfo.forEach((info, index) => {
        doc.text(info, 15, yPosition + (index * 4))
      })
      
      // Digital Signature Area
      doc.setFontSize(12)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(...primaryBlue)
      doc.text('Dr. Signature', pageWidth - 50, yPosition + 5)
      doc.setDrawColor(...primaryBlue)
      doc.line(pageWidth - 50, yPosition + 7, pageWidth - 15, yPosition + 7)
      
      yPosition += 35
      
      // Prescription Header
      doc.setFillColor(...medicalGreen)
      doc.rect(10, yPosition, pageWidth - 20, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('MEDICAL PRESCRIPTION', 15, yPosition + 5.5)
      
      yPosition += 15
      
      // Patient and Prescription Details
      doc.setTextColor(...darkGray)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      // Get patient information with fallbacks
      const patientFirstName = prescription.patient?.firstName || 'Unknown'
      const patientLastName = prescription.patient?.lastName || ''
      const patientFullName = `${patientFirstName} ${patientLastName}`.trim()
      const patientId = prescription.patient?._id?.slice(-8) || 'Not Available'
      
      // Calculate age from dateOfBirth
      let patientAge = 'Not Available'
      if (prescription.patient?.dateOfBirth) {
        const today = new Date()
        const birthDate = new Date(prescription.patient.dateOfBirth)
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        patientAge = age
      }
      
      const patientGender = prescription.patient?.gender || 'Not Available'
      
      const prescriptionDetails = [
        [`Patient Name:`, patientFullName],
        [`Patient ID:`, patientId],
        [`Age/Gender:`, `${patientAge} / ${patientGender}`],
        [`Prescription #:`, prescription.prescriptionNumber || prescription._id?.slice(-8) || 'Not Available'],
        [`Date:`, new Date(prescription.createdAt).toLocaleDateString('en-IN')],
        [`Follow-up:`, prescription.followUpDate ? new Date(prescription.followUpDate).toLocaleDateString('en-IN') : 'As needed']
      ]
      
      prescriptionDetails.forEach(([label, value], index) => {
        const xPos = index % 2 === 0 ? 15 : pageWidth / 2 + 5
        const yPos = yPosition + Math.floor(index / 2) * 6
        doc.setFont('helvetica', 'bold')
        doc.text(label, xPos, yPos)
        doc.setFont('helvetica', 'normal')
        doc.text(value, xPos + 35, yPos)
      })
      
      yPosition += 25
      
      // Diagnosis Section
      const diagnosisText = prescription.diagnosis || prescription.caseHistory || prescription.symptoms
      if (diagnosisText) {
        doc.setFillColor(52, 152, 219)
        doc.rect(10, yPosition, pageWidth - 20, 6, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('DIAGNOSIS', 15, yPosition + 4)
        
        yPosition += 10
        doc.setTextColor(...darkGray)
        doc.setFont('helvetica', 'normal')
        const diagnosisLines = doc.splitTextToSize(diagnosisText, pageWidth - 30)
        doc.text(diagnosisLines, 15, yPosition)
        yPosition += diagnosisLines.length * 4 + 5
      }
      
      // Medications Section
      if (prescription.medications && prescription.medications.length > 0) {
        doc.setFillColor(231, 76, 60)
        doc.rect(10, yPosition, pageWidth - 20, 6, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(`MEDICATIONS (${prescription.medications.length})`, 15, yPosition + 4)
        
        yPosition += 12
        
        // Medications Table
        const medicationData = prescription.medications.map((med, index) => [
          `${index + 1}.`,
          med.name || med.medicationName || 'Unknown',
          med.dosage || med.dose || 'Not specified',
          med.frequency === 'custom' && med.customFrequency ? med.customFrequency : med.frequency || 'N/A',
          med.duration || 'Not specified',
          med.instructions || 'As directed'
        ])
        
        autoTable(doc, {
          startY: yPosition,
          head: [['#', 'Medicine Name', 'Dosage', 'Frequency', 'Duration', 'Instructions']],
          body: medicationData,
          theme: 'grid',
          headStyles: { fillColor: [231, 76, 60], textColor: 255, fontSize: 9, fontStyle: 'bold' },
          bodyStyles: { fontSize: 8, textColor: [52, 73, 94] },
          alternateRowStyles: { fillColor: [248, 249, 250] },
          columnStyles: {
            0: { cellWidth: 8 },
            1: { cellWidth: 40 },
            2: { cellWidth: 25 },
            3: { cellWidth: 35 },
            4: { cellWidth: 20 },
            5: { cellWidth: 50 }
          },
          margin: { left: 15, right: 15 }
        })
        
        yPosition = (doc.lastAutoTable && doc.lastAutoTable.finalY) || yPosition + 50
      }
      
      // Recommended Tests Section
      if (prescription.recommendedTests && prescription.recommendedTests.length > 0) {
        doc.setFillColor(142, 68, 173)
        doc.rect(10, yPosition, pageWidth - 20, 6, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(`RECOMMENDED TESTS (${prescription.recommendedTests.length})`, 15, yPosition + 4)
        
        yPosition += 12
        
        const testData = prescription.recommendedTests.map((test, index) => [
          `${index + 1}.`,
          test.testName || test.name || 'Unknown Test',
          test.urgency || 'Routine',
          test.instructions || 'Standard procedure'
        ])
        
        autoTable(doc, {
          startY: yPosition,
          head: [['#', 'Test Name', 'Urgency', 'Instructions']],
          body: testData,
          theme: 'grid',
          headStyles: { fillColor: [142, 68, 173], textColor: 255, fontSize: 9, fontStyle: 'bold' },
          bodyStyles: { fontSize: 8, textColor: [52, 73, 94] },
          alternateRowStyles: { fillColor: [248, 249, 250] },
          columnStyles: {
            0: { cellWidth: 8 },
            1: { cellWidth: 60 },
            2: { cellWidth: 25 },
            3: { cellWidth: 85 }
          },
          margin: { left: 15, right: 15 }
        })
        
        yPosition = (doc.lastAutoTable && doc.lastAutoTable.finalY) || yPosition + 50
      }
      
      // General Instructions
      const instructionsText = prescription.generalInstructions || prescription.notes || prescription.additionalNotes
      if (instructionsText) {
        doc.setFillColor(243, 156, 18)
        doc.rect(10, yPosition, pageWidth - 20, 6, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('GENERAL INSTRUCTIONS', 15, yPosition + 4)
        
        yPosition += 10
        doc.setTextColor(...darkGray)
        doc.setFont('helvetica', 'normal')
        const instructionLines = doc.splitTextToSize(instructionsText, pageWidth - 30)
        doc.text(instructionLines, 15, yPosition)
        yPosition += instructionLines.length * 4 + 10
      }
      
      // Footer
      const footerY = pageHeight - 25
      doc.setDrawColor(...lightGray)
      doc.line(15, footerY, pageWidth - 15, footerY)
      
      doc.setTextColor(...lightGray)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('This is a computer-generated prescription and is valid without signature.', 15, footerY + 5)
      doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 15, footerY + 10)
      doc.text('For any queries, contact: support@oxiwell.com | Emergency: +91-9876543210', 15, footerY + 15)
      
      // Verification QR Code area (placeholder)
      doc.setDrawColor(...primaryBlue)
      doc.rect(pageWidth - 35, footerY + 2, 20, 20, 'S')
      doc.setTextColor(...primaryBlue)
      doc.setFontSize(6)
      doc.text('QR Code', pageWidth - 30, footerY + 8)
      doc.text('Verification', pageWidth - 32, footerY + 12)
      doc.text(`ID: ${prescription._id?.slice(-6) || '123456'}`, pageWidth - 32, footerY + 16)
      
      // Save the PDF
      const fileName = `Prescription_${prescription.prescriptionNumber || prescription._id?.slice(-8) || 'Unknown'}_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      
      toast.success('Professional prescription PDF downloaded successfully!')
      
    } catch (error) {
      console.error('❌ Error generating prescription PDF:', error)
      console.error('❌ Prescription object that failed:', prescription)
      toast.error('Failed to generate prescription PDF')
    }
  }

  // Set medication reminder
  const handleSetReminder = (prescription) => {
    try {
      // For now, we'll create a simple browser notification reminder
      // In a full implementation, this would integrate with a notification service
      
      if (!('Notification' in window)) {
        toast.error('This browser does not support notifications')
        return
      }

      if (Notification.permission === 'denied') {
        toast.error('Notifications are blocked. Please enable them in browser settings.')
        return
      }

      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            setupReminder(prescription)
          } else {
            toast.error('Notification permission denied')
          }
        })
      } else {
        setupReminder(prescription)
      }
    } catch (error) {
      console.error('Error setting reminder:', error)
      toast.error('Failed to set reminder')
    }
  }

  const setupReminder = (prescription) => {
    // Get the first medication for the reminder
    const firstMedication = prescription.medications?.[0]
    if (!firstMedication) {
      toast.error('No medications found in this prescription')
      return
    }

    // Create a simple reminder notification
    const reminderText = `Time to take your medication: ${firstMedication.name}`
    
    // Show immediate confirmation
    new Notification('Reminder Set!', {
      body: `Reminder set for ${firstMedication.name}. You'll be notified about your medication schedule.`,
      icon: '/favicon.ico'
    })

    // Store reminder in localStorage for persistence (in a real app, this would be stored in backend)
    const reminders = JSON.parse(localStorage.getItem('medicationReminders') || '[]')
    const newReminder = {
      id: Date.now(),
      prescriptionId: prescription._id,
      medicationName: firstMedication.name,
      frequency: firstMedication.frequency,
      dosage: firstMedication.dosage,
      createdAt: new Date().toISOString()
    }
    
    reminders.push(newReminder)
    localStorage.setItem('medicationReminders', JSON.stringify(reminders))
    
    toast.success(`Reminder set for ${firstMedication.name}!`)
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
                        Prescription #{prescription.prescriptionNumber || 'N/A'}
                      </h3>
                      <p className="text-primary-300 text-sm mb-2">
                        {prescription.medications?.length || 0} medication(s) prescribed
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

                  {/* Diagnosis */}
                  {prescription.diagnosis && (
                    <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Diagnosis</h4>
                      <p className="text-sm text-blue-200">{prescription.diagnosis}</p>
                    </div>
                  )}

                  {/* Medications */}
                  {prescription.medications && prescription.medications.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-white mb-3">Medications ({prescription.medications.length})</h4>
                      <div className="space-y-3">
                        {prescription.medications.map((medication, index) => (
                          <div key={index} className="p-3 bg-primary-700 bg-opacity-50 rounded-lg border border-primary-600">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-white">{medication.name || 'Unnamed medication'}</h5>
                              <span className="text-xs text-primary-300 bg-primary-800 px-2 py-1 rounded">#{index + 1}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                              <div>
                                <span className="text-primary-400">Dosage:</span>
                                <span className="ml-2 text-white">{medication.dosage || 'Not specified'}</span>
                              </div>
                              <div>
                                <span className="text-primary-400">Frequency:</span>
                                <span className="ml-2 text-white">
                                  {medication.frequency === 'custom' && medication.customFrequency 
                                    ? `Custom: ${medication.customFrequency}`
                                    : medication.frequency || 'Not specified'}
                                </span>
                              </div>
                              <div>
                                <span className="text-primary-400">Duration:</span>
                                <span className="ml-2 text-white">{medication.duration || 'Not specified'}</span>
                              </div>
                            </div>
                            {medication.instructions && (
                              <div className="mt-2 pt-2 border-t border-primary-600">
                                <span className="text-primary-400 text-sm">Instructions:</span>
                                <p className="text-sm text-white mt-1">{medication.instructions}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Investigations */}
                  {prescription.recommendedTests && prescription.recommendedTests.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-white mb-3">Recommended Tests ({prescription.recommendedTests.length})</h4>
                      <div className="space-y-2">
                        {prescription.recommendedTests.map((test, index) => (
                          <div key={index} className="p-3 bg-green-900/30 border border-green-700 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="font-medium text-white">{test.testName || 'Unnamed test'}</h5>
                                {test.instructions && (
                                  <p className="text-sm text-green-200 mt-1">{test.instructions}</p>
                                )}
                              </div>
                              {test.urgency && (
                                <span className={`text-xs px-2 py-1 rounded ${
                                  test.urgency === 'urgent' ? 'bg-red-600 text-white' :
                                  test.urgency === 'routine' ? 'bg-blue-600 text-white' :
                                  'bg-gray-600 text-white'
                                }`}>
                                  {test.urgency}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* General Instructions */}
                  {prescription.generalInstructions && (
                    <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                      <h4 className="font-medium text-white mb-2">General Instructions</h4>
                      <p className="text-sm text-yellow-200">{prescription.generalInstructions}</p>
                    </div>
                  )}

                  {/* Prescription Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center text-primary-300">
                        <span className="font-medium text-white">Status:</span>
                        <span className="ml-2 capitalize">{prescription.status || 'active'}</span>
                      </div>
                      <div className="flex items-center text-primary-300">
                        <span className="font-medium text-white">Created:</span>
                        <span className="ml-2">{new Date(prescription.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {prescription.followUpDate && (
                        <div className="flex items-center text-primary-300">
                          <span className="font-medium text-white">Follow-up:</span>
                          <span className="ml-2">{new Date(prescription.followUpDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {prescription.validUntil && (
                        <div className="flex items-center text-primary-300">
                          <span className="font-medium text-white">Valid Until:</span>
                          <span className="ml-2">{new Date(prescription.validUntil).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
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
                    <button 
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors text-sm font-medium"
                      onClick={() => handleSetReminder(prescription)}
                    >
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
