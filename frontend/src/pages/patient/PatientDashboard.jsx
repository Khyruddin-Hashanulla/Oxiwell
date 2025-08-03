import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Calendar, FileText, Pill, User, Clock, AlertCircle, Plus } from 'lucide-react'

const PatientDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    activePrescriptions: 0,
    recentReports: 0,
    nextAppointment: null
  })

  // Mock data - in real app, this would come from API
  useEffect(() => {
    // Simulate API call
    setStats({
      upcomingAppointments: 2,
      activePrescriptions: 3,
      recentReports: 1,
      nextAppointment: {
        date: '2025-08-05',
        time: '10:30 AM',
        doctor: 'Dr. Sarah Doctor',
        type: 'General Checkup'
      }
    })
  }, [])

  const quickActions = [
    {
      title: 'Book Appointment',
      description: 'Schedule a new appointment',
      icon: Calendar,
      link: '/patient/appointments/book',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'View Prescriptions',
      description: 'Check your medications',
      icon: Pill,
      link: '/patient/prescriptions',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Upload Report',
      description: 'Share medical reports',
      icon: FileText,
      link: '/patient/reports/upload',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Update Profile',
      description: 'Manage your information',
      icon: User,
      link: '/patient/profile',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-700 rounded-2xl p-8 border border-primary-600 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.firstName || 'Patient'}!
            </h1>
            <p className="text-gray-300 text-lg">
              Here's your health overview for today
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Next Appointment Alert */}
      {stats.nextAppointment && (
        <div className="bg-gradient-to-r from-accent-800 to-accent-700 border border-accent-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-6 h-6 text-accent-300 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                Upcoming Appointment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div>
                  <p><strong className="text-white">Doctor:</strong> {stats.nextAppointment.doctor}</p>
                  <p><strong className="text-white">Type:</strong> {stats.nextAppointment.type}</p>
                </div>
                <div>
                  <p><strong className="text-white">Date:</strong> {stats.nextAppointment.date}</p>
                  <p><strong className="text-white">Time:</strong> {stats.nextAppointment.time}</p>
                </div>
              </div>
            </div>
            <Link
              to="/patient/appointments"
              className="bg-white text-accent-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Upcoming Appointments</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.upcomingAppointments}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Active Prescriptions</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.activePrescriptions}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Pill className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Recent Reports</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.recentReports}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon
            return (
              <Link
                key={index}
                to={action.link}
                className={`${action.color} rounded-xl p-6 text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 group`}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
        <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl border border-primary-600 shadow-lg">
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-primary-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">Appointment scheduled</h4>
                  <p className="text-sm text-gray-300">General checkup with Dr. Sarah Doctor</p>
                </div>
                <span className="text-xs text-gray-400">2 days ago</span>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-primary-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Pill className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">New prescription added</h4>
                  <p className="text-sm text-gray-300">Medication for blood pressure</p>
                </div>
                <span className="text-xs text-gray-400">1 week ago</span>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-primary-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">Lab results uploaded</h4>
                  <p className="text-sm text-gray-300">Blood test results are now available</p>
                </div>
                <span className="text-xs text-gray-400">2 weeks ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDashboard
