import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Calendar, Clock, User, MapPin, Phone, Star, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { appointmentsAPI } from '../../services/api'

const AppointmentBooking = () => {
  const navigate = useNavigate()
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [doctors, setDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm()

  // Load doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true)
        const response = await appointmentsAPI.getAvailableDoctors()
        
        if (response.data.status === 'success') {
          setDoctors(response.data.data.doctors || [])
        } else {
          console.error('Failed to fetch doctors:', response.data.message)
          toast.error('Failed to load doctors')
        }
      } catch (error) {
        console.error('Error fetching doctors:', error)
        toast.error('Failed to load doctors')
        // Fallback to mock data if API fails
        setDoctors([
          {
            id: '1',
            firstName: 'Dr. Sarah',
            lastName: 'Doctor',
            specialization: 'General Medicine',
            experience: '8 years',
            rating: 4.8,
            location: 'Main Building, Room 201',
            phone: '+1 (555) 123-4567',
            availableSlots: ['09:00', '10:30', '14:00', '15:30']
          },
          {
            id: '2',
            firstName: 'Dr. Michael',
            lastName: 'Johnson',
            specialization: 'Cardiology',
            experience: '12 years',
            rating: 4.9,
            location: 'Cardiology Wing, Room 305',
            phone: '+1 (555) 987-6543',
            availableSlots: ['08:30', '11:00', '13:30', '16:00']
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  // Generate available time slots when doctor and date are selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      // Mock available slots - in real app, this would come from API
      const slots = [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
        '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
      ]
      setAvailableSlots(slots)
    }
  }, [selectedDoctor, selectedDate])

  const onSubmit = async (data) => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast.error('Please select doctor, date, and time')
      return
    }

    setIsLoading(true)
    try {
      // Convert 12-hour time format to 24-hour format for backend
      const convertTo24Hour = (time12h) => {
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') {
          hours = '00';
        }
        if (modifier === 'PM') {
          hours = parseInt(hours, 10) + 12;
        }
        return `${String(hours).padStart(2, '0')}:${minutes}`;
      };

      // Generate valid MongoDB ObjectId for test doctors
      const generateTestObjectId = (id) => {
        if (id === '1') return '507f1f77bcf86cd799439011'; // Valid ObjectId for Dr. Sarah
        if (id === '2') return '507f1f77bcf86cd799439012'; // Valid ObjectId for Dr. Michael
        return id; // Return as-is if already valid
      };

      // Create appointment payload with correct field names for backend
      const appointmentData = {
        doctor: generateTestObjectId(selectedDoctor._id || selectedDoctor.id),
        appointmentDate: selectedDate,
        appointmentTime: convertTo24Hour(selectedTime),
        appointmentType: data.appointmentType || 'consultation',
        reason: data.reason || `Consultation appointment with ${selectedDoctor.firstName} ${selectedDoctor.lastName} for general medical consultation and health assessment.`,
        symptoms: data.symptoms ? [data.symptoms] : [],
        patientNotes: data.notes || ''
      }

      console.log('Booking appointment with data:', appointmentData)

      // Call backend API to create appointment
      const response = await appointmentsAPI.createAppointment(appointmentData)
      
      if (response.data.status === 'success') {
        toast.success('Appointment booked successfully!')
        navigate('/patient/appointments')
      } else {
        toast.error(response.data.message || 'Failed to book appointment')
      }
    } catch (error) {
      console.error('Appointment booking error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to book appointment. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30)
    return maxDate.toISOString().split('T')[0]
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/patient/appointments')}
            className="p-2 text-gray-400 hover:text-white hover:bg-primary-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Book Appointment</h1>
            <p className="mt-2 text-gray-300">Schedule your next healthcare visit</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Doctor Selection */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Select Doctor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor._id || doctor.id}
                onClick={() => {
                  setSelectedDoctor(doctor)
                  setValue('doctorId', doctor.id)
                  setSelectedTime('')
                  setAvailableSlots([])
                }}
                className={`bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  selectedDoctor?._id === doctor._id || selectedDoctor?.id === doctor.id
                    ? 'border-accent-500 shadow-lg ring-2 ring-accent-500 ring-opacity-50'
                    : 'border-primary-600 hover:border-primary-500'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">{doctor.firstName} {doctor.lastName}</h3>
                    <p className="text-gray-300 text-sm mb-2">{doctor.specialization}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-300 mb-3">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span>{doctor.rating}</span>
                      </div>
                      <span>{doctor.experience}</span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-300">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {doctor.location}
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {doctor.phone}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-accent-400">${doctor.consultationFee}</p>
                    <p className="text-xs text-gray-400">consultation</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date Selection */}
        {selectedDoctor && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Select Date</h2>
            <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Choose your preferred appointment date
                </label>
                
                {/* Date Input with better styling */}
                <div className="relative">
                  <input
                    type="date"
                    min={getMinDate()}
                    value={selectedDate}
                    onChange={(e) => {
                      console.log('📅 Date selected:', e.target.value);
                      setSelectedDate(e.target.value)
                      setValue('date', e.target.value)
                      setSelectedTime('')
                      setAvailableSlots([])
                    }}
                    className="w-full p-4 bg-primary-900 border-2 border-primary-600 rounded-lg text-white text-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 cursor-pointer hover:border-accent-400"
                    style={{
                      colorScheme: 'dark',
                      fontSize: '16px'
                    }}
                    {...register('date', { required: 'Please select a date' })}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                {/* Quick date selection buttons */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <p className="text-sm text-gray-400 w-full mb-2">Quick select:</p>
                  {[0, 1, 2, 3, 4, 5, 6].map((daysFromToday, index) => {
                    const date = new Date();
                    date.setDate(date.getDate() + daysFromToday + 1); // +1 because appointments start from tomorrow
                    const dateString = date.toISOString().split('T')[0];
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNumber = date.getDate();
                    
                    return (
                      <button
                        key={`quick-date-${index}`}
                        type="button"
                        onClick={() => {
                          console.log('📅 Quick date selected:', dateString);
                          setSelectedDate(dateString);
                          setValue('date', dateString);
                          setSelectedTime('');
                          setAvailableSlots([]);
                        }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedDate === dateString
                            ? 'bg-accent-500 text-white shadow-lg'
                            : 'bg-primary-600 text-gray-300 hover:bg-primary-500 hover:text-white'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-xs">{dayName}</div>
                          <div className="font-bold">{dayNumber}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedDate && (
                  <div className="mt-4 p-3 bg-primary-600 rounded-lg">
                    <p className="text-sm text-accent-400">
                      ✅ Selected: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                )}
              </div>
              
              {errors.date && (
                <p className="mt-2 text-sm text-red-400">{errors.date.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Time Selection */}
        {selectedDate && availableSlots.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Select Time</h2>
            <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg">
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setSelectedTime(slot)
                      setValue('time', slot)
                    }}
                    className={`p-3 rounded-lg font-medium transition-all duration-200 ${
                      selectedTime === slot
                        ? 'bg-accent-600 text-white shadow-lg'
                        : 'bg-primary-600 text-gray-300 hover:bg-primary-500 hover:text-white'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              {errors.time && (
                <p className="mt-4 text-sm text-red-400">{errors.time.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Appointment Details */}
        {selectedTime && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Appointment Details</h2>
            <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Reason for Visit *
                  </label>
                  <select
                    {...register('reason', { required: 'Please select a reason' })}
                    className="w-full p-4 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  >
                    <option value="">Select reason</option>
                    <option value="routine-checkup">Routine Checkup</option>
                    <option value="follow-up">Follow-up Visit</option>
                    <option value="consultation">Consultation</option>
                    <option value="emergency">Emergency</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.reason && (
                    <p className="mt-2 text-sm text-red-400">{errors.reason.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Please describe your symptoms or concerns..."
                    {...register('notes')}
                    className="w-full p-4 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Appointment Summary */}
                <div className="bg-primary-700 bg-opacity-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Appointment Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Doctor:</span>
                      <span className="text-white font-medium">{selectedDoctor?.firstName} {selectedDoctor?.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Specialization:</span>
                      <span className="text-white">{selectedDoctor?.specialization}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Date:</span>
                      <span className="text-white">{selectedDate && new Date(selectedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Time:</span>
                      <span className="text-white">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Location:</span>
                      <span className="text-white">{selectedDoctor?.location}</span>
                    </div>
                    <div className="flex justify-between border-t border-primary-600 pt-2 mt-3">
                      <span className="text-gray-300 font-medium">Consultation Fee:</span>
                      <span className="text-accent-400 font-bold text-lg">${selectedDoctor?.consultationFee}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {selectedTime && (
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/patient/appointments')}
              className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-accent-600 to-accent-700 text-white font-medium rounded-lg hover:from-accent-700 hover:to-accent-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

export default AppointmentBooking
