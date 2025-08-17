import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Settings, 
  Bell, 
  Shield, 
  ArrowLeft,
  Save,
  User,
  Heart,
  Lock,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { settingsAPI } from '../../services/api'

const PatientSettings = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    // Notification Preferences
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    medicationReminders: true,
    healthTips: false,
    promotionalEmails: false,
    
    // Privacy Settings
    profileVisibility: 'doctors-only',
    shareHealthData: false,
    allowDataAnalytics: true,
    showInDirectory: false,
    
    // Communication Preferences
    preferredContactMethod: 'email',
    allowTelehealth: true,
    shareAppointmentHistory: true,
    emergencyContactAccess: true,
    
    // Health Preferences
    reminderFrequency: 'daily',
    healthGoalTracking: true,
    shareProgressWithDoctor: true,
    anonymousDataSharing: false
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
          emailNotifications: userSettings.notifications?.email || true,
          smsNotifications: userSettings.notifications?.sms || true,
          appointmentReminders: userSettings.notifications?.appointments || true,
          medicationReminders: userSettings.notifications?.reminders || true,
          healthTips: userSettings.notifications?.healthTips || false,
          promotionalEmails: userSettings.notifications?.promotional || false,
          profileVisibility: userSettings.privacy?.profileVisibility || 'doctors-only',
          shareHealthData: userSettings.privacy?.shareHealthData || false,
          allowDataAnalytics: userSettings.privacy?.allowDataAnalytics || true,
          showInDirectory: userSettings.privacy?.showInDirectory || false,
          preferredContactMethod: userSettings.communication?.preferredMethod || 'email',
          allowTelehealth: userSettings.communication?.allowTelehealth || true,
          shareAppointmentHistory: userSettings.communication?.shareAppointmentHistory || true,
          emergencyContactAccess: userSettings.communication?.emergencyContactAccess || true,
          reminderFrequency: userSettings.health?.reminderFrequency || 'daily',
          healthGoalTracking: userSettings.health?.goalTracking || true,
          shareProgressWithDoctor: userSettings.health?.shareProgressWithDoctor || true,
          anonymousDataSharing: userSettings.health?.anonymousDataSharing || false
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

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      // Map frontend settings to backend format
      const backendSettings = {
        notifications: {
          email: settings.emailNotifications,
          sms: settings.smsNotifications,
          appointments: settings.appointmentReminders,
          reminders: settings.medicationReminders,
          healthTips: settings.healthTips,
          promotional: settings.promotionalEmails
        },
        privacy: {
          profileVisibility: settings.profileVisibility,
          shareHealthData: settings.shareHealthData,
          allowDataAnalytics: settings.allowDataAnalytics,
          showInDirectory: settings.showInDirectory
        },
        communication: {
          preferredMethod: settings.preferredContactMethod,
          allowTelehealth: settings.allowTelehealth,
          shareAppointmentHistory: settings.shareAppointmentHistory,
          emergencyContactAccess: settings.emergencyContactAccess
        },
        health: {
          reminderFrequency: settings.reminderFrequency,
          goalTracking: settings.healthGoalTracking,
          shareProgressWithDoctor: settings.shareProgressWithDoctor,
          anonymousDataSharing: settings.anonymousDataSharing
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => navigate('/patient/dashboard')}
            className="p-2 bg-primary-700 hover:bg-primary-600 rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex items-center">
              <Settings className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mr-2 sm:mr-3 text-accent-400 flex-shrink-0" />
              <span className="truncate">Patient Settings</span>
            </h1>
            <p className="text-gray-400 mt-1 text-sm sm:text-base">
              Manage your personal preferences and privacy settings
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

      {/* Notification Preferences */}
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
            <span className="text-gray-300">Medication Reminders</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.medicationReminders}
                onChange={(e) => handleSettingChange('medicationReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Health Tips</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.healthTips}
                onChange={(e) => handleSettingChange('healthTips', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Promotional Emails</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.promotionalEmails}
                onChange={(e) => handleSettingChange('promotionalEmails', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy & Data Settings */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-accent-400" />
          Privacy & Data Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Profile Visibility</label>
            <select
              value={settings.profileVisibility}
              onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="doctors-only">Doctors Only</option>
              <option value="healthcare-staff">Healthcare Staff</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Contact Method</label>
            <select
              value={settings.preferredContactMethod}
              onChange={(e) => handleSettingChange('preferredContactMethod', e.target.value)}
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="phone">Phone Call</option>
              <option value="app">In-App Only</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Share Health Data for Research</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.shareHealthData}
                onChange={(e) => handleSettingChange('shareHealthData', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Allow Data Analytics</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowDataAnalytics}
                onChange={(e) => handleSettingChange('allowDataAnalytics', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Communication & Access */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <User className="w-5 h-5 mr-2 text-accent-400" />
          Communication & Access
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Allow Telehealth Consultations</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowTelehealth}
                onChange={(e) => handleSettingChange('allowTelehealth', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Share Appointment History</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.shareAppointmentHistory}
                onChange={(e) => handleSettingChange('shareAppointmentHistory', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Emergency Contact Access</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emergencyContactAccess}
                onChange={(e) => handleSettingChange('emergencyContactAccess', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Show in Public Directory</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showInDirectory}
                onChange={(e) => handleSettingChange('showInDirectory', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Health & Wellness */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Heart className="w-5 h-5 mr-2 text-accent-400" />
          Health & Wellness
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Reminder Frequency</label>
            <select
              value={settings.reminderFrequency}
              onChange={(e) => handleSettingChange('reminderFrequency', e.target.value)}
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="never">Never</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Health Goal Tracking</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.healthGoalTracking}
                onChange={(e) => handleSettingChange('healthGoalTracking', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Share Progress with Doctor</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.shareProgressWithDoctor}
                onChange={(e) => handleSettingChange('shareProgressWithDoctor', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Anonymous Data Sharing</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.anonymousDataSharing}
                onChange={(e) => handleSettingChange('anonymousDataSharing', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Account Security */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Lock className="w-5 h-5 mr-2 text-accent-400" />
          Account Security
        </h3>
        <div className="space-y-4">
          <button className="w-full md:w-auto px-6 py-3 bg-accent-600 hover:bg-accent-700 rounded-lg text-white transition-colors">
            Change Password
          </button>
          <button className="w-full md:w-auto px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg text-white transition-colors ml-0 md:ml-4">
            Enable Two-Factor Authentication
          </button>
        </div>
      </div>
    </div>
  )
}

export default PatientSettings
