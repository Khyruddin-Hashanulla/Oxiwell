import React from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Clock, 
  Scale,
  Gavel,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react'
import DeveloperCredit from '../../components/common/DeveloperCredit'

const TermsPage = () => {
  const lastUpdated = "January 2025"

  const keyTerms = [
    {
      icon: Users,
      title: 'User Responsibilities',
      description: 'Your obligations when using our healthcare platform and services'
    },
    {
      icon: Shield,
      title: 'Service Availability',
      description: 'Our commitment to providing reliable healthcare services and platform uptime'
    },
    {
      icon: Scale,
      title: 'Legal Compliance',
      description: 'Healthcare regulations, privacy laws, and industry standards we follow'
    },
    {
      icon: AlertTriangle,
      title: 'Limitations',
      description: 'Important limitations and disclaimers regarding our services'
    }
  ]

  const serviceTerms = [
    {
      title: 'Medical Services',
      items: [
        'Online consultations with licensed healthcare providers',
        'Appointment scheduling and management',
        'Digital prescription services',
        'Medical record storage and access',
        'Health monitoring and tracking tools'
      ]
    },
    {
      title: 'Platform Features',
      items: [
        'User account creation and management',
        'Secure messaging with healthcare providers',
        'Payment processing for medical services',
        'Insurance claim assistance',
        'Health data analytics and insights'
      ]
    },
    {
      title: 'Emergency Services',
      items: [
        'Emergency contact information and protocols',
        'Critical health alert notifications',
        'Integration with local emergency services',
        'Urgent care appointment prioritization'
      ]
    }
  ]

  const userObligations = [
    {
      title: 'Account Security',
      description: 'Maintain the confidentiality of your login credentials and notify us immediately of any unauthorized access'
    },
    {
      title: 'Accurate Information',
      description: 'Provide truthful and complete medical information to ensure proper healthcare delivery'
    },
    {
      title: 'Appropriate Use',
      description: 'Use our services only for legitimate healthcare purposes and comply with all applicable laws'
    },
    {
      title: 'Payment Obligations',
      description: 'Pay all fees associated with services rendered in a timely manner according to agreed terms'
    },
    {
      title: 'Communication',
      description: 'Maintain professional and respectful communication with healthcare providers and staff'
    },
    {
      title: 'Emergency Protocols',
      description: 'Understand that our platform is not for medical emergencies and call emergency services when needed'
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
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                Terms of <span className="text-accent-400">Service</span>
              </h1>
            </motion.div>
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Please read these terms carefully. They govern your use of our healthcare platform and services.
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

      {/* Key Terms Overview */}
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
              Key Terms Overview
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Understanding the main aspects of our service agreement
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {keyTerms.map((term, index) => {
              const IconComponent = term.icon
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
                    {term.title}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {term.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Services Covered */}
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
              Services Covered
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              These terms apply to all services and features provided by our platform
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {serviceTerms.map((service, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-2xl p-8 border border-primary-600"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-semibold text-white mb-6">
                  {service.title}
                </h3>
                <ul className="space-y-3">
                  {service.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start text-gray-300">
                      <CheckCircle className="w-4 h-4 text-accent-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Terms */}
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
              <h2 className="text-2xl font-bold text-white mb-6">Detailed Terms and Conditions</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-accent-400 mb-4">1. Acceptance of Terms</h3>
                  <div className="text-gray-300 space-y-3 text-sm leading-relaxed">
                    <p>By accessing and using the Oxiwell healthcare platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
                    <p>These terms constitute a legally binding agreement between you and Oxiwell Health Center Management System.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-accent-400 mb-4">2. Medical Disclaimer</h3>
                  <div className="text-gray-300 space-y-3 text-sm leading-relaxed">
                    <p><strong>IMPORTANT:</strong> Our platform facilitates communication with licensed healthcare providers but does not replace traditional medical care.</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Always seek immediate medical attention for emergencies</li>
                      <li>Our services are not suitable for urgent or life-threatening conditions</li>
                      <li>Healthcare providers on our platform are licensed professionals, but we do not guarantee specific outcomes</li>
                      <li>You are responsible for following through with recommended treatments and follow-up care</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-accent-400 mb-4">3. User Accounts and Eligibility</h3>
                  <div className="text-gray-300 space-y-3 text-sm leading-relaxed">
                    <p>To use our services, you must:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Be at least 18 years old or have parental/guardian consent</li>
                      <li>Provide accurate and complete registration information</li>
                      <li>Maintain the security of your account credentials</li>
                      <li>Notify us immediately of any unauthorized account access</li>
                      <li>Use the platform only for lawful purposes</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-accent-400 mb-4">4. Payment Terms</h3>
                  <div className="text-gray-300 space-y-3 text-sm leading-relaxed">
                    <p>Payment terms for our services:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Fees are due at the time of service booking or as otherwise specified</li>
                      <li>We accept various payment methods including credit cards and digital payments</li>
                      <li>Refunds are subject to our refund policy and applicable regulations</li>
                      <li>Insurance coverage varies by provider and plan</li>
                      <li>You are responsible for any applicable taxes</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-accent-400 mb-4">5. Privacy and Data Protection</h3>
                  <div className="text-gray-300 space-y-3 text-sm leading-relaxed">
                    <p>Your privacy is protected under our Privacy Policy and applicable healthcare regulations:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>We comply with HIPAA and other relevant privacy laws</li>
                      <li>Medical information is shared only with authorized healthcare providers</li>
                      <li>We use industry-standard security measures to protect your data</li>
                      <li>You have rights regarding your personal and medical information</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-accent-400 mb-4">6. Limitation of Liability</h3>
                  <div className="text-gray-300 space-y-3 text-sm leading-relaxed">
                    <p>To the maximum extent permitted by law:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>We are not liable for medical outcomes or treatment decisions</li>
                      <li>Our liability is limited to the amount paid for services</li>
                      <li>We are not responsible for third-party actions or services</li>
                      <li>Technical issues or service interruptions may occur</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-accent-400 mb-4">7. Termination</h3>
                  <div className="text-gray-300 space-y-3 text-sm leading-relaxed">
                    <p>Either party may terminate this agreement:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>You may close your account at any time</li>
                      <li>We may suspend or terminate accounts for violations of these terms</li>
                      <li>Medical records will be retained according to legal requirements</li>
                      <li>Outstanding payments remain due after termination</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-accent-400 mb-4">8. Changes to Terms</h3>
                  <div className="text-gray-300 space-y-3 text-sm leading-relaxed">
                    <p>We may update these terms periodically. We will notify users of significant changes through:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Email notifications to registered users</li>
                      <li>Platform notifications upon login</li>
                      <li>Updates to this page with revision dates</li>
                    </ul>
                    <p className="mt-4">Continued use of our services after changes constitutes acceptance of the new terms.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* User Obligations */}
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
              Your Responsibilities
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              As a user of our healthcare platform, you agree to these important obligations
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userObligations.map((obligation, index) => (
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
                      {obligation.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {obligation.description}
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
              <Gavel className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Questions About These Terms?
            </h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              If you have any questions about these Terms of Service or need clarification on any provisions, 
              please contact our Legal Team.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center text-gray-300">
                <Mail className="w-5 h-5 text-accent-400 mr-2" />
                <span>legal@oxiwell.com</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="w-5 h-5 text-accent-400 mr-2" />
                <span>+91-XXXX-XXXX-XX</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-primary-500">
              <p className="text-sm text-gray-400">
                We typically respond to legal inquiries within 72 hours
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <DeveloperCredit />
    </>
  )
}

export default TermsPage
