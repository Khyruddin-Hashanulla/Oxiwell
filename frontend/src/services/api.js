import axios from 'axios'
import toast from 'react-hot-toast'
import Cookies from 'js-cookie'

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

console.log('🌐 API Base URL:', API_BASE_URL)
console.log('🔧 Environment VITE_API_URL:', import.meta.env.VITE_API_URL)

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased from 30s to 60s for slower connections
  headers: {
    'Content-Type': 'application/json',
  },
  // Add retry configuration
  retry: 3,
  retryDelay: 1000
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check localStorage first, then cookies as fallback
    const token = localStorage.getItem('token') || Cookies.get('token')
    console.log('🔍 API Request Debug:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
    })
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      // Check if this is a protected route that needs authentication
      const protectedRoutes = ['/doctors/', '/patients/', '/appointments/', '/prescriptions/', '/reports/']
      const isProtectedRoute = protectedRoutes.some(route => config.url.includes(route))
      
      if (isProtectedRoute) {
        console.warn('⚠️ Making request to protected route without token:', config.url)
      }
    }
    
    return config
  },
  (error) => {
    console.error('❌ Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Add retry interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const { response, config } = error
    
    // Retry logic for network errors
    if (!response && config && !config.__isRetryRequest) {
      config.__retryCount = config.__retryCount || 0
      
      if (config.__retryCount < (config.retry || 3)) {
        config.__retryCount++
        config.__isRetryRequest = true
        
        console.log(`🔄 Retrying request (${config.__retryCount}/${config.retry || 3}):`, config.url)
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, config.retryDelay || 1000))
        
        return api(config)
      }
    }

    if (response) {
      const { status, data } = response
      
      console.log('🚨 API Response Error:', {
        status,
        url: response.config?.url,
        method: response.config?.method,
        data: data,
        hasAuthHeader: !!response.config?.headers?.Authorization
      })

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          console.log('🔐 401 Unauthorized - clearing token and redirecting to login')
          Cookies.remove('token')
          localStorage.removeItem('token')
          delete api.defaults.headers.common['Authorization']
          toast.error('Session expired. Please login again.')
          // Only redirect if not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          break

        case 403:
          toast.error('Access denied. You do not have permission to perform this action.')
          break

        case 404:
          toast.error('Resource not found.')
          break

        case 422:
          // Validation errors
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach((err) => {
              toast.error(err.msg || err.message)
            })
          } else {
            toast.error(data.message || 'Validation error occurred.')
          }
          break

        case 429:
          toast.error('Too many requests. Please try again later.')
          break

        case 500:
          toast.error('Server error. Please try again later.')
          break

        default:
          toast.error(data.message || 'An unexpected error occurred.')
      }
    } else if (error.request) {
      // Network error - provide more specific information
      console.error('🌐 Network Error Details:', {
        code: error.code,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          timeout: error.config?.timeout,
          retryCount: error.config?.__retryCount || 0
        }
      })
      
      if (error.code === 'ECONNREFUSED') {
        toast.error('Cannot connect to server. Please ensure the backend is running on port 8080.')
      } else if (error.code === 'TIMEOUT' || error.message.includes('timeout')) {
        toast.error('Request timed out. Server may be slow or unavailable.')
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        // More specific error for appointment loading
        if (error.config?.url?.includes('/appointments')) {
          toast.error('Failed to load appointments. Please check your connection and try refreshing the page.')
        } else {
          toast.error('Network error. Please check your internet connection and server status.')
        }
      } else {
        toast.error(`Connection failed: ${error.message || 'Please check your connection and ensure backend is running.'}`)
      }
    } else {
      toast.error('An unexpected error occurred.')
    }

    return Promise.reject(error)
  }
)

// Auth API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post(`/auth/reset-password/${data.token}`, { password: data.password }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: () => api.post('/auth/resend-verification'),
}

// Appointments API endpoints
export const appointmentsAPI = {
  // Get all appointments for current user
  getAppointments: () => api.get('/appointments'),
  
  // Get patient appointments (alias for getAppointments)
  getPatientAppointments: () => api.get('/appointments'),
  
  // Get doctor appointments with filtering and pagination
  getDoctorAppointments: (doctorId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/appointments/doctor/${doctorId}?${queryString}` : `/appointments/doctor/${doctorId}`;
    return api.get(url);
  },
  
  // Get single appointment
  getAppointment: (id) => api.get(`/appointments/${id}`),
  
  // Create new appointment
  createAppointment: (data) => api.post('/appointments', data),
  
  // Update appointment
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  rescheduleAppointment: (id, data) => api.put(`/appointments/${id}/reschedule`, data),
  updateAppointmentStatus: (id, status) => api.put(`/appointments/${id}/status`, { status }),
  
  // Cancel appointment
  cancelAppointment: (id, reason) => api.delete(`/appointments/${id}`, { data: { cancellationReason: reason } }),
  
  // Get available doctors (public endpoint)
  getAvailableDoctors: (queryParams = '') => {
    const url = queryParams ? `/appointments/available-doctors?${queryParams}` : '/appointments/available-doctors';
    return api.get(url);
  },
  
  // Get doctor details with workplaces (public endpoint)
  getDoctorDetails: (doctorId) => api.get(`/appointments/doctor/${doctorId}/details`),
  
  // Get available dates for doctor at hospital (public endpoint)
  getAvailableDates: (doctorId, hospitalId, queryParams = '') => {
    const url = queryParams 
      ? `/appointments/doctor/${doctorId}/hospital/${hospitalId}/available-dates?${queryParams}`
      : `/appointments/doctor/${doctorId}/hospital/${hospitalId}/available-dates`;
    return api.get(url);
  },
  
  // Get available time slots (public endpoint)
  getAvailableSlots: (doctorId, hospitalId, date) => {
    return api.get(`/appointments/doctor/${doctorId}/hospital/${hospitalId}/available-slots?date=${date}`);
  },
  
  // Legacy endpoint for backward compatibility
  getAvailableTimeSlots: (doctorId, date) => api.get(`/appointments/available-slots/${doctorId}?date=${date}`)
};

// Doctors API endpoints
export const doctorsAPI = {
  getDoctors: (params) => api.get('/doctors', { params }),
  getDoctor: (id) => api.get(`/doctors/${id}`, { 
    headers: { 
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  }),
  getPatients: (params) => api.get('/doctors/patients', { params }),
  getPatientDetails: (patientId) => api.get(`/doctors/patients/${patientId}`),
  getPatientPrescriptions: (patientId) => api.get(`/doctors/patients/${patientId}/prescriptions`),
  getDoctorStats: () => api.get('/doctors/dashboard/stats'),
  updateProfile: (data) => {
    // Handle FormData for file uploads with timeout configuration
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout for profile updates
      maxContentLength: 50 * 1024 * 1024, // 50MB max content length
      maxBodyLength: 50 * 1024 * 1024 // 50MB max body length
    }
    return api.put('/doctors/profile', data, config)
  },
  getPatientHistory: (patientId) => api.get(`/doctors/patients/${patientId}/history`),
  getSchedule: () => api.get('/doctors/schedule'),
  
  // Doctor onboarding workflow
  checkProfileSetupRequired: () => api.get('/doctors/profile-setup/required'),
  completeProfileSetup: (data) => {
    // Handle FormData for file uploads
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    }
    return api.post('/doctors/profile-setup', data, config)
  }
};

// Patients API endpoints
export const patientsAPI = {
  getPatient: (id) => api.get(`/patients/${id}`),
  getPatientStats: () => api.get('/patients/stats'),
  updatePatientProfile: (data) => api.put('/patients/profile', data),
  getAppointments: (params) => api.get('/patients/appointments', { params }),
  getPrescriptions: (params) => api.get('/patients/prescriptions', { params }),
  getReports: (params) => api.get('/patients/reports', { params }),
  getMedicalHistory: () => api.get('/patients/medical-history'),
  searchDoctors: (params) => api.get('/patients/doctors/search', { params }),
  getSpecializations: () => api.get('/patients/specializations'),
}

// Prescriptions API endpoints
export const prescriptionsAPI = {
  getPrescriptions: (params) => api.get('/prescriptions', { params }),
  getPrescription: (id) => api.get(`/prescriptions/${id}`),
  createPrescription: (data) => api.post('/prescriptions', data),
  updatePrescription: (id, data) => api.put(`/prescriptions/${id}`, data),
  verifyPrescription: (code) => api.get(`/prescriptions/verify/${code}`),
  dispensePrescription: (id, data) => api.put(`/prescriptions/${id}/dispense`, data),
  addMedication: (id, data) => api.post(`/prescriptions/${id}/medications`, data),
  getPatientPrescriptions: (patientId, params) => api.get(`/prescriptions/patient/${patientId}`, { params }),
  getDoctorPrescriptions: (doctorId, params) => api.get(`/prescriptions/doctor/${doctorId}`, { params }),
}

// Reports API endpoints
export const reportsAPI = {
  getReports: (params) => api.get('/reports', { params }),
  getReport: (id) => api.get(`/reports/${id}`),
  uploadReport: (data) => {
    const formData = new FormData()

    // Accept various input shapes: file | reportFile | files[]
    if (data.file) {
      formData.append('reportFile', data.file)
    } else if (data.reportFile) {
      formData.append('reportFile', data.reportFile)
    } else if (data.files && data.files.length > 0) {
      // If multiple provided, send the first as primary (backend expects single)
      formData.append('reportFile', data.files[0])
    }

    // Append other data (avoid duplicating file fields)
    Object.keys(data).forEach((key) => {
      if (['file', 'files', 'reportFile'].includes(key)) return
      const value = data[key]
      if (value === undefined || value === null) return
      if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, value)
      }
    })

    return api.post('/reports/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  updateReport: (id, data) => api.put(`/reports/${id}`, data),
  deleteReport: (id) => api.delete(`/reports/${id}`),
  shareReport: (id, data) => api.post(`/reports/${id}/share`, data),
  addComment: (id, data) => api.post(`/reports/${id}/comments`, data),
  markAsCritical: (id, data) => api.put(`/reports/${id}/critical`, data),
}

// Admin API endpoints
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
  
  // Doctor approval endpoints
  getPendingDoctors: (params) => api.get('/admin/doctors/pending', { params }),
  approveDoctor: (id) => api.put(`/admin/doctors/${id}/approve`),
  rejectDoctor: (id, data) => api.put(`/admin/doctors/${id}/reject`, data),
  
  // Activity endpoints
  getRecentActivities: (params) => api.get('/admin/activities', { params }),
  
  // Reports endpoints
  generateReports: (params) => api.get('/admin/reports', { params }),
  getReport: (id) => api.get(`/admin/reports/${id}`),
  updateReport: (id, data) => api.put(`/admin/reports/${id}`, data),
  deleteReport: (id) => api.delete(`/admin/reports/${id}`),
  addComment: (id, data) => api.post(`/reports/${id}/comments`, data),
  markAsCritical: (id, data) => api.put(`/reports/${id}/critical`, data)
}

// Admins API endpoints  
export const adminsAPI = {
  getAdmin: (id) => api.get(`/admin/users/${id}`),
  updateAdminProfile: (data) => api.put('/admin/profile', data)
}

// Settings API
export const settingsAPI = {
  getUserSettings: () => api.get('/settings'),
  updateUserSettings: (settings) => api.put('/settings', { settings }),
  resetUserSettings: () => api.post('/settings/reset')
}

// Export the main api instance
export default api
