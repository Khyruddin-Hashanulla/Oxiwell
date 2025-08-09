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
const {
  requirePermission,
  requirePatientAccess,
  requireDoctorAccess,
  requireAppointmentAccess,
  requireAdmin,
  requireDoctor,
  requirePatient,
  requireVerified,
  requireActive,
  auditLog
} = require('../middleware/rbac');

const router = express.Router();

// Validation rules
const createPrescriptionValidation = [
  body('patient')
    .isMongoId()
    .withMessage('Valid patient ID is required'),
  body('appointment')
    .optional()
    .isMongoId()
    .withMessage('Valid appointment ID is required'),
  body('medications')
    .isArray({ min: 1 })
    .withMessage('At least one medication is required'),
  body('medications.*.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Medication name must be between 2 and 100 characters'),
  body('medications.*.dosage')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Dosage is required and must not exceed 50 characters'),
  body('medications.*.frequency')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Frequency is required and must not exceed 100 characters'),
  body('medications.*.duration')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Duration is required and must not exceed 50 characters'),
  body('medications.*.instructions')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Instructions must not exceed 500 characters'),
  body('diagnosis')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Diagnosis must not exceed 1000 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes must not exceed 2000 characters'),
  body('followUpDate')
    .optional()
    .isISO8601()
    .withMessage('Valid follow-up date is required'),
  body('validUntil')
    .optional()
    .isISO8601()
    .withMessage('Valid expiration date is required')
];

const updatePrescriptionValidation = [
  body('medications')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one medication is required'),
  body('medications.*.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Medication name must be between 2 and 100 characters'),
  body('medications.*.dosage')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Dosage must not exceed 50 characters'),
  body('medications.*.frequency')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Frequency must not exceed 100 characters'),
  body('medications.*.duration')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Duration must not exceed 50 characters'),
  body('medications.*.instructions')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Instructions must not exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['active', 'completed', 'cancelled', 'expired'])
    .withMessage('Invalid prescription status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes must not exceed 2000 characters'),
  body('followUpDate')
    .optional()
    .isISO8601()
    .withMessage('Valid follow-up date is required'),
  body('validUntil')
    .optional()
    .isISO8601()
    .withMessage('Valid expiration date is required')
];

// Apply authentication and active status to all routes
router.use(protect, requireActive);

// DEBUG: Simple test route to verify prescription routes are working
router.get('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Prescription routes are working!',
    user: req.user ? { id: req.user._id, role: req.user.role } : null
  });
});

// GET /api/prescriptions - Get prescriptions (role-based filtering)
// Admin: all prescriptions, Doctor: created prescriptions, Patient: own prescriptions
router.get('/', getPrescriptions);

// GET /api/prescriptions/patient/:patientId - Get prescriptions for a specific patient
// Patient: own prescriptions only, Doctor: assigned patients only, Admin: all
router.get('/patient/:patientId', 
  requirePatientAccess,
  auditLog('VIEW_PATIENT_PRESCRIPTIONS'),
  getPrescriptionsByPatient
);

// GET /api/prescriptions/doctor/:doctorId - Get prescriptions created by a specific doctor
// Doctor: own prescriptions only, Admin: all
router.get('/doctor/:doctorId', 
  requireDoctorAccess,
  auditLog('VIEW_DOCTOR_PRESCRIPTIONS'),
  getPrescriptionsByDoctor
);

// POST /api/prescriptions - Create new prescription (Doctor only)
// TEMPORARY: Simplified for debugging
router.post('/', 
  requireDoctor,
  requireVerified,
  // createPrescriptionValidation,  // Temporarily disabled for debugging
  auditLog('CREATE_PRESCRIPTION'),
  (req, res, next) => {
    console.log('🔍 POST /prescriptions route reached!');
    console.log('🔍 Request body:', req.body);
    console.log('🔍 User:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');
    next();
  },
  createPrescription
);

// GET /api/prescriptions/:id - Get specific prescription
// Patient: own prescriptions, Doctor: created prescriptions, Admin: all
router.get('/:id', 
  requirePrescriptionAccess,
  getPrescription
);

// PUT /api/prescriptions/:id - Update prescription (Doctor who created it or Admin)
router.put('/:id', 
  requirePrescriptionAccess,
  updatePrescriptionValidation,
  auditLog('UPDATE_PRESCRIPTION'),
  updatePrescription
);

// PUT /api/prescriptions/:id/dispense - Dispense prescription (Admin only)
router.put('/:id/dispense', 
  requireAdmin,
  auditLog('DISPENSE_PRESCRIPTION'),
  dispensePrescription
);

// POST /api/prescriptions/:id/medications - Add medication to prescription (Doctor only)
router.post('/:id/medications', 
  requireDoctor,
  auditLog('ADD_MEDICATION'),
  addMedication
);

// Middleware to check prescription access
function requirePrescriptionAccess(req, res, next) {
  const prescriptionId = req.params.id;
  
  // Admin can access all prescriptions
  if (req.user.role === 'admin') {
    return next();
  }
  
  // For other roles, we need to check the prescription details
  // This will be handled in the controller with proper database queries
  next();
}

// Public routes
router.get('/verify/:verificationCode', verifyPrescription);

module.exports = router;
