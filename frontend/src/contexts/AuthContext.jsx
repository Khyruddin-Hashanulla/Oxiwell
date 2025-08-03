import React, { createContext, useContext, useReducer, useEffect } from 'react'
import api, { authAPI } from '../services/api'
import Cookies from 'js-cookie'

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
}

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      }

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      }

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }

    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for existing token on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = Cookies.get('token')
        if (token) {
          // Set token in axios defaults
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          // Verify token and get user data
          const response = await authAPI.getProfile()
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: response.data.data.user,
              token,
            },
          })
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // Clear invalid token
        Cookies.remove('token')
        delete api.defaults.headers.common['Authorization']
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
      }
    }

    checkAuthStatus()
  }, [])

  // Login function
  const login = async (credentials) => {
    try {
      console.log('🚀 Starting login process with credentials:', credentials);
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })
      
      console.log('📡 Making API call to:', `${api.defaults.baseURL}/auth/login`);
      const response = await authAPI.login(credentials)
      console.log('📥 Full API response:', response);
      console.log('📊 Response status:', response.status);
      console.log('📄 Response data:', response.data);
      
      const { user, token } = response.data.data
      console.log('👤 Extracted user:', user);
      console.log('🔑 Extracted token:', token ? 'Token received' : 'No token');

      // Store token in cookie
      Cookies.set('token', token, { expires: 7 }) // 7 days
      
      // Set token in axios defaults
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      })

      console.log('✅ Login successful, returning success');
      return { success: true, user }
    } catch (error) {
      console.error('❌ Login error caught:', error);
      console.error('📊 Error response status:', error.response?.status);
      console.error('📄 Error response data:', error.response?.data);
      console.error('🔗 Error request config:', error.config);
      
      const errorMessage = error.response?.data?.message || 'Login failed'
      console.error('💬 Final error message:', errorMessage);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      })
      return { success: false, error: errorMessage }
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START })
      
      const response = await authAPI.register(userData)
      const { user, token } = response.data.data

      // Store token in cookie
      Cookies.set('token', token, { expires: 7 }) // 7 days
      
      // Set token in axios defaults
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: { user, token },
      })

      return { success: true, user }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed'
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: errorMessage,
      })
      return { success: false, error: errorMessage }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await authAPI.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear token from cookie and axios defaults
      Cookies.remove('token')
      delete api.defaults.headers.common['Authorization']
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    }
  }

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.put('/auth/profile', profileData)
      const updatedUser = response.data.data.user

      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: updatedUser,
      })

      return { success: true, user: updatedUser }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed'
      return { success: false, error: errorMessage }
    }
  }

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }

  // Context value
  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
