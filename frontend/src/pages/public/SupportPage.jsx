import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Headphones,
  AlertCircle,
  CheckCircle,
  FileText,
  Users,
  Zap
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import DeveloperCredit from '../../components/common/DeveloperCredit'

const SupportPage = () => {
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    category: '',
    priority: '',
    subject: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setTicketForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Support ticket submitted successfully! We\'ll get back to you soon.')
      setTicketForm({
        name: '',
        email: '',
        category: '',
        priority: '',
        subject: '',
        description: ''
      })
      setIsSubmitting(false)
    }, 1000)
  }

  const supportChannels = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      availability: 'Mon-Fri: 9:00 AM - 6:00 PM',
      responseTime: 'Typically responds in 2-5 minutes',
      action: 'Start Chat',
      color: 'from-blue-600 to-blue-700'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our specialists',
      availability: 'Mon-Fri: 8:00 AM - 8:00 PM',
      responseTime: 'Immediate assistance',
      action: '+91-XXXX-XXXX-XX',
      color: 'from-green-600 to-green-700'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send detailed questions and get comprehensive responses',
      availability: '24/7 - We monitor emails continuously',
      responseTime: 'Response within 4-6 hours',
      action: 'support@oxiwell.com',
      color: 'from-purple-600 to-purple-700'
    }
  ]

  const supportStats = [
    {
      icon: Clock,
      title: '< 2 Hours',
      description: 'Average Response Time'
    },
    {
      icon: Users,
      title: '98.5%',
      description: 'Customer Satisfaction'
    },
    {
      icon: CheckCircle,
      title: '24/7',
      description: 'Support Availability'
    },
    {
      icon: Zap,
      title: '< 1 Day',
      description: 'Average Resolution Time'
    }
  ]

  const categories = [
    'Technical Issues',
    'Account & Billing',
    'Appointments',
    'Medical Records',
    'Privacy & Security',
    'Feature Request',
    'General Inquiry'
  ]

  const priorities = [
    { value: 'low', label: 'Low - General question' },
    { value: 'medium', label: 'Medium - Need assistance' },
    { value: 'high', label: 'High - Urgent issue' },
    { value: 'critical', label: 'Critical - System down' }
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
              We're Here to <span className="text-accent-400">Help</span>
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Get the support you need, when you need it. Our dedicated team is ready to assist you with any questions or issues.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Support Stats */}
      <section className="py-16 bg-gradient-to-br from-primary-800 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {supportStats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-accent-400 mb-2">
                    {stat.title}
                  </div>
                  <div className="text-gray-300 text-sm">
                    {stat.description}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Support Channels */}
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
              Choose Your Support Channel
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Multiple ways to get help - pick what works best for you
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportChannels.map((channel, index) => {
              const IconComponent = channel.icon
              return (
                <motion.div
                  key={index}
                  className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-2xl p-8 border border-primary-600 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${channel.color} rounded-xl flex items-center justify-center mb-6`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {channel.title}
                  </h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {channel.description}
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-300">
                      <Clock className="w-4 h-4 mr-2 text-accent-400" />
                      {channel.availability}
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <Zap className="w-4 h-4 mr-2 text-accent-400" />
                      {channel.responseTime}
                    </div>
                  </div>
                  <button className="w-full bg-gradient-accent hover:shadow-lg text-white py-3 px-6 rounded-lg font-medium transition-all duration-200">
                    {channel.action}
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Support Ticket Form */}
      <section className="py-20 bg-gradient-to-br from-primary-800 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Submit a Support Ticket
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Can't find what you're looking for? Submit a detailed support request and we'll help you out.
            </motion.p>
          </div>

          <motion.div
            className="bg-gradient-to-br from-primary-700 to-primary-600 rounded-2xl p-8 border border-primary-500 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
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
                    value={ticketForm.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
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
                    value={ticketForm.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-white mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={ticketForm.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-white mb-2">
                    Priority *
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={ticketForm.priority}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    <option value="">Select priority</option>
                    {priorities.map((priority) => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
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
                  value={ticketForm.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  value={ticketForm.description}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                  placeholder="Please provide as much detail as possible about your issue, including steps to reproduce if applicable..."
                />
              </div>

              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-300 text-sm font-medium mb-1">Tip for faster resolution:</p>
                    <p className="text-gray-300 text-sm">
                      Include screenshots, error messages, and step-by-step details of what you were trying to do when the issue occurred.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-accent hover:shadow-xl text-white py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="w-5 h-5" />
                    <span>Submit Support Ticket</span>
                  </div>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      <DeveloperCredit />
    </>
  )
}

export default SupportPage
