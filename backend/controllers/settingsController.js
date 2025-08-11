const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
const getUserSettings = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('settings');
  
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  // Return settings with defaults if not set
  const defaultSettings = {
    notifications: {
      email: true,
      sms: true,
      appointments: true,
      reminders: true,
      healthTips: false,
      promotional: false,
      systemAlerts: true
    },
    privacy: {
      profileVisibility: 'doctors-only',
      shareHealthData: false,
      allowDataAnalytics: true,
      showInDirectory: false,
      showContactInfo: true
    },
    communication: {
      preferredMethod: 'email',
      allowTelehealth: true,
      shareAppointmentHistory: true,
      emergencyContactAccess: true
    },
    professional: {
      autoConfirmAppointments: false,
      allowOnlineConsultations: true,
      consultationDuration: 30,
      maxDailyAppointments: 20,
      allowPatientReviews: true,
      shareAvailability: true
    },
    schedule: {
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      defaultStartTime: '09:00',
      defaultEndTime: '17:00',
      breakDuration: 60
    },
    health: {
      reminderFrequency: 'daily',
      goalTracking: true,
      shareProgressWithDoctor: true,
      anonymousDataSharing: false
    },
    system: {
      maintenanceMode: false,
      allowRegistrations: true,
      requireEmailVerification: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      autoBackupEnabled: true,
      backupFrequency: 'daily'
    }
  };

  // Merge user settings with defaults
  const settings = {
    ...defaultSettings,
    ...user.settings
  };

  res.status(200).json({
    status: 'success',
    data: {
      settings
    }
  });
});

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
const updateUserSettings = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { settings } = req.body;

  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({
      status: 'error',
      message: 'Settings object is required'
    });
  }

  // Update user settings
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { 
      $set: { 
        settings: {
          ...settings,
          updatedAt: new Date()
        }
      }
    },
    { new: true, runValidators: true }
  ).select('settings');

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Settings updated successfully',
    data: {
      settings: user.settings
    }
  });
});

// @desc    Reset user settings to defaults
// @route   POST /api/settings/reset
// @access  Private
const resetUserSettings = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { settings: 1 } },
    { new: true }
  ).select('settings');

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Settings reset to defaults successfully',
    data: {
      settings: user.settings || {}
    }
  });
});

module.exports = {
  getUserSettings,
  updateUserSettings,
  resetUserSettings
};
