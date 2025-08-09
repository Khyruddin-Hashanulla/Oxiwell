import React from 'react'
import { CheckCircle, Calendar, Clock, User, MapPin, Phone, Star, CreditCard } from 'lucide-react'

const BookingConfirmation = ({ appointment, onClose, onViewAppointments, isReschedule = false }) => {
  if (!appointment) return null

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    if (!timeString || typeof timeString !== 'string') {
      return 'Time not specified'
    }
    
    const [hours, minutes] = timeString.split(':')
    if (!hours || !minutes) {
      return 'Time not specified'
    }
    
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 rounded-2xl p-8 max-w-2xl w-full border border-primary-700 shadow-2xl">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {isReschedule ? 'Appointment Rescheduled!' : 'Booking Confirmed!'}
          </h2>
          <p className="text-primary-300">
            {isReschedule 
              ? 'Your appointment has been successfully rescheduled' 
              : 'Your appointment has been successfully scheduled'
            }
          </p>
        </div>

        {/* Appointment Details */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-primary-600">
          <h3 className="text-xl font-semibold text-white mb-4">Appointment Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Doctor Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-primary-300 text-sm">Doctor</p>
                  <p className="text-white font-semibold">
                    Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                  </p>
                  <p className="text-accent-300 text-sm">{appointment.doctor?.specialization}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-primary-400" />
                <div>
                  <p className="text-primary-300 text-sm">Date</p>
                  <p className="text-white font-semibold">
                    {formatDate(appointment.appointmentDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-primary-400" />
                <div>
                  <p className="text-primary-300 text-sm">Time</p>
                  <p className="text-white font-semibold">
                    {formatTime(appointment.appointmentTime)}
                  </p>
                </div>
              </div>
            </div>

            {/* Hospital Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary-400" />
                <div>
                  <p className="text-primary-300 text-sm">Hospital</p>
                  <p className="text-white font-semibold">{appointment.hospital?.name}</p>
                  <p className="text-primary-300 text-sm">
                    {appointment.hospital?.address?.street}, {appointment.hospital?.address?.city}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-400" />
                <div>
                  <p className="text-primary-300 text-sm">Contact</p>
                  <p className="text-white font-semibold">{appointment.hospital?.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-primary-400" />
                <div>
                  <p className="text-primary-300 text-sm">Consultation Fee</p>
                  <p className="text-success-400 font-semibold text-lg">₹{appointment.consultationFee}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Reason */}
          {appointment.reason && (
            <div className="mt-4 pt-4 border-t border-primary-600">
              <p className="text-primary-300 text-sm mb-1">Reason for Visit</p>
              <p className="text-white">{appointment.reason}</p>
            </div>
          )}

          {/* Symptoms */}
          {appointment.symptoms && appointment.symptoms.length > 0 && (
            <div className="mt-3">
              <p className="text-primary-300 text-sm mb-1">Symptoms</p>
              <div className="flex flex-wrap gap-2">
                {appointment.symptoms.map((symptom, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Important Notes */}
        <div className="bg-warning-500/10 border border-warning-500/30 rounded-xl p-4 mb-6">
          <h4 className="text-warning-400 font-semibold mb-2">Important Notes</h4>
          <ul className="text-warning-200 text-sm space-y-1">
            <li>• Please arrive 15 minutes before your appointment time</li>
            <li>• Bring a valid ID and any relevant medical documents</li>
            <li>• You can reschedule or cancel up to 2 hours before the appointment</li>
            <li>• Payment can be made at the hospital reception</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onViewAppointments}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-600 text-white rounded-lg hover:from-primary-600 hover:to-accent-700 transition-all duration-200 font-semibold"
          >
            View My Appointments
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmation
