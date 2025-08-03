const express = require('express');
const { body } = require('express-validator');
const {
  getPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription,
  verifyPrescription,
  getPrescriptionsByPatient,
  getPrescriptionsByDoctor,
  dispensePrescription,
  addMedication
} = require('../controllers/prescriptionController');
const { protect, authorize, authorizePatientAccess, authorizeDoctorAccess } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createPrescriptionValidation = [
  body('patient')
    .isMongoId()
    .withMessage('Valid patient ID is required'),
  body('appointment')
    .isMongoId()
    .withMessage('Valid appointment ID is required'),
  body('diagnosis')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Diagnosis must be between 10 and 500 characters'),
  body('medications')
    .isArray({ min: 1 })
    .withMessage('At least one medication is required'),
  body('medications.*.name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Medication name is required'),
  body('medications.*.dosage')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Medication dosage is required'),
  body('medications.*.frequency')
    .isIn(['once-daily', 'twice-daily', 'thrice-daily', 'four-times-daily', 'as-needed', 'custom'])
    .withMessage('Invalid medication frequency'),
  body('medications.*.duration')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Medication duration is required'),
  body('medications.*.instructions')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Medication instructions cannot exceed 200 characters'),
  body('generalInstructions')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('General instructions cannot exceed 1000 characters'),
  body('dietaryRestrictions')
    .optional()
    .isArray()
    .withMessage('Dietary restrictions must be an array'),
  body('precautions')
    .optional()
    .isArray()
    .withMessage('Precautions must be an array'),
  body('followUpDate')
    .optional()
    .isISO8601()
    .withMessage('Valid follow-up date is required'),
  body('recommendedTests')
    .optional()
    .isArray()
    .withMessage('Recommended tests must be an array'),
  body('recommendedTests.*.testName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Test name is required'),
  body('recommendedTests.*.urgency')
    .optional()
    .isIn(['urgent', 'routine', 'optional'])
    .withMessage('Invalid test urgency'),
  body('validUntil')
    .optional()
    .isISO8601()
    .withMessage('Valid expiry date is required')
];

const updatePrescriptionValidation = [
  body('diagnosis')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Diagnosis must be between 10 and 500 characters'),
  body('medications')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one medication is required'),
  body('medications.*.name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Medication name is required'),
  body('medications.*.dosage')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Medication dosage is required'),
  body('medications.*.frequency')
    .optional()
    .isIn(['once-daily', 'twice-daily', 'thrice-daily', 'four-times-daily', 'as-needed', 'custom'])
    .withMessage('Invalid medication frequency'),
  body('medications.*.duration')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Medication duration is required'),
  body('generalInstructions')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('General instructions cannot exceed 1000 characters'),
  body('pharmacyNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Pharmacy notes cannot exceed 500 characters')
];

const addMedicationValidation = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Medication name is required'),
  body('dosage')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Medication dosage is required'),
  body('frequency')
    .isIn(['once-daily', 'twice-daily', 'thrice-daily', 'four-times-daily', 'as-needed', 'custom'])
    .withMessage('Invalid medication frequency'),
  body('duration')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Medication duration is required'),
  body('instructions')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Medication instructions cannot exceed 200 characters')
];

const dispensePrescriptionValidation = [
  body('pharmacyName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Pharmacy name is required'),
  body('pharmacistName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Pharmacist name is required'),
  body('licenseNumber')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Valid license number is required')
];

// Public routes
router.get('/verify/:verificationCode', verifyPrescription);

// Protected routes
router.use(protect);

// Admin routes
router.get('/', authorize('admin'), getPrescriptions);

// General prescription routes
router.post('/', authorize('doctor'), createPrescriptionValidation, createPrescription);
router.get('/:id', getPrescription);
router.put('/:id', authorize('doctor'), updatePrescriptionValidation, updatePrescription);
router.put('/:id/dispense', authorize('admin'), dispensePrescriptionValidation, dispensePrescription);
router.post('/:id/medications', authorize('doctor'), addMedicationValidation, addMedication);

// Patient-specific routes
router.get('/patient/:patientId', authorizePatientAccess, getPrescriptionsByPatient);

// Doctor-specific routes
router.get('/doctor/:doctorId', authorizeDoctorAccess, getPrescriptionsByDoctor);

module.exports = router;
