import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  HelpCircle, 
  Book, 
  MessageCircle, 
  Phone, 
  Mail,
  ChevronDown,
  ChevronUp,
  Calendar,
  FileText,
  Shield,
  CreditCard
} from 'lucide-react'
import DeveloperCredit from '../../components/common/DeveloperCredit'

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [openFAQ, setOpenFAQ] = useState(null)

  const faqCategories = [
    {
      title: 'Getting Started',
      icon: Book,
      faqs: [
        {
          question: 'How do I create an account?',
          answer: 'Click on "Get Started" or "Register" button, choose your role (Patient or Doctor), fill in your details, and verify your email with the OTP sent to you.'
        },
        {
          question: 'What information do I need to provide during registration?',
          answer: 'You\'ll need to provide your name, email, phone number, date of birth, gender, blood group, and create a secure password. Doctors need additional professional information.'
        },
        {
          question: 'How do I reset my password?',
          answer: 'Click "Forgot Password" on the login page, enter your email address, and follow the instructions in the reset email sent to you.'
        }
      ]
    },
    {
      title: 'Appointments',
      icon: Calendar,
      faqs: [
        {
          question: 'How do I book an appointment?',
          answer: 'Go to your dashboard, click "Book Appointment", select a doctor, choose a hospital/clinic, pick your preferred date and time, then confirm your booking.'
        },
        {
          question: 'Can I reschedule or cancel my appointment?',
          answer: 'Yes, you can reschedule or cancel appointments up to 24 hours before the scheduled time through your appointments page.'
        },
        {
          question: 'How will I receive appointment reminders?',
          answer: 'You\'ll receive email notifications and in-app notifications 24 hours and 1 hour before your appointment.'
        },
        {
          question: 'What if I\'m late for my appointment?',
          answer: 'Please contact the clinic directly if you\'re running late. Appointments may be rescheduled based on doctor availability.'
        }
      ]
    },
    {
      title: 'Medical Records',
      icon: FileText,
      faqs: [
        {
          question: 'How do I upload medical reports?',
          answer: 'Go to the Reports section in your dashboard, click "Upload Report", select the report type, choose your files, and add any necessary notes.'
        },
        {
          question: 'What file formats are supported for reports?',
          answer: 'We support PDF, JPEG, PNG, DOC, and DOCX files up to 10MB each. You can upload up to 5 files at once.'
        },
        {
          question: 'How do I share my reports with doctors?',
          answer: 'Your reports are automatically accessible to doctors you have appointments with. You can also manually share specific reports through the sharing feature.'
        },
        {
          question: 'Can I download my prescriptions?',
          answer: 'Yes, all prescriptions can be downloaded as PDF files from your prescriptions page. You can also print them directly.'
        }
      ]
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      faqs: [
        {
          question: 'How is my health data protected?',
          answer: 'We use enterprise-grade encryption, secure servers, and comply with HIPAA regulations to protect your health information.'
        },
        {
          question: 'Who can access my medical records?',
          answer: 'Only you and the healthcare providers you have appointments with can access your medical records. We never share your data without your consent.'
        },
        {
          question: 'Can I delete my account and data?',
          answer: 'Yes, you can request account deletion through your settings. All your personal data will be permanently removed within 30 days.'
        }
      ]
    },
    {
      title: 'Billing & Payments',
      icon: CreditCard,
      faqs: [
        {
          question: 'How do I pay for consultations?',
          answer: 'Payment is processed securely during the appointment booking process. We accept all major credit cards and digital payment methods.'
        },
        {
          question: 'Can I get a refund for cancelled appointments?',
          answer: 'Refunds are processed automatically for cancellations made 24+ hours in advance. Contact support for special circumstances.'
        },
        {
          question: 'Where can I find my billing history?',
          answer: 'Your complete billing history is available in the Billing section of your dashboard, including receipts and payment details.'
        }
      ]
    }
  ]

  const quickHelp = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      action: 'Start Chat',
      available: 'Mon-Fri 9AM-6PM'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our support specialists',
      action: 'Call Now',
      available: '+91-XXXX-XXXX-XX'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us your questions and get detailed responses',
      action: 'Send Email',
      available: 'support@oxiwell.com'
    }
  ]

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0)

  const toggleFAQ = (categoryIndex, faqIndex) => {
    const key = `${categoryIndex}-${faqIndex}`
    setOpenFAQ(openFAQ === key ? null : key)
  }

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
              Help <span className="text-accent-400">Center</span>
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Find answers to your questions and get the support you need
            </motion.p>

            {/* Search Bar */}
            <motion.div 
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for help articles, FAQs, or guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 backdrop-blur-sm"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Help Options */}
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
              Get Help Now
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {quickHelp.map((help, index) => {
              const IconComponent = help.icon
              return (
                <motion.div
                  key={index}
                  className="bg-gradient-to-br from-primary-700 to-primary-600 rounded-2xl p-8 border border-primary-500 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-16 h-16 bg-gradient-accent rounded-xl flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {help.title}
                  </h3>
                  <p className="text-gray-300 mb-6">
                    {help.description}
                  </p>
                  <p className="text-sm text-accent-400 mb-6">
                    {help.available}
                  </p>
                  <button className="bg-gradient-accent hover:shadow-lg text-white px-6 py-3 rounded-lg font-medium transition-all duration-200">
                    {help.action}
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-secondary-900 to-primary-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Frequently Asked Questions
            </motion.h2>
          </div>

          {(searchQuery ? filteredFAQs : faqCategories).map((category, categoryIndex) => {
            const IconComponent = category.icon
            return (
              <motion.div
                key={categoryIndex}
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-8">
                  <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center mr-4">
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{category.title}</h3>
                </div>

                <div className="space-y-4">
                  {category.faqs.map((faq, faqIndex) => {
                    const isOpen = openFAQ === `${categoryIndex}-${faqIndex}`
                    return (
                      <div
                        key={faqIndex}
                        className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl border border-primary-600 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFAQ(categoryIndex, faqIndex)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-primary-600 transition-colors duration-200"
                        >
                          <span className="text-white font-medium">{faq.question}</span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-accent-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-accent-400" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-4">
                            <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}

          {searchQuery && filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
              <p className="text-gray-300">Try searching with different keywords or contact our support team.</p>
            </div>
          )}
        </div>
      </section>

      <DeveloperCredit />
    </>
  )
}

export default HelpPage
