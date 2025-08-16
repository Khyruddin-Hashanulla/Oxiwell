import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Calendar, FileText, Users, Shield, Clock, ArrowRight } from 'lucide-react'
import DeveloperCredit from '../../components/common/DeveloperCredit'

const LandingPage = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Easy Appointment Booking',
      description: 'Schedule appointments with your preferred doctors at your convenience.'
    },
    {
      icon: FileText,
      title: 'Digital Medical Records',
      description: 'Securely store and access your medical reports and prescriptions online.'
    },
    {
      icon: Users,
      title: 'Expert Healthcare Team',
      description: 'Connect with qualified doctors and healthcare professionals.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health data is protected with enterprise-grade security.'
    },
    {
      icon: Clock,
      title: '24/7 Access',
      description: 'Access your health records and manage appointments anytime, anywhere.'
    },
    {
      icon: Heart,
      title: 'Comprehensive Care',
      description: 'Complete healthcare management from consultation to follow-up care.'
    }
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Your Health,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-600">
                Our Priority
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Experience seamless healthcare management with Oxiwell. Book appointments, 
              access medical records, and connect with healthcare professionals all in one place.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link
                to="/register"
                className="bg-gradient-accent hover:shadow-lg text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                Get Started Today
              </Link>
              <Link
                to="/about"
                className="border-2 border-gray-400 text-gray-300 hover:bg-white hover:text-primary-900 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
              >
                Learn More
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Comprehensive Healthcare Solutions
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Everything you need to manage your health journey effectively
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <motion.div
                  key={index}
                  className="bg-gradient-to-br from-primary-800 to-primary-700 p-8 rounded-2xl shadow-xl border border-primary-600 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center mb-6">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Ready to Transform Your Healthcare Experience?
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join thousands of patients and healthcare providers who trust Oxiwell
          </motion.p>
          <Link
            to="/register"
            className="inline-flex items-center bg-gradient-accent hover:shadow-xl text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
          >
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
      <DeveloperCredit />
    </>
  )
}

export default LandingPage
