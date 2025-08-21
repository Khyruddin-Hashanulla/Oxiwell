const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const { protect } = require('../middleware/auth')
const { requireAdmin } = require('../middleware/rbac')
const {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getSubscriptionStatus,
  updatePreferences,
  getAllSubscriptions
} = require('../controllers/newsletterController')

// Public routes
// POST /api/newsletter/subscribe
router.post('/subscribe', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('source')
    .optional()
    .isIn(['footer_subscription', 'website', 'registration', 'appointment_booking', 'admin'])
    .withMessage('Invalid subscription source')
], subscribeToNewsletter)

// POST /api/newsletter/unsubscribe
router.post('/unsubscribe', [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('token')
    .optional()
    .isUUID()
    .withMessage('Invalid unsubscribe token')
], unsubscribeFromNewsletter)

// GET /api/newsletter/status/:email
router.get('/status/:email', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
], getSubscriptionStatus)

// PUT /api/newsletter/preferences/:email
router.put('/preferences/:email', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('preferences')
    .isObject()
    .withMessage('Preferences must be an object'),
  body('preferences.healthTips')
    .optional()
    .isBoolean()
    .withMessage('Health tips preference must be boolean'),
  body('preferences.appointmentReminders')
    .optional()
    .isBoolean()
    .withMessage('Appointment reminders preference must be boolean'),
  body('preferences.serviceUpdates')
    .optional()
    .isBoolean()
    .withMessage('Service updates preference must be boolean'),
  body('preferences.promotions')
    .optional()
    .isBoolean()
    .withMessage('Promotions preference must be boolean')
], updatePreferences)

// Admin routes (require authentication and admin role)
// GET /api/newsletter/admin/subscriptions
router.get('/admin/subscriptions', 
  protect, 
  requireAdmin, 
  getAllSubscriptions
)

module.exports = router
