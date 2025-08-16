import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Check, Shield, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { authAPI } from '../../services/api'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    try {
      setIsLoading(true)
      const response = await authAPI.forgotPassword(email)
      
      if (response.data.status === 'success') {
        setIsEmailSent(true)
        toast.success('Password reset email sent successfully!')
      } else {
        toast.error(response.data.message || 'Failed to send reset email')
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      toast.error(error.response?.data?.message || 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          {/* Glass morphism card */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Check Your Email</h2>
              <p className="text-gray-300 text-lg">
                We've sent a password reset link to
              </p>
              <p className="text-accent-400 font-semibold text-lg mt-1">{email}</p>
            </div>

            {/* Instructions Card */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-accent-400" />
                Next Steps
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <p className="text-gray-300">Check your email inbox for the reset link</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <p className="text-gray-300">Click the link to create a new password</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <p className="text-gray-300">Check spam folder if email doesn't arrive</p>
                </div>
              </div>
              
              {/* Timer warning */}
              <div className="mt-4 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-300 text-sm font-medium">
                    Reset link expires in 1 hour
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={() => {
                  setIsEmailSent(false)
                  setEmail('')
                }}
                className="w-full bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                Send Another Email
              </button>
              
              <Link
                to="/login"
                className="flex items-center justify-center space-x-2 text-gray-300 hover:text-white transition-colors py-3 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Glass morphism card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Reset Password</h2>
            <p className="text-gray-300 text-lg">Enter your email to receive a reset link</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-3">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white py-4 px-6 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Sending Reset Link...</span>
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Info Card */}
          <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-300 text-sm font-medium mb-1">Important Note</p>
                <p className="text-gray-300 text-sm">
                  If you don't have an account with this email, you won't receive a reset link. 
                  Make sure to use the email address you registered with.
                </p>
              </div>
            </div>
          </div>

          {/* Back Link */}
          <div className="text-center mt-8">
            <Link
              to="/login"
              className="flex items-center justify-center space-x-2 text-gray-300 hover:text-white transition-colors py-3 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
