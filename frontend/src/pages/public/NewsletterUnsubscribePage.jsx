import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import DeveloperCredit from '../../components/common/DeveloperCredit'

const NewsletterUnsubscribePage = () => {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [isUnsubscribing, setIsUnsubscribing] = useState(false)
  const [isUnsubscribed, setIsUnsubscribed] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Get email from URL params if provided
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleUnsubscribe = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsUnsubscribing(true)
    setError('')

    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase()
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsUnsubscribed(true)
        toast.success('Successfully unsubscribed from newsletter')
      } else {
        if (response.status === 404) {
          setError('Email address not found in our newsletter list')
        } else {
          setError(data.message || 'Failed to unsubscribe. Please try again.')
        }
      }
    } catch (error) {
      console.error('Unsubscribe error:', error)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsUnsubscribing(false)
    }
  }

  if (isUnsubscribed) {
    return (
      <>
        {/* Success State */}
        <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 flex items-center justify-center px-4">
          <motion.div
            className="max-w-md w-full bg-gradient-to-br from-primary-700 to-primary-600 rounded-2xl p-8 border border-primary-500 shadow-xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">
              Unsubscribed Successfully
            </h1>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              You have been successfully unsubscribed from our newsletter. 
              You will no longer receive healthcare updates and tips from Oxiwell.
            </p>

            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Changed your mind? You can always subscribe again from our website.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/"
                  className="flex-1 bg-gradient-accent hover:shadow-lg text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
                
                <Link
                  to="/contact"
                  className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 border border-primary-400"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
        <DeveloperCredit />
      </>
    )
  }

  return (
    <>
      {/* Unsubscribe Form */}
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 flex items-center justify-center px-4">
        <motion.div
          className="max-w-md w-full bg-gradient-to-br from-primary-700 to-primary-600 rounded-2xl p-8 border border-primary-500 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">
              Unsubscribe from Newsletter
            </h1>
            
            <p className="text-gray-300 leading-relaxed">
              We're sorry to see you go. Enter your email address to unsubscribe 
              from our healthcare newsletter.
            </p>
          </div>

          <form onSubmit={handleUnsubscribe} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder="Enter your email address"
                required
                disabled={isUnsubscribing}
                className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
              />
            </div>

            {error && (
              <motion.div
                className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-start space-x-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isUnsubscribing}
              className="w-full bg-gradient-accent hover:shadow-xl text-white py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isUnsubscribing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Unsubscribing...</span>
                </div>
              ) : (
                'Unsubscribe'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-primary-500 text-center">
            <p className="text-sm text-gray-400 mb-4">
              Having trouble? Contact our support team
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/"
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 border border-primary-400"
              >
                Back to Home
              </Link>
              <Link
                to="/support"
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 border border-primary-400"
              >
                Get Support
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
      <DeveloperCredit />
    </>
  )
}

export default NewsletterUnsubscribePage
