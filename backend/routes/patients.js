const express = require('express');
const { body } = require('express-validator');
const {
  getPatientStats,
  updatePatientProfile,
  getPatientAppointments,
  getPatientPrescriptions,
  getPatientReports,
  getPatientMedicalHistory,
  searchDoctors,
  getSpecializations
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('emergencyContact.name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Emergency contact name must be at least 2 characters'),
  body('emergencyContact.phone')
    .optional()
    .isMobilePhone()
    .withMessage('Emergency contact phone must be valid'),
  body('emergencyContact.relationship')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Emergency contact relationship must be at least 2 characters'),
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array'),
  body('allergies.*')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Each allergy must not exceed 100 characters'),
  body('medicalHistory')
    .optional()
    .isArray()
    .withMessage('Medical history must be an array'),
  body('medicalHistory.*.condition')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Medical condition is required'),
  body('medicalHistory.*.diagnosedDate')
    .optional()
    .isISO8601()
    .withMessage('Valid diagnosed date is required'),
  body('medicalHistory.*.status')
    .optional()
    .isIn(['active', 'resolved', 'chronic'])
    .withMessage('Invalid medical condition status')
];

// Apply protection to all routes
router.use(protect);

// Patient-only routes
router.get('/dashboard/stats', authorize('patient'), getPatientStats);
router.put('/profile', authorize('patient'), updateProfileValidation, updatePatientProfile);
router.get('/appointments', authorize('patient'), getPatientAppointments);
router.get('/prescriptions', authorize('patient'), getPatientPrescriptions);
router.get('/reports', authorize('patient'), getPatientReports);
router.get('/medical-history', authorize('patient'), getPatientMedicalHistory);
router.get('/search-doctors', authorize('patient'), searchDoctors);
router.get('/specializations', authorize('patient'), getSpecializations);

module.exports = router;
