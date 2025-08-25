import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Star, 
  ArrowLeft, 
  ArrowRight,
  Search,
  Filter,
  Building2,
  Stethoscope,
  Heart,
  CheckCircle,
  AlertCircle,
  CreditCard
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { appointmentsAPI } from '../../services/api'
import BookingConfirmation from '../../components/BookingConfirmation'

const AppointmentBooking = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  
  // Helper function to format time
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Booking flow state
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [bookingData, setBookingData] = useState({
    reason: '',
    symptoms: [],
    notes: '',
    customReason: ''
  })
  const [confirmedAppointment, setConfirmedAppointment] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  
  // Data state
  const [doctors, setDoctors] = useState([])
  const [availableDates, setAvailableDates] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Filters
  const [filters, setFilters] = useState({
    specialization: '',
    gender: '',
    location: '',
    minRating: ''
  })
  const [searchTerm, setSearchTerm] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm()

  // Check if this is a reschedule operation
  const rescheduleId = searchParams.get('reschedule')

  // Add error state for better debugging
  const [error, setError] = useState(null)

  // Step 1: Load available doctors
  useEffect(() => {
    if (currentStep === 1) {
      loadAvailableDoctors()
    }
  }, [currentStep, filters])

  // Step 3: Load available dates when doctor and hospital are selected
  useEffect(() => {
    if (currentStep === 3 && selectedDoctor && selectedHospital) {
      loadAvailableDates()
    }
  }, [currentStep, selectedDoctor, selectedHospital])

  // Step 4: Load available slots when date is selected
  useEffect(() => {
    if (currentStep === 4 && selectedDoctor && selectedHospital && selectedDate) {
      loadAvailableSlots()
    }
  }, [currentStep, selectedDoctor, selectedHospital, selectedDate])

  const loadAvailableDoctors = async () => {
    try {
      setIsLoading(true)
      setError(null) // Clear any previous errors
      const queryParams = new URLSearchParams()
      
      if (filters.specialization) queryParams.append('specialization', filters.specialization)
      if (filters.gender) queryParams.append('gender', filters.gender)
      if (filters.location) queryParams.append('location', filters.location)
      if (filters.minRating) queryParams.append('minRating', filters.minRating)

      console.log('🔍 Loading available doctors with params:', queryParams.toString())
      const response = await appointmentsAPI.getAvailableDoctors(queryParams.toString())
      
      console.log('📊 Available doctors API response:', response.data)
      
      if (response.data.status === 'success') {
        let doctorList = response.data.data.doctors
        
        console.log('👨‍⚕️ Raw doctor list:', doctorList.length, 'doctors')
        doctorList.forEach((doctor, index) => {
          console.log(`Doctor ${index + 1}:`, {
            name: `${doctor.firstName} ${doctor.lastName}`,
            specialization: doctor.specialization,
            workplacesCount: doctor.workplaces?.length || 0,
            hasWorkplaces: !!doctor.workplaces?.length,
            workplaces: doctor.workplaces?.map(wp => ({
              hospitalName: wp.hospital?.name || 'No hospital name',
              hospitalId: wp.hospital?._id || wp.hospital,
              consultationFee: wp.consultationFee
            }))
          })
        })
        
        // Apply search filter
        if (searchTerm) {
          doctorList = doctorList.filter(doctor => 
            doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
        
        console.log('✅ Filtered doctor list:', doctorList.length, 'doctors')
        setDoctors(doctorList)
      } else {
        throw new Error(response.data.message || 'Failed to load doctors')
      }
    } catch (error) {
      console.error('❌ Error loading doctors:', error)
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      setError('Failed to load available doctors. Please refresh the page and try again.')
      toast.error('Failed to load available doctors')
    } finally {
      setIsLoading(false)
    }
  }

  const loadDoctorDetails = async (doctorId) => {
    try {
      setIsLoading(true)
      console.log('🔍 Loading doctor details for ID:', doctorId)
      
      const response = await appointmentsAPI.getDoctorDetails(doctorId)
      
      console.log('📊 Doctor details API response:', response.data)
      
      if (response.data.status === 'success') {
        const doctorDetails = response.data.data.doctor
        
        console.log('👨‍⚕️ Doctor details loaded:', {
          name: `${doctorDetails.firstName} ${doctorDetails.lastName}`,
          specialization: doctorDetails.specialization,
          workplacesCount: doctorDetails.workplaces?.length || 0,
          workplaces: doctorDetails.workplaces?.map(wp => ({
            hospitalName: wp.hospital?.name || 'No hospital name',
            hospitalId: wp.hospital?._id || wp.hospital,
            consultationFee: wp.consultationFee,
            hasHospitalData: !!wp.hospital
          }))
        })
        
        // Validate that doctor has workplaces
        if (!doctorDetails.workplaces || doctorDetails.workplaces.length === 0) {
          console.warn('⚠️ Doctor has no workplaces configured')
          toast.error('This doctor has no available locations. Please choose another doctor.')
          return null
        }
        
        // Validate that workplaces have hospital data
        const validWorkplaces = doctorDetails.workplaces.filter(wp => wp.hospital && (wp.hospital._id || wp.hospital.name))
        if (validWorkplaces.length === 0) {
          console.warn('⚠️ Doctor workplaces have no valid hospital data')
          toast.error('Hospital information not available for this doctor. Please choose another doctor.')
          return null
        }
        
        // Update doctor with only valid workplaces
        if (validWorkplaces.length < doctorDetails.workplaces.length) {
          console.warn(`⚠️ Filtered out ${doctorDetails.workplaces.length - validWorkplaces.length} invalid workplaces`)
          doctorDetails.workplaces = validWorkplaces
        }
        
        return doctorDetails
      } else {
        throw new Error(response.data.message || 'Failed to load doctor details')
      }
    } catch (error) {
      console.error('❌ Error loading doctor details:', error)
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      toast.error('Failed to load doctor details')
      return null // Explicitly return null on error
    } finally {
      setIsLoading(false)
    }
  }

  const loadAvailableDates = async () => {
    try {
      setIsLoading(true)
      
      // Get hospital ID - use selectedHospital._id if available, otherwise use first workplace hospital ID
      let hospitalId = selectedHospital?._id;
      if (!hospitalId && selectedDoctor?.workplaces?.length > 0) {
        // Find first workplace with a valid hospital ID
        const workplaceWithHospital = selectedDoctor.workplaces.find(wp => wp.hospital?._id);
        hospitalId = workplaceWithHospital?.hospital?._id;
      }
      
      if (!hospitalId) {
        throw new Error('No valid hospital ID found for this doctor');
      }
      
      console.log('📅 Loading available dates for:', {
        doctorId: selectedDoctor._id,
        hospitalId: hospitalId,
        doctorName: `${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
        hospitalName: selectedHospital?.name || 'Doctor Clinic'
      })
      
      const response = await appointmentsAPI.getAvailableDates(
        selectedDoctor._id, 
        hospitalId
      )
      
      console.log('📅 Available dates API response:', response.data)
      
      if (response.data.status === 'success') {
        const dates = response.data.data.availableDates || []
        console.log('✅ Available dates loaded:', dates.length, 'dates')
        setAvailableDates(dates)
      } else {
        throw new Error(response.data.message || 'Failed to load available dates')
      }
    } catch (error) {
      console.error('❌ Error loading available dates:', error)
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      toast.error('Failed to load available dates')
      setAvailableDates([]) // Set empty array on error
    } finally {
      setIsLoading(false)
    }
  }

  const loadAvailableSlots = async () => {
    try {
      setIsLoading(true)
      
      // Get hospital ID - use selectedHospital._id if available, otherwise use first workplace hospital ID
      let hospitalId = selectedHospital?._id;
      if (!hospitalId && selectedDoctor?.workplaces?.length > 0) {
        // Find first workplace with a valid hospital ID
        const workplaceWithHospital = selectedDoctor.workplaces.find(wp => wp.hospital?._id);
        hospitalId = workplaceWithHospital?.hospital?._id;
      }
      
      if (!hospitalId) {
        throw new Error('No valid hospital ID found for this doctor');
      }
      
      console.log('🕐 Loading available slots for:', {
        doctor: selectedDoctor.firstName + ' ' + selectedDoctor.lastName,
        hospital: selectedHospital?.name || 'Doctor Clinic',
        hospitalId: hospitalId,
        date: selectedDate
      })
      
      // Add cache-busting timestamp to prevent stale data
      const timestamp = new Date().getTime()
      const response = await appointmentsAPI.getAvailableSlots(
        selectedDoctor._id,
        hospitalId,
        selectedDate
      )
      
      console.log('🕐 Available slots API response:', response.data)
      console.log('🕐 Raw response status:', response.status)
      console.log('🕐 Response headers:', response.headers)
      
      if (response.data.status === 'success') {
        const slots = response.data.data.availableSlots || []
        console.log('✅ Available slots loaded:', slots.length, 'slots')
        console.log('✅ Slot details:', slots.map(slot => ({
          time: slot.time,
          formatted: formatTime(slot.time),
          available: slot.available,
          fee: slot.consultationFee
        })))
        setAvailableSlots(slots)
      } else {
        throw new Error(response.data.message || 'Failed to load available slots')
      }
    } catch (error) {
      console.error('❌ Error loading available slots:', error)
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      toast.error('Failed to load available time slots')
      setAvailableSlots([]) // Set empty array on error
    } finally {
      setIsLoading(false)
    }
  }

  const handleDoctorSelect = async (doctor) => {
    try {
      console.log('🎯 Doctor selected:', {
        name: `${doctor.firstName} ${doctor.lastName}`,
        id: doctor._id,
        workplacesCount: doctor.workplaces?.length || 0
      })
      
      // First, try to load detailed doctor information
      const doctorDetails = await loadDoctorDetails(doctor._id)
      
      if (doctorDetails) {
        console.log('✅ Using detailed doctor data')
        setSelectedDoctor(doctorDetails)
        setCurrentStep(2)
      } else {
        // Fallback: use the basic doctor data from the list if detailed loading fails
        console.warn('⚠️ Using fallback doctor data due to API failure')
        
        // Validate basic doctor data has workplaces
        if (!doctor.workplaces || doctor.workplaces.length === 0) {
          toast.error('This doctor has no available locations. Please choose another doctor.')
          return
        }
        
        // Filter valid workplaces in fallback data
        const validWorkplaces = doctor.workplaces.filter(wp => wp.hospital && (wp.hospital._id || wp.hospital.name))
        if (validWorkplaces.length === 0) {
          toast.error('Hospital information not available for this doctor. Please choose another doctor.')
          return
        }
        
        doctor.workplaces = validWorkplaces
        setSelectedDoctor(doctor)
        setCurrentStep(2)
      }
    } catch (error) {
      console.error('❌ Error in handleDoctorSelect:', error)
      toast.error('Error selecting doctor. Please try again.')
      // Reset loading state
      setIsLoading(false)
    }
  }

  const handleHospitalSelect = (hospital) => {
    setSelectedHospital(hospital)
    setCurrentStep(3)
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setCurrentStep(4)
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
    setCurrentStep(5)
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Get hospital ID - use selectedHospital._id if available, otherwise use first workplace hospital ID
      let hospitalId = selectedHospital?._id;
      if (!hospitalId && selectedDoctor?.workplaces?.length > 0) {
        // Find first workplace with a valid hospital ID
        const workplaceWithHospital = selectedDoctor.workplaces.find(wp => wp.hospital?._id);
        hospitalId = workplaceWithHospital?.hospital?._id;
      }
      
      if (!hospitalId) {
        throw new Error('No valid hospital ID found for this doctor');
      }
      
      const appointmentData = {
        doctor: selectedDoctor._id,
        hospital: hospitalId,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        reason: bookingData.reason === 'Other' ? bookingData.customReason : bookingData.reason,
        symptoms: bookingData.symptoms,
        notes: bookingData.notes,
        urgency: bookingData.urgency
      }
      
      let response;
      
      // Check if this is a reschedule operation
      if (rescheduleId) {
        console.log('🔄 Rescheduling appointment:', rescheduleId, appointmentData)
        response = await appointmentsAPI.rescheduleAppointment(rescheduleId, appointmentData)
        toast.success('Appointment rescheduled successfully!')
      } else {
        console.log('📅 Creating new appointment:', appointmentData)
        response = await appointmentsAPI.createAppointment(appointmentData)
        toast.success('Appointment booked successfully!')
      }
      
      // Set the confirmed appointment data for the modal with all required fields
      setConfirmedAppointment({
        ...response.data.data, // Use response.data.data instead of response.data
        doctor: selectedDoctor,
        hospital: selectedHospital,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        reason: bookingData.reason === 'Other' ? bookingData.customReason : bookingData.reason,
        notes: bookingData.notes,
        consultationFee: response.data.data?.consultationFee || selectedHospital?.consultationFee || selectedDoctor?.workplaces?.find(w => w.hospital._id === selectedHospital._id)?.consultationFee || 0
      })
      setShowConfirmation(true)
      
    } catch (error) {
      console.error('Booking error:', error)
      const errorMessage = rescheduleId 
        ? 'Failed to reschedule appointment' 
        : 'Failed to book appointment'
      toast.error(error.response?.data?.message || errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmationClose = () => {
    setShowConfirmation(false)
    setConfirmedAppointment(null)
    // Navigate to appointments page instead of resetting the form
    navigate('/patient/appointments')
  }

  const handleViewAppointments = () => {
    navigate('/patient/appointments')
  }

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      navigate('/patient/dashboard')
    }
  }

  const resetBooking = () => {
    setCurrentStep(1)
    setSelectedDoctor(null)
    setSelectedHospital(null)
    setSelectedDate('')
    setSelectedTime('')
    reset()
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6 sm:mb-8 px-4 overflow-x-auto">
      <div className="flex items-center min-w-max">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${
              step <= currentStep 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-600 text-gray-300'
            }`}>
              {step < currentStep ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : step}
            </div>
            {step < 5 && (
              <div className={`w-8 sm:w-12 h-0.5 sm:h-1 mx-1 sm:mx-2 ${
                step < currentStep ? 'bg-primary-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Select a Doctor</h2>
        <p className="text-gray-300">Choose from our available doctors</p>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Specialization</label>
            <select
              value={filters.specialization}
              onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Specializations</option>
              <option value="cardiology">Cardiology</option>
              <option value="dermatology">Dermatology</option>
              <option value="neurology">Neurology</option>
              <option value="orthopedics">Orthopedics</option>
              <option value="pediatrics">Pediatrics</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
            <select
              value={filters.gender}
              onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Any Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
            <input
              type="text"
              placeholder="City or State"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Doctors List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-300 mt-4">Loading doctors...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300">No doctors found matching your criteria</p>
          </div>
        ) : (
          doctors.map((doctor) => (
            <div
              key={doctor._id}
              onClick={() => handleDoctorSelect(doctor)}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 cursor-pointer hover:bg-white/20 transition-all duration-200 border border-gray-600 hover:border-primary-500"
            >
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>
                  <p className="text-primary-300 text-xs sm:text-sm mb-2 truncate">{doctor.specialization}</p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-300">
                    <div className="flex items-center space-x-1 text-warning-400">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                      <span>{doctor.displayRating?.average?.toFixed(1) || doctor.rating?.average?.toFixed(1) || '4.2'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Stethoscope className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{doctor.experience} years</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 sm:mt-3">
                    <p className="text-xs sm:text-sm text-gray-300">
                      {doctor.workplaces?.length || 0} workplace(s)
                    </p>
                    <p className="text-xs sm:text-sm text-green-400 font-semibold">
                      From ₹{Math.min(...(doctor.workplaces?.map(wp => wp.consultationFee) || [0]))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Select Hospital/Clinic</h2>
        <p className="text-gray-300">Choose where you'd like to meet Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {selectedDoctor?.workplaces?.length > 0 ? (
          selectedDoctor.workplaces.map((workplace, index) => (
            <div
              key={index}
              onClick={() => handleHospitalSelect(workplace.hospital)}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 cursor-pointer hover:bg-white/20 transition-all duration-200 border border-gray-600 hover:border-primary-500"
            >
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2 truncate">
                    {workplace.hospital?.name || 'Hospital Name Not Available'}
                  </h3>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-300">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                      <span className="break-words">
                        {workplace.hospital?.address?.street && workplace.hospital?.address?.city 
                          ? `${workplace.hospital.address.street}, ${workplace.hospital.address.city}`
                          : workplace.hospital?.address?.city || 'Address not available'
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{workplace.hospital?.phone || 'Phone not available'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 flex-shrink-0" />
                      <span>{workplace.hospital?.rating?.average?.toFixed(1) || 'N/A'} rating</span>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-600">
                    <p className="text-green-400 font-semibold text-sm sm:text-base">
                      Consultation Fee: ₹{workplace.consultationFee || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 mb-4">No workplace information available for this doctor</p>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-primary-400 hover:text-primary-300 underline"
            >
              Choose a different doctor
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Select Date</h2>
        <p className="text-gray-300">Choose an available date for your appointment</p>
        <div className="mt-4 p-4 bg-primary-500/10 rounded-lg border border-primary-500/20">
          <p className="text-sm text-primary-300">
            <Calendar className="w-4 h-4 inline mr-2" />
            Available dates for Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName} at {selectedHospital?.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-300 mt-4">Loading available dates...</p>
          </div>
        ) : availableDates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Available Dates</h3>
            <p className="text-gray-300 mb-4">No available dates found for the selected doctor and hospital.</p>
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Choose Different Hospital
            </button>
          </div>
        ) : (
          availableDates.map((dateInfo) => {
            const date = new Date(dateInfo.date)
            const today = new Date()
            const isToday = date.toDateString() === today.toDateString()
            const isTomorrow = date.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString()
            
            return (
              <div
                key={dateInfo.date}
                onClick={() => handleDateSelect(dateInfo.date)}
                className={`bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 cursor-pointer hover:bg-white/20 transition-all duration-200 border border-gray-600 hover:border-primary-500 text-center group ${
                  selectedDate === dateInfo.date ? 'bg-primary-500/20 border-primary-500' : ''
                }`}
              >
                <div className="space-y-1 sm:space-y-2">
                  <div className="text-xl sm:text-2xl font-bold text-white group-hover:text-primary-300 transition-colors">
                    {date.getDate()}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-300 capitalize">
                    {dateInfo.dayOfWeek}
                  </div>
                  <div className="text-xs text-gray-400">
                    {date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                  {isToday && (
                    <div className="text-xs bg-success-500/20 text-success-400 px-2 py-1 rounded-full">
                      Today
                    </div>
                  )}
                  {isTomorrow && (
                    <div className="text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded-full">
                      Tomorrow
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
      
      {availableDates.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Click on a date to view available time slots
          </p>
        </div>
      )}
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Select Time</h2>
        <p className="text-gray-300">Choose an available time slot</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-300 mt-2">Loading time slots...</p>
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300">No available time slots for this date</p>
          </div>
        ) : (
          availableSlots.map((slot) => (
            <div
              key={slot.time}
              onClick={() => handleTimeSelect(slot.time)}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 cursor-pointer hover:bg-white/20 transition-all duration-200 border border-gray-600 hover:border-primary-500 text-center"
            >
              <div className="text-white font-semibold text-sm sm:text-base">
                {formatTime(slot.time)}
              </div>
              <div className="text-xs text-success-400 mt-1">
                Available
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderStep5 = () => {
    const consultationFee = selectedDoctor?.workplaces?.find(w => 
      w.hospitalId === selectedHospital._id || w.hospital?._id === selectedHospital._id
    )?.consultationFee || selectedHospital?.consultationFee || 0

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Confirm Your Appointment</h2>
          <p className="text-gray-300">Review your appointment details and provide additional information</p>
        </div>

        {/* Appointment Summary */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-600">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Appointment Summary</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400 mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-300 text-xs sm:text-sm">Doctor</p>
                  <p className="text-white font-semibold text-sm sm:text-base truncate">
                    Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </p>
                  <p className="text-primary-300 text-xs sm:text-sm truncate">{selectedDoctor.specialization}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400 mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-300 text-xs sm:text-sm">Hospital</p>
                  <p className="text-white font-semibold text-sm sm:text-base truncate">{selectedHospital.name}</p>
                  <p className="text-gray-300 text-xs sm:text-sm break-words">
                    {selectedHospital.address?.street}, {selectedHospital.address?.city}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400 mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-300 text-xs sm:text-sm">Date & Time</p>
                  <p className="text-white font-semibold text-sm sm:text-base">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-primary-300 text-xs sm:text-sm">
                    {formatTime(selectedTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400 mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-300 text-xs sm:text-sm">Consultation Fee</p>
                  <p className="text-success-400 font-semibold text-base sm:text-lg">₹{consultationFee}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleBookingSubmit} className="space-y-4 sm:space-y-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-600">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Additional Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  Reason for Visit *
                </label>
                <select
                  value={bookingData.reason}
                  onChange={(e) => setBookingData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-gray-600 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="" className="bg-gray-800 text-gray-300">Select reason for visit</option>
                  <option value="General Consultation" className="bg-gray-800 text-white">General Consultation</option>
                  <option value="Follow-up Visit" className="bg-gray-800 text-white">Follow-up Visit</option>
                  <option value="Routine Checkup" className="bg-gray-800 text-white">Routine Checkup</option>
                  <option value="Vaccination" className="bg-gray-800 text-white">Vaccination</option>
                  <option value="Health Screening" className="bg-gray-800 text-white">Health Screening</option>
                  <option value="Specialist Consultation" className="bg-gray-800 text-white">Specialist Consultation</option>
                  <option value="Emergency Consultation" className="bg-gray-800 text-white">Emergency Consultation</option>
                  <option value="Second Opinion" className="bg-gray-800 text-white">Second Opinion</option>
                  <option value="Prescription Renewal" className="bg-gray-800 text-white">Prescription Renewal</option>
                  <option value="Test Results Discussion" className="bg-gray-800 text-white">Test Results Discussion</option>
                  <option value="Other" className="bg-gray-800 text-white">Other</option>
                </select>
                {bookingData.reason === 'Other' && (
                  <input
                    type="text"
                    placeholder="Please specify your reason"
                    value={bookingData.customReason || ''}
                    onChange={(e) => setBookingData(prev => ({ ...prev, customReason: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-500 mt-2"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  Symptoms (Optional)
                </label>
                <input
                  type="text"
                  value={bookingData.symptoms.join(', ')}
                  onChange={(e) => setBookingData(prev => ({ 
                    ...prev, 
                    symptoms: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Fever, headache, cough (separate with commas)"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Any additional information you'd like to share with the doctor"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
            <button
              type="button"
              onClick={goBack}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            
            <button
              type="submit"
              disabled={isLoading || !bookingData.reason.trim() || (bookingData.reason === 'Other' && !bookingData.customReason.trim())}
              className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-success-500 to-primary-600 text-white rounded-lg hover:from-success-600 hover:to-primary-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Booking...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm Booking</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    )
  }

  // Add error display in the main render
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-red-500/50 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-error-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-4">Something went wrong</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setError(null)
                setCurrentStep(1)
                loadAvailableDoctors()
              }}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/patient/dashboard')}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
          <button
            onClick={goBack}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back</span>
          </button>
          
          <div className="text-center flex-1 sm:flex-none">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Book Appointment</h1>
            {rescheduleId && (
              <p className="text-primary-300 text-xs sm:text-sm mt-1">Rescheduling appointment</p>
            )}
          </div>
          
          <button
            onClick={resetBooking}
            className="text-gray-300 hover:text-white transition-colors duration-200 text-xs sm:text-sm"
          >
            Start Over
          </button>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-700">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </div>
      </div>
      {showConfirmation && confirmedAppointment && (
        <BookingConfirmation
          appointment={confirmedAppointment}
          onClose={handleConfirmationClose}
          onViewAppointments={handleViewAppointments}
          isReschedule={!!rescheduleId}
        />
      )}
    </div>
  )
}

export default AppointmentBooking
