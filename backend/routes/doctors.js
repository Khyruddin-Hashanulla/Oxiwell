const express = require('express');
const { body } = require('express-validator');
const {
  getDoctors,
  getDoctor,
  getDoctorStats,
  updateDoctorProfile,
  getDoctorPatients,
  getPatientHistory,
  getDoctorSchedule
} = require('../controllers/doctorController');
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
  body('specialization')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Specialization must be between 2 and 100 characters'),
  body('experience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience must be between 0 and 50 years'),
  body('consultationFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Consultation fee must be a positive number'),
  body('qualifications')
    .optional()
    .isArray()
    .withMessage('Qualifications must be an array'),
  body('qualifications.*.degree')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Degree is required'),
  body('qualifications.*.institution')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Institution is required'),
  body('qualifications.*.year')
    .optional()
    .isInt({ min: 1950, max: new Date().getFullYear() })
    .withMessage('Please provide a valid year'),
  body('availableSlots')
    .optional()
    .isArray()
    .withMessage('Available slots must be an array'),
  body('availableSlots.*.day')
    .optional()
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid day'),
  body('availableSlots.*.startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('availableSlots.*.endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format')
];

// Public routes
router.get('/', getDoctors);
router.get('/:id', getDoctor);

// Protected routes
router.use(protect);

// Doctor-only routes
router.get('/dashboard/stats', authorize('doctor'), getDoctorStats);
router.put('/profile', authorize('doctor'), updateProfileValidation, updateDoctorProfile);
router.get('/patients', authorize('doctor'), getDoctorPatients);
router.get('/patients/:patientId/history', authorize('doctor'), getPatientHistory);
router.get('/schedule', authorize('doctor'), getDoctorSchedule);

module.exports = router;
