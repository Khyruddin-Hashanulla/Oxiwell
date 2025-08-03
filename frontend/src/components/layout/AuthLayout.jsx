import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Shield, Users, Clock } from 'lucide-react'

const AuthLayout = () => {
  const features = [
    {
      icon: Heart,
      title: 'Patient Care',
      description: 'Comprehensive healthcare management for better patient outcomes'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your medical data is protected with enterprise-grade security'
    },
    {
      icon: Users,
      title: 'Expert Doctors',
      description: 'Connect with qualified healthcare professionals'
    },
    {
      icon: Clock,
      title: '24/7 Access',
      description: 'Access your health records and book appointments anytime'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-medical-50">
      <div className="flex min-h-screen">
        {/* Left side - Branding and features */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 bg-gradient-primary p-12 text-white">
          <div className="flex flex-col justify-between w-full">
            {/* Logo and branding */}
            <div>
              <Link to="/" className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary-600" />
                </div>
                <span className="text-2xl font-bold">Oxiwell</span>
              </Link>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl font-bold mb-4 leading-tight">
                  Your Health,<br />
                  Our Priority
                </h1>
                <p className="text-xl text-primary-100 mb-12 leading-relaxed">
                  Experience seamless healthcare management with our comprehensive 
                  platform designed for patients, doctors, and healthcare administrators.
                </p>
              </motion.div>

              {/* Features */}
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-primary-100 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="text-primary-100 text-sm">
              <p>&copy; 2024 Oxiwell. All rights reserved.</p>
            </div>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="inline-flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">Oxiwell</span>
              </Link>
            </div>

            {/* Auth form container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-strong p-8 border border-gray-100"
            >
              <Outlet />
            </motion.div>

            {/* Mobile features */}
            <div className="lg:hidden mt-8 text-center">
              <p className="text-gray-600 text-sm">
                Trusted by healthcare professionals worldwide
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
