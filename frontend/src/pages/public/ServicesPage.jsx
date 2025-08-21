import React from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Video, 
  FileText, 
  Heart, 
  Stethoscope, 
  Pill, 
  Activity, 
  Shield,
  Clock,
  Users,
  Phone,
  Download
} from 'lucide-react'
import DeveloperCredit from '../../components/common/DeveloperCredit'

const ServicesPage = () => {
  const services = [
    {
      icon: Calendar,
      title: 'Appointment Booking',
      description: 'Schedule appointments with your preferred doctors at your convenience. Easy online booking system available 24/7.',
      features: ['Online scheduling', 'Instant confirmation', 'Reminder notifications', 'Flexible rescheduling']
    },
    {
      icon: Video,
      title: 'Online Consultations',
      description: 'Connect with healthcare professionals through secure video calls from the comfort of your home.',
      features: ['HD video calls', 'Secure platform', 'Digital prescriptions', 'Follow-up support']
    },
    {
      icon: FileText,
      title: 'Digital Prescriptions',
      description: 'Receive and manage your prescriptions digitally. Download, print, or share with pharmacies instantly.',
      features: ['Digital format', 'Easy sharing', 'Prescription history', 'Pharmacy integration']
    },
    {
      icon: Activity,
      title: 'Medical Reports',
      description: 'Upload, store, and access your medical reports securely. Share with healthcare providers easily.',
      features: ['Secure storage', 'Easy upload', 'Quick sharing', 'Report history']
    },
    {
      icon: Heart,
      title: 'Health Records',
      description: 'Comprehensive digital health records management. Keep track of your medical history in one place.',
      features: ['Complete history', 'Easy access', 'Data security', 'Export options']
    },
    {
      icon: Phone,
      title: 'Emergency Care',
      description: '24/7 emergency support and guidance. Quick access to emergency contacts and services.',
      features: ['24/7 availability', 'Emergency contacts', 'Quick response', 'Professional guidance']
    }
  ]

  const specialties = [
    'General Medicine',
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Orthopedics',
    'Gynecology',
    'Neurology',
    'Psychiatry',
    'Ophthalmology',
    'ENT',
    'Dentistry',
    'Radiology'
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Our <span className="text-accent-400">Services</span>
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Comprehensive healthcare services designed to meet all your medical needs. 
              From routine check-ups to specialized treatments, we're here for you.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gradient-to-br from-primary-800 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Complete Healthcare Solutions
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon
              return (
                <motion.div
                  key={index}
                  className="bg-gradient-to-br from-primary-700 to-primary-600 rounded-2xl p-8 border border-primary-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-16 h-16 bg-gradient-accent rounded-xl flex items-center justify-center mb-6">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {service.title}
                  </h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-300">
                        <div className="w-2 h-2 bg-accent-400 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-20 bg-gradient-to-br from-secondary-900 to-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Medical Specialties
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Our network of qualified doctors covers a wide range of medical specialties
            </motion.p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {specialties.map((specialty, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 text-center hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <Stethoscope className="w-8 h-8 text-accent-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold">{specialty}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-primary-800 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Why Choose Oxiwell?
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Your health data is protected with enterprise-grade security and HIPAA compliance.'
              },
              {
                icon: Clock,
                title: '24/7 Availability',
                description: 'Access your health records and emergency support anytime, anywhere.'
              },
              {
                icon: Users,
                title: 'Expert Care',
                description: 'Connect with qualified healthcare professionals and specialists.'
              }
            ].map((item, index) => {
              const IconComponent = item.icon
              return (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="w-20 h-20 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <DeveloperCredit />
    </>
  )
}

export default ServicesPage
