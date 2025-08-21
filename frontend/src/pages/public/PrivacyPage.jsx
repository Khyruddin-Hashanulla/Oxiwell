import React from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Lock, 
  Eye, 
  Users, 
  Database, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Mail,
  Phone,
  Calendar
} from 'lucide-react'
import DeveloperCredit from '../../components/common/DeveloperCredit'

const PrivacyPage = () => {
  const lastUpdated = "January 2025"

  const privacyPrinciples = [
    {
      icon: Shield,
      title: 'Data Protection',
      description: 'We implement industry-standard security measures to protect your personal and medical information.'
    },
    {
      icon: Lock,
      title: 'Secure Storage',
      description: 'All data is encrypted both in transit and at rest using advanced encryption protocols.'
    },
    {
      icon: Eye,
      title: 'Transparency',
      description: 'We are transparent about what data we collect, how we use it, and who we share it with.'
    },
    {
      icon: Users,
      title: 'User Control',
      description: 'You have full control over your data with options to access, modify, or delete your information.'
    }
  ]

  const dataTypes = [
    {
      icon: Users,
      title: 'Personal Information',
      items: [
        'Name, email address, phone number',
        'Date of birth and gender',
        'Address and emergency contact details',
        'Profile photos and preferences'
      ]
    },
    {
      icon: FileText,
      title: 'Medical Information',
      items: [
        'Medical history and conditions',
        'Prescription and medication records',
        'Test results and diagnostic reports',
        'Treatment plans and doctor notes'
      ]
    },
    {
      icon: Calendar,
      title: 'Usage Information',
      items: [
        'Appointment booking and history',
        'Platform usage patterns',
        'Device and browser information',
        'IP address and location data'
      ]
    }
  ]

  const userRights = [
    {
      title: 'Right to Access',
      description: 'Request a copy of all personal data we hold about you'
    },
    {
      title: 'Right to Rectification',
      description: 'Correct any inaccurate or incomplete personal information'
    },
    {
      title: 'Right to Erasure',
      description: 'Request deletion of your personal data under certain conditions'
    },
    {
      title: 'Right to Portability',
      description: 'Receive your data in a structured, machine-readable format'
    },
    {
      title: 'Right to Object',
      description: 'Object to processing of your personal data for certain purposes'
    },
    {
      title: 'Right to Restrict',
      description: 'Limit how we process your personal data in specific situations'
    }
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              className="flex items-center justify-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mr-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                Privacy <span className="text-accent-400">Policy</span>
              </h1>
            </motion.div>
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Your privacy is our priority. Learn how we collect, use, and protect your personal and medical information.
            </motion.p>
            <motion.div
              className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <p className="text-blue-300 text-sm">
                <strong>Last Updated:</strong> {lastUpdated}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Privacy Principles */}
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
              Our Privacy Principles
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              We are committed to protecting your privacy through these core principles
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {privacyPrinciples.map((principle, index) => {
              const IconComponent = principle.icon
              return (
                <motion.div
                  key={index}
                  className="bg-gradient-to-br from-primary-700 to-primary-600 rounded-2xl p-6 border border-primary-500 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {principle.title}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {principle.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Data We Collect */}
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
              Information We Collect
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              We collect only the information necessary to provide you with quality healthcare services
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {dataTypes.map((dataType, index) => {
              const IconComponent = dataType.icon
              return (
                <motion.div
                  key={index}
                  className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-2xl p-8 border border-primary-600"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-16 h-16 bg-gradient-accent rounded-xl flex items-center justify-center mb-6">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-6">
                    {dataType.title}
                  </h3>
                  <ul className="space-y-3">
                    {dataType.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start text-gray-300">
                        <CheckCircle className="w-4 h-4 text-accent-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Detailed Privacy Policy */}
      <section className="py-20 bg-gradient-to-br from-primary-800 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-gradient-to-br from-primary-700 to-primary-600 rounded-2xl p-8 border border-primary-500 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="prose prose-invert max-w-none">
              <h2 className="text-2xl font-bold text-white mb-6">Detailed Privacy Policy</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-accent-400 mb-4">1. How We Use Your Information</h3>
                  <div className="text-gray-300 space-y-3 text-sm leading-relaxed">
                    <p>We use your personal and medical information to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Provide medical consultations and healthcare services</li>
                      <li>Schedule and manage your appointments</li>
                      <li>Maintain your medical records and treatment history</li>
                      <li>Send appointment reminders and health notifications</li>
                      <li>Process payments and insurance claims</li>
                      <li>Improve our services and user experience</li>
                      <li>Comply with legal and regulatory requirements</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-accent-400 mb-4">2. Information Sharing</h3>
                  <div className="text-gray-300 space-y-3 text-sm leading-relaxed">
                    <p>We may share your information with:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Healthcare Providers:</strong> Doctors, specialists, and medical staff involved in your care</li>
                      <li><strong>Insurance Companies:</strong> For claim processing and coverage verification</li>
                      <li><strong>Legal Authorities:</strong> When required by law or to protect public health</li>
                      <li><strong>Service Providers:</strong> Trusted third parties who help us operate our platform</li>
                    </ul>
                    <p className="mt-4">We never sell your personal information to third parties for marketing purposes.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-accent-400 mb-4">3. Data Security</h3>
                  <div className="text-gray-300 space-y-3 text-sm leading-relaxed">
                    <p>We implement comprehensive security measures including:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>End-to-end encryption for all data transmission</li>
                      <li>Secure cloud storage with regular backups</li>
                      <li>Multi-factor authentication for account access</li>
                      <li>Regular security audits and vulnerability assessments</li>
                      <li>HIPAA-compliant data handling procedures</li>
                      <li>Staff training on privacy and security protocols</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-accent-400 mb-4">4. Data Retention</h3>
                  <div className="text-gray-300 space-y-3 text-sm leading-relaxed">
                    <p>We retain your information for as long as necessary to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Provide ongoing healthcare services</li>
                      <li>Comply with legal and regulatory requirements</li>
                      <li>Resolve disputes and enforce our agreements</li>
                    </ul>
                    <p className="mt-4">Medical records are typically retained for 7-10 years as required by healthcare regulations.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-accent-400 mb-4">5. Cookies and Tracking</h3>
                  <div className="text-gray-300 space-y-3 text-sm leading-relaxed">
                    <p>We use cookies and similar technologies to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Remember your preferences and login status</li>
                      <li>Analyze website usage and improve functionality</li>
                      <li>Provide personalized content and recommendations</li>
                      <li>Ensure platform security and prevent fraud</li>
                    </ul>
                    <p className="mt-4">You can control cookie settings through your browser preferences.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-accent-400 mb-4">6. International Data Transfers</h3>
                  <div className="text-gray-300 space-y-3 text-sm leading-relaxed">
                    <p>Your data may be processed in countries other than your own. We ensure adequate protection through:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Standard contractual clauses approved by data protection authorities</li>
                      <li>Adequacy decisions recognizing equivalent protection levels</li>
                      <li>Certification schemes and codes of conduct</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Your Rights */}
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
              Your Privacy Rights
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              You have comprehensive rights regarding your personal data
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userRights.map((right, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {right.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {right.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-gradient-to-br from-primary-800 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            className="bg-gradient-to-br from-primary-700 to-primary-600 rounded-2xl p-8 border border-primary-500"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Questions About Your Privacy?
            </h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              If you have any questions about this Privacy Policy or how we handle your data, 
              please don't hesitate to contact our Privacy Team.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center text-gray-300">
                <Mail className="w-5 h-5 text-accent-400 mr-2" />
                <span>privacy@oxiwell.com</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="w-5 h-5 text-accent-400 mr-2" />
                <span>+91-XXXX-XXXX-XX</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-primary-500">
              <p className="text-sm text-gray-400">
                We typically respond to privacy inquiries within 48 hours
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <DeveloperCredit />
    </>
  )
}

export default PrivacyPage
