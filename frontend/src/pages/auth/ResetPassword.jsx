import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, ArrowLeft, Check, Shield, AlertTriangle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { authAPI } from '../../services/api'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState(true)
  const [isPasswordReset, setIsPasswordReset] = useState(false)

  useEffect(() => {
    if (!token) {
      setIsTokenValid(false)
    }
  }, [token])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.password) {
      toast.error('Please enter a new password')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      setIsLoading(true)
      const response = await authAPI.resetPassword({
        token,
        password: formData.password
      })
      
      if (response.data.status === 'success') {
        setIsPasswordReset(true)
        toast.success('Password reset successfully!')
      } else {
        toast.error(response.data.message || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Reset password error:', error)
      if (error.response?.status === 400) {
        toast.error('Invalid or expired reset token')
        setIsTokenValid(false)
      } else {
        toast.error(error.response?.data?.message || 'Failed to reset password')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
            {/* Error Icon */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Invalid Reset Link</h2>
              <p className="text-gray-300 text-lg">
                This password reset link is invalid or has expired.
              </p>
            </div>

            {/* Error Info Card */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                What happened?
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <p className="text-gray-300">The reset link may have expired (links expire after 1 hour)</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <p className="text-gray-300">The link may have been used already</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <p className="text-gray-300">The link may be malformed or incomplete</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Link
                to="/forgot-password"
                className="w-full bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl text-center block"
              >
                Request New Reset Link
              </Link>
              
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

  if (isPasswordReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Password Reset Complete</h2>
              <p className="text-gray-300 text-lg">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
            </div>

            {/* Success Info */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mb-8">
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-green-300 font-semibold">Security Update Complete</p>
                  <p className="text-gray-300 text-sm mt-1">Your account is now secured with the new password</p>
                </div>
              </div>
            </div>

            <Link
              to="/login"
              className="w-full bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl text-center block"
            >
              Sign In Now
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Reset Password</h2>
            <p className="text-gray-300 text-lg">Enter your new password below</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-3">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-400">Password must be at least 8 characters long</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-300 mb-3">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
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
                  <span>Resetting Password...</span>
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Security Tips Card */}
          <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-300 font-semibold mb-2">Security Tips</p>
                <div className="space-y-1 text-gray-300 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span>Use a strong, unique password</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span>Include uppercase, lowercase, numbers, and symbols</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span>Don't reuse passwords from other accounts</span>
                  </div>
                </div>
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

export default ResetPassword
