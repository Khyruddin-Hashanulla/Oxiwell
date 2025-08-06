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

      const response = await appointmentsAPI.getAvailableDoctors(queryParams.toString())
      
      if (response.data.status === 'success') {
        let doctorList = response.data.data.doctors
        
        // Apply search filter
        if (searchTerm) {
          doctorList = doctorList.filter(doctor => 
            doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
        
        setDoctors(doctorList)
      } else {
        throw new Error('Failed to load doctors')
      }
    } catch (error) {
      console.error('Error loading doctors:', error)
      setError('Failed to load available doctors. Please refresh the page and try again.')
      toast.error('Failed to load available doctors')
    } finally {
      setIsLoading(false)
    }
  }

  const loadDoctorDetails = async (doctorId) => {
    try {
      setIsLoading(true)
      const response = await appointmentsAPI.getDoctorDetails(doctorId)
      
      if (response.data.status === 'success') {
        return response.data.data.doctor
      } else {
        throw new Error('Failed to load doctor details')
      }
    } catch (error) {
      console.error('Error loading doctor details:', error)
      toast.error('Failed to load doctor details')
      return null // Explicitly return null on error
    } finally {
      setIsLoading(false)
    }
  }

  const loadAvailableDates = async () => {
    try {
      setIsLoading(true)
      const response = await appointmentsAPI.getAvailableDates(
        selectedDoctor._id, 
        selectedHospital._id
      )
      
      if (response.data.status === 'success') {
        setAvailableDates(response.data.data.availableDates)
      }
    } catch (error) {
      console.error('Error loading available dates:', error)
      toast.error('Failed to load available dates')
    } finally {
      setIsLoading(false)
    }
  }

  const loadAvailableSlots = async () => {
    try {
      setIsLoading(true)
      const response = await appointmentsAPI.getAvailableSlots(
        selectedDoctor._id,
        selectedHospital._id,
        selectedDate
      )
      
      if (response.data.status === 'success') {
        setAvailableSlots(response.data.data.availableSlots)
      }
    } catch (error) {
      console.error('Error loading available slots:', error)
      toast.error('Failed to load available time slots')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDoctorSelect = async (doctor) => {
    try {
      const doctorDetails = await loadDoctorDetails(doctor._id)
      if (doctorDetails) {
        setSelectedDoctor(doctorDetails)
        setCurrentStep(2)
      } else {
        // Fallback: use the basic doctor data from the list if detailed loading fails
        console.warn('Using fallback doctor data due to API failure')
        setSelectedDoctor(doctor)
        setCurrentStep(2)
      }
    } catch (error) {
      console.error('Error in handleDoctorSelect:', error)
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
    setIsLoading(true)

    try {
      const appointmentData = {
        doctor: selectedDoctor._id,
        hospital: selectedHospital._id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        reason: bookingData.reason === 'Other' ? bookingData.customReason : bookingData.reason,
        symptoms: bookingData.symptoms.filter(s => s.trim()),
        notes: bookingData.notes
      }

      const response = await appointmentsAPI.createAppointment(appointmentData)
      
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
      
      toast.success('Appointment booked successfully!')
    } catch (error) {
      console.error('Booking error:', error)
      toast.error(error.response?.data?.message || 'Failed to book appointment')
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
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4, 5].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
            step <= currentStep 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-500'
          }`}>
            {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
          </div>
          {step < 5 && (
            <div className={`w-12 h-1 mx-2 ${
              step < currentStep ? 'bg-blue-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Specialization</label>
            <select
              value={filters.specialization}
              onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Doctors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
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
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 cursor-pointer hover:bg-white/20 transition-all duration-200 border border-gray-600 hover:border-blue-500"
            >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>
                  <p className="text-blue-300 text-sm mb-2">{doctor.specialization}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>{doctor.rating?.average?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Stethoscope className="w-4 h-4" />
                      <span>{doctor.experience} years</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-gray-300">
                      {doctor.workplaces?.length || 0} workplace(s)
                    </p>
                    <p className="text-sm text-green-400 font-semibold">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {selectedDoctor?.workplaces?.map((workplace, index) => (
          <div
            key={index}
            onClick={() => handleHospitalSelect(workplace.hospital)}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 cursor-pointer hover:bg-white/20 transition-all duration-200 border border-gray-600 hover:border-blue-500"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {workplace.hospital?.name || 'Hospital Name Not Available'}
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {workplace.hospital?.address?.street && workplace.hospital?.address?.city 
                        ? `${workplace.hospital.address.street}, ${workplace.hospital.address.city}`
                        : workplace.hospital?.address?.city || 'Address not available'
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{workplace.hospital?.phone || 'Phone not available'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>{workplace.hospital?.rating?.average?.toFixed(1) || 'N/A'} rating</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <p className="text-green-400 font-semibold">
                    Consultation Fee: ₹{workplace.consultationFee || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )) || (
          <div className="col-span-full text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300">No workplace information available for this doctor</p>
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
        <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <p className="text-sm text-blue-300">
            <Calendar className="w-4 h-4 inline mr-2" />
            Available dates for Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName} at {selectedHospital?.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-300 mt-4">Loading available dates...</p>
          </div>
        ) : availableDates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Available Dates</h3>
            <p className="text-gray-300 mb-4">No available dates found for the selected doctor and hospital.</p>
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 cursor-pointer hover:bg-white/20 transition-all duration-200 border border-gray-600 hover:border-blue-500 text-center group ${
                  selectedDate === dateInfo.date ? 'bg-blue-500/20 border-blue-500' : ''
                }`}
              >
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">
                    {date.getDate()}
                  </div>
                  <div className="text-sm font-medium text-gray-300 capitalize">
                    {dateInfo.dayOfWeek}
                  </div>
                  <div className="text-xs text-gray-400">
                    {date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                  {isToday && (
                    <div className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                      Today
                    </div>
                  )}
                  {isTomorrow && (
                    <div className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
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

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
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
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 cursor-pointer hover:bg-white/20 transition-all duration-200 border border-gray-600 hover:border-blue-500 text-center"
            >
              <div className="text-white font-semibold">
                {formatTime(slot.time)}
              </div>
              <div className="text-xs text-green-400 mt-1">
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
      w.hospital.toString() === selectedHospital._id
    )?.consultationFee || 500

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Confirm Your Appointment</h2>
          <p className="text-gray-300">Review your appointment details and provide additional information</p>
        </div>

        {/* Appointment Summary */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-4">Appointment Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-gray-300 text-sm">Doctor</p>
                  <p className="text-white font-semibold">
                    Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </p>
                  <p className="text-blue-300 text-sm">{selectedDoctor.specialization}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-gray-300 text-sm">Hospital</p>
                  <p className="text-white font-semibold">{selectedHospital.name}</p>
                  <p className="text-gray-300 text-sm">
                    {selectedHospital.address?.street}, {selectedHospital.address?.city}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-gray-300 text-sm">Date & Time</p>
                  <p className="text-white font-semibold">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-blue-300 text-sm">
                    {formatTime(selectedTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-gray-300 text-sm">Consultation Fee</p>
                  <p className="text-green-400 font-semibold text-lg">₹{consultationFee}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleBookingSubmit} className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-4">Additional Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason for Visit *
                </label>
                <select
                  value={bookingData.reason}
                  onChange={(e) => setBookingData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Symptoms (Optional)
                </label>
                <input
                  type="text"
                  value={bookingData.symptoms.join(', ')}
                  onChange={(e) => setBookingData(prev => ({ 
                    ...prev, 
                    symptoms: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  }))}
                  className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Fever, headache, cough (separate with commas)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Any additional information you'd like to share with the doctor"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={goBack}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            
            <button
              type="submit"
              disabled={isLoading || !bookingData.reason.trim() || (bookingData.reason === 'Other' && !bookingData.customReason.trim())}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-red-500/50 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-4">Something went wrong</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setError(null)
                setCurrentStep(1)
                loadAvailableDoctors()
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/patient/dashboard')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={goBack}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Book Appointment</h1>
            {rescheduleId && (
              <p className="text-blue-300 text-sm mt-1">Rescheduling appointment</p>
            )}
          </div>
          
          <button
            onClick={resetBooking}
            className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
          >
            Start Over
          </button>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </div>
      </div>
      {showConfirmation && (
        <BookingConfirmation
          appointment={confirmedAppointment}
          onClose={handleConfirmationClose}
          onViewAppointments={handleViewAppointments}
        />
      )}
    </div>
  )
}

export default AppointmentBooking
