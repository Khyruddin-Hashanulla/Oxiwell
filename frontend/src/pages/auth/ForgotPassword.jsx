import React from 'react'
import { Link } from 'react-router-dom'

const ForgotPassword = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
        <p className="mt-2 text-gray-600">Enter your email to reset your password</p>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <p className="text-primary-600 text-sm">
          Password reset functionality is under development.
        </p>
      </div>

      <div className="text-center">
        <Link
          to="/login"
          className="font-medium text-primary-600 hover:text-primary-500"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}

export default ForgotPassword
