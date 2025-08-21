import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react'
import DeveloperCredit from '../../components/common/DeveloperCredit'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Contact form submitted:', formData)
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    })
    alert('Thank you for your message! We\'ll get back to you soon.')
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      details: [
        'Healthcare District',
        'Main Street, City 700001',
        'India'
      ]
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: [
        'Main: +91-XXXX-XXXX-XX',
        'Emergency: +91-XXXX-XXXX-XX',
        'Support: +91-XXXX-XXXX-XX'
      ]
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: [
        'info@oxiwell.com',
        'support@oxiwell.com',
        'appointments@oxiwell.com'
      ]
    },
    {
      icon: Clock,
      title: 'Office Hours',
      details: [
        'Monday - Friday: 8:00 AM - 6:00 PM',
        'Saturday: 9:00 AM - 4:00 PM',
        'Sunday: Emergency Only'
      ]
    }
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
              Get in <span className="text-accent-400">Touch</span>
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Have questions about Oxiwell? Need support with your account? 
              We're here to help you every step of the way.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-gradient-to-br from-primary-800 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon
              return (
                <motion.div
                  key={index}
                  className="bg-gradient-to-br from-primary-700 to-primary-600 rounded-xl p-8 border border-primary-500 shadow-lg hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-4">
                      {info.title}
                    </h3>
                    <div className="space-y-2">
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-300">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="py-20 bg-gradient-to-br from-secondary-900 to-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-8 border border-primary-600 shadow-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-white mb-6">Send us a Message</h2>
              <p className="text-gray-300 mb-8">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-white mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="What's this about?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-accent-600 to-accent-700 text-white font-medium py-4 px-6 rounded-lg hover:from-accent-700 hover:to-accent-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </button>
              </form>
            </motion.div>

            {/* Find Us Card */}
            <motion.div
              className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-8 border border-primary-600 shadow-lg"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-2xl font-bold text-white mb-6">Find Us</h3>
              <div className="bg-primary-600 rounded-lg h-64 flex items-center justify-center mb-6">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">Interactive map coming soon</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-accent-400 mt-1" />
                  <div>
                    <p className="text-white font-medium">Address</p>
                    <p className="text-gray-300 text-sm">Main Street<br />Healthcare District, City 700001</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-accent-400 mt-1" />
                  <div>
                    <p className="text-white font-medium">Business Hours</p>
                    <p className="text-gray-300 text-sm">Mon-Fri: 8:00 AM - 6:00 PM<br />Sat-Sun: 9:00 AM - 4:00 PM</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-secondary-900 to-primary-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-300">
              Quick answers to common questions about Oxiwell
            </p>
          </div>
          
          <div className="space-y-6">
            {[
              {
                question: "How do I book an appointment?",
                answer: "Simply log into your account, navigate to the appointments section, select your preferred doctor and time slot, and confirm your booking."
              },
              {
                question: "Can I cancel or reschedule my appointment?",
                answer: "Yes, you can cancel or reschedule appointments up to 24 hours before your scheduled time through your patient dashboard."
              },
              {
                question: "How do I access my medical reports?",
                answer: "All your medical reports are available in the 'Reports' section of your dashboard. You can view, download, or share them with other healthcare providers."
              },
              {
                question: "Is my health information secure?",
                answer: "Absolutely. We use industry-standard encryption and comply with HIPAA regulations to ensure your health information is completely secure and private."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-semibold text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-300">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency & Support Info */}
      <section className="py-20 bg-gradient-to-br from-primary-800 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Emergency Contact */}
            <motion.div
              className="bg-error-700 rounded-xl p-8 border border-error-600"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                Emergency Contact
              </h3>
              <p className="text-error-100 mb-4">
                For medical emergencies, please call 911 immediately or visit your nearest emergency room.
              </p>
              <div className="bg-error-600 bg-opacity-50 rounded-lg p-4">
                <p className="text-white font-bold text-lg">
                  24/7 Emergency Line: +91-XXXX-XXXX-XX
                </p>
              </div>
            </motion.div>

            {/* Support Hours */}
            <motion.div
              className="bg-gradient-to-br from-accent-800 to-accent-700 rounded-xl p-8 border border-accent-600"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                Support Hours
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-accent-100 font-medium">Phone Support:</span>
                  <span className="text-white">Mon-Fri 8AM-8PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-accent-100 font-medium">Live Chat:</span>
                  <span className="text-white">Mon-Fri 9AM-6PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-accent-100 font-medium">Email Support:</span>
                  <span className="text-white">24/7 Response</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <DeveloperCredit />
    </>
  )
}

export default ContactPage
