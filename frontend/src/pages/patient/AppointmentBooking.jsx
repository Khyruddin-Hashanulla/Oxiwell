import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Calendar, Clock, User, MapPin, Phone, Star, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

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

  // Mock doctors data - in real app, this would come from API
  useEffect(() => {
    setDoctors([
      {
        id: 1,
        name: 'Dr. Sarah Doctor',
        specialization: 'General Medicine',
        experience: 8,
        rating: 4.8,
        consultationFee: 150,
        location: 'Main Building, Room 201',
        phone: '+1234567892',
        image: null,
        availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      {
        id: 2,
        name: 'Dr. Michael Smith',
        specialization: 'Cardiology',
        experience: 12,
        rating: 4.9,
        consultationFee: 200,
        location: 'Cardiology Wing, Room 301',
        phone: '+1234567893',
        image: null,
        availableDays: ['monday', 'wednesday', 'friday']
      },
      {
        id: 3,
        name: 'Dr. Emily Johnson',
        specialization: 'Dermatology',
        experience: 6,
        rating: 4.7,
        consultationFee: 180,
        location: 'Dermatology Center, Room 105',
        phone: '+1234567894',
        image: null,
        availableDays: ['tuesday', 'thursday', 'saturday']
      }
    ])
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
      // Mock API call - in real app, this would call the backend
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Appointment booked successfully!')
      navigate('/patient/appointments')
    } catch (error) {
      toast.error('Failed to book appointment. Please try again.')
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
                key={doctor.id}
                onClick={() => {
                  setSelectedDoctor(doctor)
                  setValue('doctorId', doctor.id)
                  setSelectedTime('')
                  setAvailableSlots([])
                }}
                className={`bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  selectedDoctor?.id === doctor.id
                    ? 'border-accent-500 shadow-lg ring-2 ring-accent-500 ring-opacity-50'
                    : 'border-primary-600 hover:border-primary-500'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">{doctor.name}</h3>
                    <p className="text-gray-300 text-sm mb-2">{doctor.specialization}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-300 mb-3">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span>{doctor.rating}</span>
                      </div>
                      <span>{doctor.experience} years exp.</span>
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
              <input
                type="date"
                min={getMinDate()}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  setValue('date', e.target.value)
                  setSelectedTime('')
                  setAvailableSlots([])
                }}
                className="w-full p-4 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                {...register('date', { required: 'Please select a date' })}
              />
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
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
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
                      <span className="text-white font-medium">{selectedDoctor?.name}</span>
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
