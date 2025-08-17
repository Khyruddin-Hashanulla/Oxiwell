import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Settings, 
  Bell, 
  Clock, 
  Calendar, 
  Shield, 
  ArrowLeft,
  Save,
  User,
  Stethoscope
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { settingsAPI } from '../../services/api'

const DoctorSettings = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    // Professional Settings
    autoConfirmAppointments: false,
    allowOnlineConsultations: true,
    consultationDuration: 30,
    maxDailyAppointments: 20,
    
    // Notification Preferences
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    patientUpdates: true,
    systemAlerts: true,
    
    // Schedule Settings
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    defaultStartTime: '09:00',
    defaultEndTime: '17:00',
    breakDuration: 60,
    
    // Privacy Settings
    profileVisibility: 'public',
    showContactInfo: true,
    allowPatientReviews: true,
    shareAvailability: true
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const response = await settingsAPI.getUserSettings()
      if (response.data?.data?.settings) {
        const userSettings = response.data.data.settings
        // Map backend settings to frontend state
        setSettings({
          autoConfirmAppointments: userSettings.professional?.autoConfirmAppointments || false,
          allowOnlineConsultations: userSettings.professional?.allowOnlineConsultations || true,
          consultationDuration: userSettings.professional?.consultationDuration || 30,
          maxDailyAppointments: userSettings.professional?.maxDailyAppointments || 20,
          emailNotifications: userSettings.notifications?.email || true,
          smsNotifications: userSettings.notifications?.sms || true,
          appointmentReminders: userSettings.notifications?.appointments || true,
          patientUpdates: userSettings.notifications?.reminders || true,
          systemAlerts: userSettings.notifications?.systemAlerts || true,
          workingDays: userSettings.schedule?.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          defaultStartTime: userSettings.schedule?.defaultStartTime || '09:00',
          defaultEndTime: userSettings.schedule?.defaultEndTime || '17:00',
          breakDuration: userSettings.schedule?.breakDuration || 60,
          profileVisibility: userSettings.privacy?.profileVisibility || 'public',
          showContactInfo: userSettings.privacy?.showContactInfo || true,
          allowPatientReviews: userSettings.professional?.allowPatientReviews || true,
          shareAvailability: userSettings.professional?.shareAvailability || true
        })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleWorkingDayToggle = (day) => {
    setSettings(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      // Map frontend settings to backend format
      const backendSettings = {
        notifications: {
          email: settings.emailNotifications,
          sms: settings.smsNotifications,
          appointments: settings.appointmentReminders,
          reminders: settings.patientUpdates,
          systemAlerts: settings.systemAlerts
        },
        privacy: {
          profileVisibility: settings.profileVisibility,
          showContactInfo: settings.showContactInfo
        },
        professional: {
          autoConfirmAppointments: settings.autoConfirmAppointments,
          allowOnlineConsultations: settings.allowOnlineConsultations,
          consultationDuration: settings.consultationDuration,
          maxDailyAppointments: settings.maxDailyAppointments,
          allowPatientReviews: settings.allowPatientReviews,
          shareAvailability: settings.shareAvailability
        },
        schedule: {
          workingDays: settings.workingDays,
          defaultStartTime: settings.defaultStartTime,
          defaultEndTime: settings.defaultEndTime,
          breakDuration: settings.breakDuration
        }
      }
      
      await settingsAPI.updateUserSettings(backendSettings)
      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => navigate('/doctor/dashboard')}
            className="p-2 bg-primary-700 hover:bg-primary-600 rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex items-center">
              <Settings className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mr-2 sm:mr-3 text-accent-400 flex-shrink-0" />
              <span className="truncate">Doctor Settings</span>
            </h1>
            <p className="text-gray-400 mt-1 text-sm sm:text-base">
              Configure your professional preferences and settings
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto px-4 py-2 sm:px-4 sm:py-2 bg-accent-600 hover:bg-accent-700 rounded-lg text-white transition-colors flex items-center justify-center disabled:opacity-50 text-sm sm:text-base flex-shrink-0"
        >
          <Save className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Professional Settings */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Stethoscope className="w-5 h-5 mr-2 text-accent-400" />
          Professional Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Auto-confirm Appointments</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoConfirmAppointments}
                onChange={(e) => handleSettingChange('autoConfirmAppointments', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Allow Online Consultations</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowOnlineConsultations}
                onChange={(e) => handleSettingChange('allowOnlineConsultations', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Consultation Duration (minutes)</label>
            <select
              value={settings.consultationDuration}
              onChange={(e) => handleSettingChange('consultationDuration', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Max Daily Appointments</label>
            <input
              type="number"
              min="5"
              max="50"
              value={settings.maxDailyAppointments}
              onChange={(e) => handleSettingChange('maxDailyAppointments', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-accent-400" />
          Notification Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Email Notifications</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">SMS Notifications</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Appointment Reminders</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.appointmentReminders}
                onChange={(e) => handleSettingChange('appointmentReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Patient Updates</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.patientUpdates}
                onChange={(e) => handleSettingChange('patientUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Schedule Preferences */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-accent-400" />
          Schedule Preferences
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Working Days</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {daysOfWeek.map(day => (
                <label key={day.key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.workingDays.includes(day.key)}
                    onChange={() => handleWorkingDayToggle(day.key)}
                    className="w-4 h-4 text-accent-600 bg-primary-700 border-primary-600 rounded focus:ring-accent-500 focus:ring-2"
                  />
                  <span className="text-gray-300 text-sm">{day.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Default Start Time</label>
              <input
                type="time"
                value={settings.defaultStartTime}
                onChange={(e) => handleSettingChange('defaultStartTime', e.target.value)}
                className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Default End Time</label>
              <input
                type="time"
                value={settings.defaultEndTime}
                onChange={(e) => handleSettingChange('defaultEndTime', e.target.value)}
                className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-accent-400" />
          Privacy & Visibility
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Profile Visibility</label>
            <select
              value={settings.profileVisibility}
              onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="public">Public</option>
              <option value="patients-only">Patients Only</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Show Contact Information</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showContactInfo}
                onChange={(e) => handleSettingChange('showContactInfo', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Allow Patient Reviews</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowPatientReviews}
                onChange={(e) => handleSettingChange('allowPatientReviews', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Share Availability Publicly</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.shareAvailability}
                onChange={(e) => handleSettingChange('shareAvailability', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorSettings
