const express = require('express');
const { body } = require('express-validator');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAvailableSlots
} = require('../controllers/appointmentController');
const { protect, authorize, authorizePatientAccess, authorizeDoctorAccess } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createAppointmentValidation = [
  body('doctor')
    .isMongoId()
    .withMessage('Valid doctor ID is required'),
  body('appointmentDate')
    .isISO8601()
    .withMessage('Valid appointment date is required'),
  body('appointmentTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid appointment time is required (HH:MM format)'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 120 })
    .withMessage('Duration must be between 15 and 120 minutes'),
  body('appointmentType')
    .optional()
    .isIn(['consultation', 'follow-up', 'emergency', 'routine-checkup'])
    .withMessage('Invalid appointment type'),
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  body('symptoms')
    .optional()
    .isArray()
    .withMessage('Symptoms must be an array'),
  body('symptoms.*')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Each symptom must not exceed 100 characters'),
  body('patientNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Patient notes must not exceed 1000 characters')
];

const updateAppointmentValidation = [
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  body('symptoms')
    .optional()
    .isArray()
    .withMessage('Symptoms must be an array'),
  body('patientNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Patient notes must not exceed 1000 characters'),
  body('doctorNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Doctor notes must not exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no-show'])
    .withMessage('Invalid status'),
  body('followUpDate')
    .optional()
    .isISO8601()
    .withMessage('Valid follow-up date is required')
];

const cancelAppointmentValidation = [
  body('cancellationReason')
    .trim()
    .isLength({ min: 10, max: 300 })
    .withMessage('Cancellation reason must be between 10 and 300 characters')
];

// Apply protection to all routes
router.use(protect);

// Admin routes
router.get('/', authorize('admin'), getAppointments);

// General appointment routes
router.post('/', authorize('patient'), createAppointmentValidation, createAppointment);
router.get('/:id', getAppointment);
router.put('/:id', updateAppointmentValidation, updateAppointment);
router.put('/:id/cancel', cancelAppointmentValidation, cancelAppointment);

// Patient-specific routes
router.get('/patient/:patientId', authorizePatientAccess, getPatientAppointments);

// Doctor-specific routes
router.get('/doctor/:doctorId', authorizeDoctorAccess, getDoctorAppointments);
router.get('/available-slots/:doctorId', getAvailableSlots);

module.exports = router;
