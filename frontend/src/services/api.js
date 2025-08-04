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
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    console.log('🔍 API Request Debug:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
    })
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const { response } = error

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
          delete api.defaults.headers.common['Authorization']
          // Temporarily comment out auto-redirect to debug
          // if (window.location.pathname !== '/login') {
          //   toast.error('Session expired. Please login again.')
          //   window.location.href = '/login'
          // }
          toast.error('Authentication failed - check console for details')
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
          timeout: error.config?.timeout
        }
      })
      
      if (error.code === 'ECONNREFUSED') {
        toast.error('Cannot connect to server. Please ensure the backend is running on port 8080.')
      } else if (error.code === 'TIMEOUT' || error.message.includes('timeout')) {
        toast.error('Request timed out. Server may be slow or unavailable.')
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        toast.error('Network error. Please check your internet connection and server status.')
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
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: () => api.post('/auth/resend-verification'),
}

// Appointments API endpoints
export const appointmentsAPI = {
  getAppointments: (params) => api.get('/appointments', { params }),
  getAppointment: (id) => api.get(`/appointments/${id}`),
  createAppointment: (data) => api.post('/appointments', data),
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  updateAppointmentStatus: (id, status) => api.put(`/appointments/${id}/status`, { status }),
  cancelAppointment: (id, data) => api.delete(`/appointments/${id}`, { data }),
  getAvailableSlots: (doctorId, date) => api.get(`/appointments/slots/${doctorId}`, { params: { date } }),
  getAvailableDoctors: () => api.get('/appointments/available-doctors'),
  getPatientAppointments: (patientId, params) => api.get(`/appointments/patient/${patientId}`, { params }),
  getDoctorAppointments: (doctorId, params) => api.get(`/appointments/doctor/${doctorId}`, { params }),
}

// Doctors API endpoints
export const doctorsAPI = {
  getDoctors: (params) => api.get('/doctors', { params }),
  getDoctor: (id) => api.get(`/doctors/${id}`),
  updateDoctorProfile: (data) => api.put('/doctors/profile', data),
  getDoctorStats: () => api.get('/doctors/dashboard/stats'),
  getPatients: (params) => api.get('/doctors/patients', { params }),
  getPatientHistory: (patientId) => api.get(`/doctors/patients/${patientId}/history`),
  getSchedule: (params) => api.get('/doctors/schedule', { params }),
  getDoctor: (id) => api.get(`/doctors/${id}`),
}

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
    
    // Append files
    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append('files', file)
      })
    }
    
    // Append other data
    Object.keys(data).forEach((key) => {
      if (key !== 'files') {
        if (typeof data[key] === 'object') {
          formData.append(key, JSON.stringify(data[key]))
        } else {
          formData.append(key, data[key])
        }
      }
    })
    
    return api.post('/reports', formData, {
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
  getAdmin: (id) => api.get(`/admin/profile/${id}`),
  updateAdminProfile: (data) => api.put('/admin/profile', data)
}

// Export the main api instance
export default api
