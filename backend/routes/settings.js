const express = require('express');
const { body } = require('express-validator');
const {
  getUserSettings,
  updateUserSettings,
  resetUserSettings
} = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules for settings update
const updateSettingsValidation = [
  body('settings')
    .isObject()
    .withMessage('Settings must be an object'),
  body('settings.notifications')
    .optional()
    .isObject()
    .withMessage('Notifications settings must be an object'),
  body('settings.privacy')
    .optional()
    .isObject()
    .withMessage('Privacy settings must be an object'),
  body('settings.communication')
    .optional()
    .isObject()
    .withMessage('Communication settings must be an object'),
  body('settings.professional')
    .optional()
    .isObject()
    .withMessage('Professional settings must be an object'),
  body('settings.schedule')
    .optional()
    .isObject()
    .withMessage('Schedule settings must be an object'),
  body('settings.health')
    .optional()
    .isObject()
    .withMessage('Health settings must be an object'),
  body('settings.system')
    .optional()
    .isObject()
    .withMessage('System settings must be an object')
];

// Apply protection to all routes
router.use(protect);

// GET /api/settings - Get user settings
router.get('/', getUserSettings);

// PUT /api/settings - Update user settings
router.put('/', updateSettingsValidation, updateUserSettings);

// POST /api/settings/reset - Reset settings to defaults
router.post('/reset', resetUserSettings);

module.exports = router;
