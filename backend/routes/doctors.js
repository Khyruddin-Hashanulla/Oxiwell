const express = require('express');
const { body } = require('express-validator');
const { upload } = require('../config/cloudinary');
const {
  getDoctors,
  getDoctor,
  getDoctorStats,
  updateDoctorProfile,
  getDoctorPatients,
  getPatientDetails,
  getPatientPrescriptions,
  getPatientHistory,
  getDoctorSchedule,
  completeProfileSetup,
  checkProfileSetupRequired
} = require('../controllers/doctorController');
const { protect, authorize, validateSession } = require('../middleware/auth');
const { requireDoctor } = require('../middleware/rbac');

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

// Protected routes - Apply protection and session validation middleware
router.use(protect, validateSession);

// Doctor-only routes - MUST come before /:id route to avoid conflicts
router.get('/dashboard/stats', requireDoctor, getDoctorStats);
router.get('/profile-setup/required', requireDoctor, checkProfileSetupRequired);
router.post('/profile-setup', requireDoctor, upload.single('profileImage'), completeProfileSetup);
router.put('/profile', requireDoctor, upload.single('profileImage'), updateProfileValidation, updateDoctorProfile);
router.get('/patients', requireDoctor, getDoctorPatients);
router.get('/patients/:patientId', requireDoctor, getPatientDetails);
router.get('/patients/:patientId/prescriptions', requireDoctor, getPatientPrescriptions);
router.get('/patients/:patientId/history', requireDoctor, getPatientHistory);
router.get('/schedule', requireDoctor, getDoctorSchedule);

// Generic routes - MUST come after specific routes
router.get('/:id', getDoctor);

module.exports = router;
