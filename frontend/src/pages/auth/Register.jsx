import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Cookies from 'js-cookie';
import api from '../../services/api';

const Register = () => {
  const [step, setStep] = useState(1); // 1: Registration Form, 2: OTP Verification
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [selectedRole, setSelectedRole] = useState(''); // Add state for role selection
  const navigate = useNavigate();
  const { login } = useAuth(); // Use AuthContext login function

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm();

  const {
    register: registerOTP,
    handleSubmit: handleSubmitOTP,
    formState: { errors: otpErrors },
    setValue: setOTPValue
  } = useForm();

  // Step 1: Registration Form Submission
  const onSubmitRegistration = async (data) => {
    setIsLoading(true);
    try {
      // Validate role selection
      if (!selectedRole) {
        toast.error('Please select your role (Patient or Doctor)');
        setIsLoading(false);
        return;
      }

      // Add selected role to form data
      const registrationData = {
        ...data,
        role: selectedRole
      };

      console.log(' Submitting registration:', { ...registrationData, password: '***' });
      
      const response = await authAPI.register(registrationData);
      
      if (response.data.status === 'success') {
        setEmail(data.email);
        setStep(2);
        toast.success('Verification code sent to your email!');
        startOTPTimer();
      } else {
        toast.error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error(' Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: OTP Verification
  const onSubmitOTP = async (data) => {
    setIsLoading(true);
    try {
      console.log(' Verifying OTP for:', email);
      
      const response = await authAPI.verifyOTP({
        email,
        otp: data.otp
      });
      
      if (response.data.status === 'success') {
        const token = response.data.token;
        const user = response.data.data.user;
        
        // Store token in cookie
        Cookies.set('token', token, { expires: 7, secure: false, sameSite: 'lax' });
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        toast.success('Account created successfully! Welcome to Oxiwell!');
        
        // Navigate to appropriate dashboard based on user role
        const dashboardRoute = user.role === 'patient' ? '/patient/dashboard' : 
                              user.role === 'doctor' ? '/doctor/dashboard' : 
                              '/admin/dashboard';
        
        navigate(dashboardRoute);
      } else {
        toast.error(response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error(' OTP verification error:', error);
      const errorMessage = error.response?.data?.message || 'OTP verification failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const resendOTP = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.resendOTP({ email });
      
      if (response.data.status === 'success') {
        toast.success('New verification code sent!');
        startOTPTimer();
      } else {
        toast.error(response.data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error(' Resend OTP error:', error);
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Timer
  const startOTPTimer = () => {
    setOtpTimer(60);
    const timer = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Back to registration form
  const goBackToRegistration = () => {
    setStep(1);
    setEmail('');
    reset();
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 m-0 p-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Left Side - Hero Section (Hidden on mobile) */}
      <div className="hidden md:flex bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden w-full min-h-screen">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-8 lg:p-12">
          <div className="flex-1 flex flex-col justify-center">
            {/* Logo */}
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white">Oxiwell</h1>
            </div>

            {/* Main Heading */}
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Join Thousands of<br />
              <span className="text-primary-300">Satisfied Patients</span>
            </h2>

            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Experience world-class healthcare management with our comprehensive platform trusted by healthcare professionals worldwide.
            </p>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white">50K+</div>
                <div className="text-gray-300 text-sm">Happy Patients</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-gray-300 text-sm">Expert Doctors</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-gray-300 text-sm">Support</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="text-gray-300 text-sm">Uptime</div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Secure & HIPAA Compliant</span>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Easy Appointment Booking</span>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Digital Health Records</span>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Real-time Notifications</span>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Multi-platform Access</span>
              </div>
            </div>
          </div>

          {/* Bottom Testimonial */}
          <div className="mt-auto">
            <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Trusted by Founder</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                "Oxiwell has transformed how we manage patient care. The platform is intuitive, secure, and has significantly improved our operational efficiency."
              </p>
              <div className="mt-4 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">DR</span>
                </div>
                <div>
                  <div className="text-white font-medium text-sm">Khyruddin Hashanulla</div>
                  <div className="text-gray-300 text-xs">Software Engineer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 w-full min-h-screen">
        <div className="w-full max-w-[500px] sm:max-w-none sm:w-full">
          {/* Mobile Logo */}
          <div className="flex md:hidden items-center justify-center mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Oxiwell</h1>
          </div>

          <div className="bg-gradient-to-br from-primary-800 to-primary-700 shadow-lg rounded-2xl p-6 sm:p-8 border border-primary-600">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-gray-300">Fill in your details to get started</p>
            </div>

            {/* Main Form Container */}
            {step === 1 ? (
              <form onSubmit={handleSubmit(onSubmitRegistration)} className="space-y-6">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-white mb-3">I want to register as:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className={`relative flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 cursor-pointer hover:bg-white/20 transition-all duration-200 ${selectedRole === 'patient' ? 'bg-white/20 border-accent-400' : ''}`}>
                      <input
                        type="radio"
                        value="patient"
                        checked={selectedRole === 'patient'}
                        onChange={() => setSelectedRole('patient')}
                        className="sr-only"
                      />
                      <div className="flex items-center w-full">
                        <div className="w-5 h-5 border-2 border-white rounded-full mr-3 flex items-center justify-center">
                          <div className={`w-2.5 h-2.5 bg-accent-400 rounded-full ${selectedRole === 'patient' ? 'opacity-100' : 'opacity-0'} transition-opacity`}></div>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-6 h-6 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <div className="text-white font-medium">Patient</div>
                            <div className="text-gray-300 text-sm">Book appointments & manage health</div>
                          </div>
                        </div>
                      </div>
                    </label>
                    <label className={`relative flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 cursor-pointer hover:bg-white/20 transition-all duration-200 ${selectedRole === 'doctor' ? 'bg-white/20 border-accent-400' : ''}`}>
                      <input
                        type="radio"
                        value="doctor"
                        checked={selectedRole === 'doctor'}
                        onChange={() => setSelectedRole('doctor')}
                        className="sr-only"
                      />
                      <div className="flex items-center w-full">
                        <div className="w-5 h-5 border-2 border-white rounded-full mr-3 flex items-center justify-center">
                          <div className={`w-2.5 h-2.5 bg-accent-400 rounded-full ${selectedRole === 'doctor' ? 'opacity-100' : 'opacity-0'} transition-opacity`}></div>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-6 h-6 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <div className="text-white font-medium">Doctor</div>
                            <div className="text-gray-300 text-sm">Provide care & manage patients</div>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                  {!selectedRole && (
                    <p className="mt-2 text-sm text-red-300 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Please select your role
                    </p>
                  )}
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">First Name *</label>
                    <input
                      type="text"
                      {...register('firstName', { required: 'First name is required' })}
                      className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200"
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-300">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Last Name *</label>
                    <input
                      type="text"
                      {...register('lastName', { required: 'Last name is required' })}
                      className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200"
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-300">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                {/* Doctor-specific fields */}
                {selectedRole === 'doctor' && (
                  <div className="space-y-4 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                    <h4 className="text-white font-medium flex items-center">
                      <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Medical Professional Information
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Registration No *</label>
                        <input
                          type="text"
                          {...register('licenseNumber', { 
                            required: selectedRole === 'doctor' ? 'Medical license is required' : false
                          })}
                          className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200"
                          placeholder="e.g., MH123456"
                        />
                        {errors.licenseNumber && (
                          <p className="mt-1 text-sm text-red-300">{errors.licenseNumber.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Specialization *</label>
                        <select
                          {...register('specialization', { 
                            required: selectedRole === 'doctor' ? 'Specialization is required' : false 
                          })}
                          className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200"
                        >
                          <option value="" className="bg-primary-800">Select specialization</option>
                          <option value="General Medicine" className="bg-primary-800">General Medicine</option>
                          <option value="Cardiology" className="bg-primary-800">Cardiology</option>
                          <option value="Dermatology" className="bg-primary-800">Dermatology</option>
                          <option value="Pediatrics" className="bg-primary-800">Pediatrics</option>
                          <option value="Orthopedics" className="bg-primary-800">Orthopedics</option>
                          <option value="Gynecology" className="bg-primary-800">Gynecology</option>
                          <option value="Neurology" className="bg-primary-800">Neurology</option>
                          <option value="Psychiatry" className="bg-primary-800">Psychiatry</option>
                          <option value="ENT" className="bg-primary-800">ENT</option>
                          <option value="Ophthalmology" className="bg-primary-800">Ophthalmology</option>
                          <option value="Dentistry" className="bg-primary-800">Dentistry</option>
                          <option value="Other" className="bg-primary-800">Other</option>
                        </select>
                        {errors.specialization && (
                          <p className="mt-1 text-sm text-red-300">{errors.specialization.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Experience *</label>
                        <select
                          {...register('experience', { 
                            required: selectedRole === 'doctor' ? 'Experience is required' : false 
                          })}
                          className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200"
                        >
                          <option value="" className="bg-primary-800">Select experience</option>
                          <option value="0-2" className="bg-primary-800">0-2 years</option>
                          <option value="3-5" className="bg-primary-800">3-5 years</option>
                          <option value="6-10" className="bg-primary-800">6-10 years</option>
                          <option value="11-15" className="bg-primary-800">11-15 years</option>
                          <option value="16-20" className="bg-primary-800">16-20 years</option>
                          <option value="20+" className="bg-primary-800">20+ years</option>
                        </select>
                        {errors.experience && (
                          <p className="mt-1 text-sm text-red-300">{errors.experience.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Qualification *</label>
                        <input
                          type="text"
                          {...register('qualification', { 
                            required: selectedRole === 'doctor' ? 'Qualification is required' : false
                          })}
                          className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200"
                          placeholder="e.g., MBBS, MD, MS"
                        />
                        {errors.qualification && (
                          <p className="mt-1 text-sm text-red-300">{errors.qualification.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Email Address *</label>
                    <input
                      type="email"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Please enter a valid email address (e.g., user@example.com)'
                        }
                      })}
                      className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200"
                      placeholder="Enter your email address (e.g., user@example.com)"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-300 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      {...register('phone', { 
                        required: 'Phone number is required'
                      })}
                      className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200"
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-300">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Personal Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Password *</label>
                    <input
                      type="password"
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters'
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                        }
                      })}
                      className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200"
                      placeholder="Create a strong password (8+ chars, A-z, 0-9)"
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-300">{errors.password.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      Must contain at least 8 characters with uppercase, lowercase, and number
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Date of Birth *</label>
                      <input
                        type="date"
                        {...register('dateOfBirth', { required: 'Date of birth is required' })}
                        className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200"
                      />
                      {errors.dateOfBirth && (
                        <p className="mt-1 text-sm text-red-300">{errors.dateOfBirth.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Gender *</label>
                      <select
                        {...register('gender', { required: 'Gender is required' })}
                        className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200"
                      >
                        <option value="" className="bg-primary-800">Select Gender</option>
                        <option value="male" className="bg-primary-800">Male</option>
                        <option value="female" className="bg-primary-800">Female</option>
                        <option value="other" className="bg-primary-800">Other</option>
                      </select>
                      {errors.gender && (
                        <p className="mt-1 text-sm text-red-300">{errors.gender.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Blood Group</label>
                      <select
                        {...register('bloodGroup')}
                        className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200"
                      >
                        <option value="" className="bg-primary-800">Select Blood Group</option>
                        <option value="A+" className="bg-primary-800">A+</option>
                        <option value="A-" className="bg-primary-800">A-</option>
                        <option value="B+" className="bg-primary-800">B+</option>
                        <option value="B-" className="bg-primary-800">B-</option>
                        <option value="AB+" className="bg-primary-800">AB+</option>
                        <option value="AB-" className="bg-primary-800">AB-</option>
                        <option value="O+" className="bg-primary-800">O+</option>
                        <option value="O-" className="bg-primary-800">O-</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>

                <div className="text-center text-sm text-gray-300">
                  Already have an account?{' '}
                  <Link to="/login" className="text-accent-400 hover:text-accent-300 font-medium">
                    Sign in here
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitOTP(onSubmitOTP)} className="space-y-6">
                {/* OTP Verification */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Verify Your Email
                  </h2>
                  <p className="text-gray-300">
                    We've sent a verification code to {email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Verification Code *
                  </label>
                  <input
                    type="text"
                    maxLength="6"
                    {...registerOTP('otp', {
                      required: 'OTP is required',
                      pattern: {
                        value: /^\d{6}$/,
                        message: 'OTP must be 6 digits'
                      }
                    })}
                    className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 text-center text-lg font-mono tracking-widest"
                    placeholder="123456"
                    autoComplete="one-time-code"
                  />
                  {otpErrors.otp && (
                    <p className="mt-1 text-sm text-red-300">{otpErrors.otp.message}</p>
                  )}
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={resendOTP}
                    disabled={otpTimer > 0 || isLoading}
                    className="text-accent-400 hover:text-accent-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {otpTimer > 0 ? `Resend code in ${otpTimer}s` : 'Resend verification code'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-4 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </div>
                  ) : (
                    'Verify & Complete Registration'
                  )}
                </button>

                <button
                  type="button"
                  onClick={goBackToRegistration}
                  className="w-full py-4 px-4 border border-white/20 text-white font-medium rounded-xl bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition-all duration-300"
                >
                  Back to Registration
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
