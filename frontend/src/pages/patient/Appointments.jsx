import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Clock, User, MapPin, Phone, Plus, Filter, Search, MoreVertical, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { appointmentsAPI } from '../../services/api'
import { toast } from 'react-hot-toast'

const Appointments = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Helper function to format time from 24-hour to 12-hour AM/PM format
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

  // Helper function to get the correct phone number from appointment data
  const getContactPhone = (appointment) => {
    // First try to get workplace phone from hospital data (updated by backend)
    if (appointment.hospital?.phone && appointment.hospital.phone !== 'Contact not available') {
      return appointment.hospital.phone
    }
    
    // Fallback to doctor phone
    if (appointment.doctor?.phone) {
      return appointment.doctor.phone
    }
    
    return 'Contact not available'
  }

  // Fetch real appointments data from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true)
        
        if (!user?._id) {
          console.log('No user ID available')
          setIsLoading(false)
          return
        }

        const response = await appointmentsAPI.getPatientAppointments(user._id)
        
        console.log('🔍 DEBUG: Raw API response:', response.data)
        console.log('🔍 DEBUG: Response status:', response.data.status)
        console.log('🔍 DEBUG: Response data:', response.data.data)
        
        if (response.data.status === 'success') {
          const appointmentsData = response.data.data.appointments || []
          
          console.log('🔍 DEBUG: Appointments array:', appointmentsData)
          console.log('🔍 DEBUG: Appointments count:', appointmentsData.length)
          
          if (appointmentsData.length > 0) {
            console.log('🔍 DEBUG: First appointment:', appointmentsData[0])
            console.log('🔍 DEBUG: First appointment doctor:', appointmentsData[0]?.doctor)
          }
          
          // Transform the data to match the expected format
          const transformedAppointments = appointmentsData.map(appointment => {
            console.log('🔍 DEBUG: Transforming appointment:', appointment._id, appointment.doctor)
            return {
              id: appointment._id,
              doctorName: `${appointment.doctor?.firstName || 'Unknown'} ${appointment.doctor?.lastName || 'Doctor'}`,
              specialization: appointment.doctor?.specialization || 'General Medicine',
              date: new Date(appointment.appointmentDate).toISOString().split('T')[0],
              time: formatTime(appointment.appointmentTime) || 'Not specified',
              status: appointment.status || 'pending',
              reason: appointment.reason || 'No reason specified',
              location: appointment.hospital?.name || appointment.doctor?.location || 'Hospital not specified',
              phone: getContactPhone(appointment) || 'Contact not available',
              notes: appointment.notes || '',
              fee: appointment.consultationFee || appointment.doctor?.consultationFee || 0,
              hospitalAddress: appointment.hospital?.address ? 
                `${appointment.hospital.address.street}, ${appointment.hospital.address.city}` : 
                'Address not available'
            }
          })
          
          setAppointments(transformedAppointments)
          console.log('✅ DEBUG: Final transformed appointments:', transformedAppointments)
        } else {
          console.error('Failed to fetch appointments:', response.data.message)
          toast.error('Failed to load appointments')
          setAppointments([])
        }
      } catch (error) {
        console.error('Error fetching appointments:', error)
        toast.error('Failed to load appointments')
        setAppointments([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [user?._id])

  // Filter appointments based on status and search term
  useEffect(() => {
    console.log('🔍 Filter useEffect triggered:', { 
      appointmentsLength: appointments.length, 
      currentFilter: filter, 
      searchTerm 
    })
    
    let filtered = appointments

    // Filter by status
    if (filter !== 'all') {
      console.log('🔍 Filtering by status:', filter)
      filtered = filtered.filter(apt => apt.status === filter)
      console.log('🔍 After status filter:', filtered.length, 'appointments')
    }

    // Filter by search term
    if (searchTerm) {
      console.log('🔍 Filtering by search term:', searchTerm)
      filtered = filtered.filter(apt =>
        apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.reason.toLowerCase().includes(searchTerm.toLowerCase())
      )
      console.log('🔍 After search filter:', filtered.length, 'appointments')
    }

    console.log('🔍 Final filtered appointments:', filtered.map(apt => ({
      id: apt.id,
      status: apt.status,
      doctorName: apt.doctorName
    })))

    setFilteredAppointments(filtered)
  }, [appointments, filter, searchTerm])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500 text-white">Confirmed</span>
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-500 text-white">Pending</span>
      case 'completed':
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500 text-white">Completed</span>
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-500 text-white">Cancelled</span>
      default:
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-500 text-white">Unknown</span>
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isUpcoming = (dateString) => {
    const appointmentDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return appointmentDate >= today
  }

  // Handle appointment rescheduling
  const handleRescheduleAppointment = async (appointmentId) => {
    try {
      console.log('📅 Reschedule button clicked:', appointmentId)
      
      // Navigate to booking page with appointment ID for rescheduling
      navigate(`/patient/appointments/book?reschedule=${appointmentId}`)
    } catch (error) {
      console.error('❌ Error navigating to reschedule:', error)
      toast.error('Failed to navigate to reschedule page')
    }
  }

  // Handle appointment cancellation (patients can only cancel their own appointments)
  const handleCancelAppointment = async (appointmentId) => {
    try {
      console.log('🔴 Attempting to cancel appointment:', appointmentId)
      
      // Use the DELETE endpoint with proper cancellationReason format
      const response = await appointmentsAPI.cancelAppointment(appointmentId, 'Cancelled by patient')
      
      console.log('✅ Cancel appointment API call successful')
      
      if (response.data.status === 'success') {
        toast.success('Appointment cancelled successfully')
        
        // Refresh appointments list
        console.log('🔄 Refreshing appointments list...')
        const appointmentsResponse = await appointmentsAPI.getPatientAppointments(user._id)
        const appointmentsData = appointmentsResponse?.data?.data?.appointments || []
        
        const transformedAppointments = appointmentsData.map(appointment => ({
          id: appointment._id,
          doctorName: `${appointment.doctor?.firstName || 'Unknown'} ${appointment.doctor?.lastName || 'Doctor'}`,
          specialization: appointment.doctor?.specialization || 'General Medicine',
          date: new Date(appointment.appointmentDate).toISOString().split('T')[0],
          time: formatTime(appointment.appointmentTime) || 'Not specified',
          status: appointment.status || 'pending',
          reason: appointment.reason || 'No reason specified',
          location: appointment.hospital?.name || appointment.doctor?.location || 'Hospital not specified',
          phone: getContactPhone(appointment) || 'Contact not available',
          notes: appointment.notes || '',
          fee: appointment.consultationFee || appointment.doctor?.consultationFee || 0,
          hospitalAddress: appointment.hospital?.address ? 
            `${appointment.hospital.address.street}, ${appointment.hospital.address.city}` : 
            'Address not available'
        }))
        
        setAppointments(transformedAppointments)
        setRefreshKey(prev => prev + 1) // Force re-render
        
        // If currently filtering by 'pending', switch to 'all' to show the cancelled appointment
        if (filter === 'pending') {
          console.log('🔄 Switching filter from "pending" to "all" to show cancelled appointment')
          setFilter('all')
        }
        
        console.log('✅ Appointments list refreshed successfully')
      }
    } catch (error) {
      console.error('❌ Error cancelling appointment:', error)
      toast.error(error.response?.data?.message || 'Failed to cancel appointment')
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
          <h1 className="text-3xl font-bold text-white">My Appointments</h1>
          <p className="mt-2 text-gray-300">Manage your upcoming and past appointments</p>
        </div>
        <Link
          to="/patient/appointments/book"
          className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-accent-600 to-accent-700 text-white font-medium rounded-lg hover:from-accent-700 hover:to-accent-800 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Book New Appointment
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All', count: appointments.length },
              { key: 'upcoming', label: 'Upcoming', count: appointments.filter(apt => apt.status === 'confirmed' || apt.status === 'pending').length },
              { key: 'completed', label: 'Completed', count: appointments.filter(apt => apt.status === 'completed').length },
              { key: 'cancelled', label: 'Cancelled', count: appointments.filter(apt => apt.status === 'cancelled').length }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === filterOption.key
                    ? 'bg-accent-600 text-white shadow-lg'
                    : 'bg-primary-600 text-gray-300 hover:bg-primary-500 hover:text-white'
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

      {/* Appointments List */}
      <div className="space-y-4" key={refreshKey}>
        {filteredAppointments.length === 0 ? (
          <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-12 text-center border border-primary-600">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No appointments found</h3>
            <p className="text-gray-300 mb-6">
              {filter === 'all' 
                ? "You don't have any appointments yet." 
                : `No ${filter} appointments found.`}
            </p>
            <Link
              to="/patient/appointments/book"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-accent-600 to-accent-700 text-white font-medium rounded-lg hover:from-accent-700 hover:to-accent-800 transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Book Your First Appointment
            </Link>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">
                          Dr. {appointment.doctorName}
                        </h3>
                        <p className="text-blue-300 text-sm font-medium mb-1">
                          {appointment.specialization}
                        </p>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(appointment.status)}
                          {isUpcoming(appointment.date) && appointment.status === 'confirmed' && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Date & Time */}
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-300">
                        <Calendar className="w-4 h-4 mr-3 text-blue-400" />
                        <div>
                          <span className="font-medium text-white">Date:</span>
                          <p className="text-sm">{new Date(appointment.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Clock className="w-4 h-4 mr-3 text-green-400" />
                        <div>
                          <span className="font-medium text-white">Time:</span>
                          <p className="text-sm">{appointment.time}</p>
                        </div>
                      </div>
                    </div>

                    {/* Location & Contact */}
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-300">
                        <MapPin className="w-4 h-4 mr-3 text-purple-400" />
                        <div>
                          <span className="font-medium text-white">Location:</span>
                          <p className="text-sm">{appointment.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Phone className="w-4 h-4 mr-3 text-orange-400" />
                        <div>
                          <span className="font-medium text-white">Contact:</span>
                          <p className="text-sm">{appointment.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reason & Fee Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-primary-700/50 rounded-lg p-3">
                      <h4 className="text-white font-medium mb-1 text-sm">Reason for Visit</h4>
                      <p className="text-gray-300 text-sm">{appointment.reason}</p>
                    </div>
                    <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                      <h4 className="text-white font-medium mb-1 text-sm">Consultation Fee</h4>
                      <p className="text-green-400 font-bold text-lg">₹{appointment.fee}</p>
                    </div>
                  </div>

                  {/* Hospital Address */}
                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                    <h4 className="text-white font-medium mb-1 text-sm">Hospital Address</h4>
                    <p className="text-blue-400 text-sm">{appointment.hospitalAddress}</p>
                  </div>

                  {/* Notes Section */}
                  {appointment.notes && (
                    <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <h4 className="text-white font-medium mb-2 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Additional Notes
                      </h4>
                      <p className="text-gray-300 text-sm">{appointment.notes}</p>
                    </div>
                  )}

                  {/* Appointment ID */}
                  <div className="mt-4 pt-3 border-t border-gray-600">
                    <p className="text-xs text-gray-400">
                      Appointment ID: <span className="font-mono">{appointment.id}</span>
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="lg:ml-6 flex flex-row lg:flex-col gap-2 lg:w-40">
                  {appointment.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleRescheduleAppointment(appointment.id)}
                        className="flex-1 lg:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Reschedule</span>
                      </button>
                      <button 
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="flex-1 lg:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}
                  {appointment.status === 'confirmed' && (
                    <button 
                      onClick={() => handleRescheduleAppointment(appointment.id)}
                      className="flex-1 lg:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Reschedule</span>
                    </button>
                  )}
                  {appointment.status === 'completed' && (
                    <button className="flex-1 lg:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>View Report</span>
                    </button>
                  )}
                  {appointment.status === 'cancelled' && (
                    <button 
                      onClick={() => {
                        console.log('🟢 Book New button clicked:', {
                          appointmentId: appointment.id,
                          userAuthenticated: !!user,
                          userId: user?._id,
                          currentPath: window.location.pathname,
                          targetPath: '/patient/appointments/book'
                        })
                        navigate('/patient/appointments/book')
                      }}
                      className="flex-1 lg:flex-none px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Book New</span>
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

export default Appointments
