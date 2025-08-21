import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  MapPin, 
  Star, 
  Calendar, 
  Clock, 
  Filter,
  Heart,
  Brain,
  Eye,
  Bone,
  Baby,
  Stethoscope,
  User,
  Award,
  CheckCircle,
  Phone,
  Mail
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import DeveloperCredit from '../../components/common/DeveloperCredit'

const FindDoctorsPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const specialties = [
    { id: 'cardiology', name: 'Cardiology', icon: Heart, count: 12 },
    { id: 'neurology', name: 'Neurology', icon: Brain, count: 8 },
    { id: 'ophthalmology', name: 'Ophthalmology', icon: Eye, count: 6 },
    { id: 'orthopedics', name: 'Orthopedics', icon: Bone, count: 10 },
    { id: 'pediatrics', name: 'Pediatrics', icon: Baby, count: 15 },
    { id: 'general', name: 'General Medicine', icon: Stethoscope, count: 20 }
  ]

  const locations = [
    'Mumbai, Maharashtra',
    'Delhi, NCR',
    'Bangalore, Karnataka',
    'Chennai, Tamil Nadu',
    'Hyderabad, Telangana',
    'Pune, Maharashtra'
  ]

  const doctors = [
    {
      id: 1,
      name: 'Dr. Medical Professional',
      specialty: 'Cardiology',
      qualification: 'MD, DM Cardiology',
      experience: '15+ years',
      rating: 4.9,
      reviews: 234,
      location: 'Mumbai, Maharashtra',
      hospital: 'City Heart Institute',
      consultationFee: 800,
      nextAvailable: 'Today, 2:30 PM',
      languages: ['English', 'Hindi', 'Marathi'],
      image: '/api/placeholder/150/150'
    },
    {
      id: 2,
      name: 'Dr. Healthcare Specialist',
      specialty: 'Neurology',
      qualification: 'MD, DM Neurology',
      experience: '12+ years',
      rating: 4.8,
      reviews: 189,
      location: 'Delhi, NCR',
      hospital: 'Brain & Spine Center',
      consultationFee: 1000,
      nextAvailable: 'Tomorrow, 10:00 AM',
      languages: ['English', 'Hindi'],
      image: '/api/placeholder/150/150'
    },
    {
      id: 3,
      name: 'Dr. Eye Care Expert',
      specialty: 'Ophthalmology',
      qualification: 'MS Ophthalmology',
      experience: '10+ years',
      rating: 4.7,
      reviews: 156,
      location: 'Bangalore, Karnataka',
      hospital: 'Vision Care Hospital',
      consultationFee: 600,
      nextAvailable: 'Today, 4:00 PM',
      languages: ['English', 'Kannada', 'Hindi'],
      image: '/api/placeholder/150/150'
    },
    {
      id: 4,
      name: 'Dr. Bone Specialist',
      specialty: 'Orthopedics',
      qualification: 'MS Orthopedics',
      experience: '18+ years',
      rating: 4.9,
      reviews: 298,
      location: 'Chennai, Tamil Nadu',
      hospital: 'Orthopedic Excellence Center',
      consultationFee: 900,
      nextAvailable: 'Tomorrow, 11:30 AM',
      languages: ['English', 'Tamil', 'Hindi'],
      image: '/api/placeholder/150/150'
    },
    {
      id: 5,
      name: 'Dr. Child Care Physician',
      specialty: 'Pediatrics',
      qualification: 'MD Pediatrics',
      experience: '8+ years',
      rating: 4.8,
      reviews: 167,
      location: 'Hyderabad, Telangana',
      hospital: 'Children\'s Health Center',
      consultationFee: 500,
      nextAvailable: 'Today, 3:15 PM',
      languages: ['English', 'Telugu', 'Hindi'],
      image: '/api/placeholder/150/150'
    },
    {
      id: 6,
      name: 'Dr. Family Medicine Expert',
      specialty: 'General Medicine',
      qualification: 'MBBS, MD',
      experience: '14+ years',
      rating: 4.6,
      reviews: 203,
      location: 'Pune, Maharashtra',
      hospital: 'Family Wellness Clinic',
      consultationFee: 400,
      nextAvailable: 'Today, 5:00 PM',
      languages: ['English', 'Hindi', 'Marathi'],
      image: '/api/placeholder/150/150'
    }
  ]

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpecialty = !selectedSpecialty || doctor.specialty === selectedSpecialty
    const matchesLocation = !selectedLocation || doctor.location === selectedLocation
    
    return matchesSearch && matchesSpecialty && matchesLocation
  })

  const handleBookAppointment = (doctor) => {
    toast.success(`Appointment booking initiated with ${doctor.name}`)
  }

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Find the Right <span className="text-accent-400">Doctor</span>
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Connect with qualified healthcare professionals and book appointments instantly
            </motion.p>
          </div>

          {/* Search Section */}
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-gradient-to-br from-primary-700 to-primary-600 rounded-2xl p-6 border border-primary-500 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search doctors, specialties, or hospitals..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    <option value="">All Specialties</option>
                    {specialties.map(specialty => (
                      <option key={specialty.id} value={specialty.name}>{specialty.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    <option value="">All Locations</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-16 bg-gradient-to-br from-primary-800 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Browse by Specialty
            </motion.h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {specialties.map((specialty, index) => {
              const IconComponent = specialty.icon
              return (
                <motion.div
                  key={specialty.id}
                  className={`bg-gradient-to-br from-primary-700 to-primary-600 rounded-xl p-6 border cursor-pointer transition-all duration-300 transform hover:scale-105 text-center ${
                    selectedSpecialty === specialty.name 
                      ? 'border-accent-500 shadow-lg' 
                      : 'border-primary-500 hover:border-accent-400'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  onClick={() => setSelectedSpecialty(selectedSpecialty === specialty.name ? '' : specialty.name)}
                >
                  <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center mx-auto mb-3">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    {specialty.name}
                  </h3>
                  <p className="text-xs text-gray-300">
                    {specialty.count} doctors
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Doctors List */}
      <section className="py-20 bg-gradient-to-br from-secondary-900 to-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Available Doctors
              </h2>
              <p className="text-gray-300">
                {filteredDoctors.length} doctors found
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-600 hover:to-primary-500 text-white px-4 py-2 rounded-lg border border-primary-500 transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredDoctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-2xl p-6 border border-primary-600 hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-gradient-accent rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {doctor.name}
                        </h3>
                        <p className="text-accent-400 font-medium">
                          {doctor.specialty}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white font-medium">{doctor.rating}</span>
                        <span className="text-gray-300 text-sm">({doctor.reviews})</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-300 text-sm">
                        <Award className="w-4 h-4 mr-2 text-accent-400" />
                        {doctor.qualification} • {doctor.experience}
                      </div>
                      <div className="flex items-center text-gray-300 text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-accent-400" />
                        {doctor.hospital}, {doctor.location}
                      </div>
                      <div className="flex items-center text-gray-300 text-sm">
                        <Clock className="w-4 h-4 mr-2 text-accent-400" />
                        Next available: {doctor.nextAvailable}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-white">₹{doctor.consultationFee}</span>
                        <span className="text-gray-300 text-sm ml-1">consultation</span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white px-4 py-2 rounded-lg border border-primary-400 transition-all duration-200 text-sm">
                          View Profile
                        </button>
                        <button
                          onClick={() => handleBookAppointment(doctor)}
                          className="bg-gradient-accent hover:shadow-lg text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-primary-600">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-gray-300">
                            <CheckCircle className="w-4 h-4 mr-1 text-green-400" />
                            Verified
                          </div>
                          <div className="text-gray-300">
                            Languages: {doctor.languages.join(', ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredDoctors.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No doctors found
              </h3>
              <p className="text-gray-300 mb-6">
                Try adjusting your search criteria or browse all specialties
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedSpecialty('')
                  setSelectedLocation('')
                }}
                className="bg-gradient-accent hover:shadow-lg text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Emergency Notice */}
      <section className="py-16 bg-gradient-to-br from-primary-800 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-red-500/20 border border-red-500/30 rounded-2xl p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Medical Emergency?
            </h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              For immediate medical emergencies, please call emergency services directly. 
              Our platform is designed for scheduled consultations and non-urgent medical care.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center text-red-300 font-semibold">
                <Phone className="w-5 h-5 mr-2" />
                Emergency: 102 / 108
              </div>
              <div className="flex items-center text-gray-300">
                <Mail className="w-5 h-5 mr-2 text-accent-400" />
                Non-urgent: support@oxiwell.com
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <DeveloperCredit />
    </>
  )
}

export default FindDoctorsPage
