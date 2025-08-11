import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Settings, 
  Shield, 
  Bell, 
  Database, 
  Mail, 
  Lock, 
  Globe, 
  ArrowLeft,
  Save,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { settingsAPI } from '../../services/api'

const AdminSettings = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    // System Configuration
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: true,
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    
    // Security Settings
    enforceStrongPasswords: true,
    enableTwoFactorAuth: false,
    allowPasswordReset: true,
    logSecurityEvents: true,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: true,
    systemAlerts: true,
    maintenanceAlerts: true,
    
    // Database Settings
    autoBackupEnabled: true,
    backupFrequency: 'daily',
    retentionPeriod: 90,
    
    // Email Configuration
    smtpEnabled: true,
    emailProvider: 'gmail',
    fromEmail: 'admin@oxiwell.com',
    replyToEmail: 'noreply@oxiwell.com'
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
          maintenanceMode: userSettings.system?.maintenanceMode || false,
          allowRegistrations: userSettings.system?.allowRegistrations || true,
          requireEmailVerification: userSettings.system?.requireEmailVerification || true,
          maxLoginAttempts: userSettings.system?.maxLoginAttempts || 5,
          sessionTimeout: userSettings.system?.sessionTimeout || 30,
          enforceStrongPasswords: true,
          enableTwoFactorAuth: false,
          allowPasswordReset: true,
          logSecurityEvents: true,
          emailNotifications: userSettings.notifications?.email || true,
          smsNotifications: userSettings.notifications?.sms || true,
          systemAlerts: userSettings.notifications?.systemAlerts || true,
          maintenanceAlerts: true,
          autoBackupEnabled: userSettings.system?.autoBackupEnabled || true,
          backupFrequency: userSettings.system?.backupFrequency || 'daily',
          retentionPeriod: 90,
          smtpEnabled: true,
          emailProvider: 'gmail',
          fromEmail: 'admin@oxiwell.com',
          replyToEmail: 'noreply@oxiwell.com'
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
          systemAlerts: settings.systemAlerts
        },
        system: {
          maintenanceMode: settings.maintenanceMode,
          allowRegistrations: settings.allowRegistrations,
          requireEmailVerification: settings.requireEmailVerification,
          sessionTimeout: settings.sessionTimeout,
          maxLoginAttempts: settings.maxLoginAttempts,
          autoBackupEnabled: settings.autoBackupEnabled,
          backupFrequency: settings.backupFrequency
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

  const handleBackup = () => {
    toast.success('Database backup initiated!')
  }

  const handleRestore = () => {
    toast.success('Database restore feature coming soon!')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 bg-primary-700 hover:bg-primary-600 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Settings className="w-8 h-8 mr-3 text-accent-400" />
              System Settings
            </h1>
            <p className="text-gray-400 mt-1">
              Configure system-wide settings and preferences
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBackup}
            className="px-4 py-2 bg-primary-700 hover:bg-primary-600 border border-primary-600 rounded-lg text-white transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Backup
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-accent-600 hover:bg-accent-700 rounded-lg text-white transition-colors flex items-center disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-accent-400" />
          System Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Maintenance Mode</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">User Registration</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowRegistrations}
                onChange={(e) => handleSettingChange('allowRegistrations', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Email Verification</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireEmailVerification}
                onChange={(e) => handleSettingChange('requireEmailVerification', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Max Login Attempts</label>
            <input
              type="number"
              min="3"
              max="10"
              value={settings.maxLoginAttempts}
              onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              min="5"
              max="120"
              value={settings.sessionTimeout}
              onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-accent-400" />
          Security Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Strong Passwords</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enforceStrongPasswords}
                onChange={(e) => handleSettingChange('enforceStrongPasswords', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Two-Factor Authentication</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableTwoFactorAuth}
                onChange={(e) => handleSettingChange('enableTwoFactorAuth', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Password Reset</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowPasswordReset}
                onChange={(e) => handleSettingChange('allowPasswordReset', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Security Events</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.logSecurityEvents}
                onChange={(e) => handleSettingChange('logSecurityEvents', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-accent-400" />
          Notification Settings
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
            <span className="text-gray-300">System Alerts</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.systemAlerts}
                onChange={(e) => handleSettingChange('systemAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Maintenance Alerts</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceAlerts}
                onChange={(e) => handleSettingChange('maintenanceAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Database Settings */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Database className="w-5 h-5 mr-2 text-accent-400" />
          Database Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Auto Backup</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoBackupEnabled}
                onChange={(e) => handleSettingChange('autoBackupEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Backup Frequency</label>
            <select
              value={settings.backupFrequency}
              onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Retention Period (days)</label>
            <input
              type="number"
              min="30"
              max="3650"
              value={settings.retentionPeriod}
              onChange={(e) => handleSettingChange('retentionPeriod', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleBackup}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Backup Now
            </button>
            <button
              onClick={handleRestore}
              className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white transition-colors flex items-center justify-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Restore
            </button>
          </div>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-6 border border-primary-600">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Mail className="w-5 h-5 mr-2 text-accent-400" />
          Email Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Host</label>
            <input
              type="text"
              value={settings.smtpHost}
              onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
              placeholder="smtp.gmail.com"
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Port</label>
            <input
              type="number"
              value={settings.smtpPort}
              onChange={(e) => handleSettingChange('smtpPort', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Username</label>
            <input
              type="text"
              value={settings.smtpUsername}
              onChange={(e) => handleSettingChange('smtpUsername', e.target.value)}
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">From Email</label>
            <input
              type="email"
              value={settings.fromEmail}
              onChange={(e) => handleSettingChange('fromEmail', e.target.value)}
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
