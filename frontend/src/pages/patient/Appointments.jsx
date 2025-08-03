import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, User, MapPin, Phone, Plus, Filter, Search, MoreVertical, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const Appointments = () => {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Mock appointments data - in real app, this would come from API
  useEffect(() => {
    const mockAppointments = [
      {
        id: 1,
        doctorName: 'Dr. Sarah Doctor',
        specialization: 'General Medicine',
        date: '2025-08-05',
        time: '10:30 AM',
        status: 'confirmed',
        reason: 'Routine Checkup',
        location: 'Main Building, Room 201',
        phone: '+1234567892',
        notes: 'Annual health checkup',
        fee: 150
      },
      {
        id: 2,
        doctorName: 'Dr. Michael Smith',
        specialization: 'Cardiology',
        date: '2025-08-08',
        time: '02:00 PM',
        status: 'pending',
        reason: 'Follow-up Visit',
        location: 'Cardiology Wing, Room 301',
        phone: '+1234567893',
        notes: 'Follow-up for blood pressure monitoring',
        fee: 200
      },
      {
        id: 3,
        doctorName: 'Dr. Emily Johnson',
        specialization: 'Dermatology',
        date: '2025-07-28',
        time: '11:00 AM',
        status: 'completed',
        reason: 'Consultation',
        location: 'Dermatology Center, Room 105',
        phone: '+1234567894',
        notes: 'Skin condition consultation',
        fee: 180
      },
      {
        id: 4,
        doctorName: 'Dr. Sarah Doctor',
        specialization: 'General Medicine',
        date: '2025-07-15',
        time: '09:30 AM',
        status: 'cancelled',
        reason: 'Routine Checkup',
        location: 'Main Building, Room 201',
        phone: '+1234567892',
        notes: 'Cancelled due to emergency',
        fee: 150
      }
    ]

    setTimeout(() => {
      setAppointments(mockAppointments)
      setFilteredAppointments(mockAppointments)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filter appointments based on status and search term
  useEffect(() => {
    let filtered = appointments

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(apt => apt.status === filter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.reason.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

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
      <div className="space-y-4">
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
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {appointment.doctorName}
                      </h3>
                      <p className="text-gray-300 text-sm mb-2">
                        {appointment.specialization}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-300">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {appointment.time}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(appointment.status)}
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-primary-600 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-300">
                        <User className="w-4 h-4 mr-2" />
                        <span className="font-medium text-white">Reason:</span>
                        <span className="ml-2">{appointment.reason}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="font-medium text-white">Location:</span>
                        <span className="ml-2">{appointment.location}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-300">
                        <Phone className="w-4 h-4 mr-2" />
                        <span className="font-medium text-white">Contact:</span>
                        <span className="ml-2">{appointment.phone}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <span className="font-medium text-white">Fee:</span>
                        <span className="ml-2">${appointment.fee}</span>
                      </div>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mt-4 p-3 bg-primary-700 bg-opacity-50 rounded-lg">
                      <p className="text-sm text-gray-300">
                        <span className="font-medium text-white">Notes:</span> {appointment.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2 lg:w-32">
                  {appointment.status === 'pending' && (
                    <>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                        Confirm
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                        Cancel
                      </button>
                    </>
                  )}
                  {appointment.status === 'confirmed' && (
                    <button className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors text-sm font-medium">
                      Reschedule
                    </button>
                  )}
                  {appointment.status === 'completed' && (
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors text-sm font-medium">
                      View Details
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
