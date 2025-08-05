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
  getAvailableSlots,
  getAvailableDoctors,
  getDoctorDetails,
  getAvailableDates,
  getAvailableTimeSlots
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
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
const createAppointmentValidation = [
  body('doctor')
    .isMongoId()
    .withMessage('Valid doctor ID is required'),
  body('hospital')
    .isMongoId()
    .withMessage('Valid hospital ID is required'),
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
    .isLength({ min: 3, max: 500 })
    .withMessage('Reason must be between 3 and 500 characters'),
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
  body('appointmentDate')
    .optional()
    .isISO8601()
    .withMessage('Valid appointment date is required'),
  body('appointmentTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid appointment time is required (HH:MM format)'),
  body('status')
    .optional()
    .isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'])
    .withMessage('Invalid appointment status'),
  body('doctorNotes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Doctor notes must not exceed 2000 characters'),
  body('diagnosis')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Diagnosis must not exceed 1000 characters'),
  body('treatment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Treatment must not exceed 1000 characters')
];

// Public routes - No authentication required
// GET /api/appointments/available-doctors - Get available doctors for appointment booking
// Must be BEFORE parameterized routes to avoid conflicts
router.get('/available-doctors', getAvailableDoctors);

// GET /api/appointments/doctor/:doctorId/details - Get doctor details with workplaces
router.get('/doctor/:doctorId/details', getDoctorDetails);

// GET /api/appointments/doctor/:doctorId/hospital/:hospitalId/available-dates - Get available dates
router.get('/doctor/:doctorId/hospital/:hospitalId/available-dates', getAvailableDates);

// GET /api/appointments/doctor/:doctorId/hospital/:hospitalId/available-slots - Get available time slots
router.get('/doctor/:doctorId/hospital/:hospitalId/available-slots', getAvailableTimeSlots);

// Apply authentication and active status to all other routes
router.use(protect, requireActive);

// GET /api/appointments - Get appointments (role-based filtering)
// Admin: all appointments, Doctor: assigned appointments, Patient: own appointments
router.get('/', getAppointments);

// GET /api/appointments/available-slots/:doctorId - Get available time slots for a doctor
// Public access for booking appointments
router.get('/available-slots/:doctorId', getAvailableSlots);

// GET /api/appointments/patient/:patientId - Get appointments for a specific patient
// Patient: own appointments only, Doctor: assigned patients only, Admin: all
router.get('/patient/:patientId', 
  requirePatientAccess,
  auditLog('VIEW_PATIENT_APPOINTMENTS'),
  getPatientAppointments
);

// GET /api/appointments/doctor/:doctorId - Get appointments for a specific doctor
// Doctor: own appointments only, Admin: all
router.get('/doctor/:doctorId', 
  requireDoctorAccess,
  auditLog('VIEW_DOCTOR_APPOINTMENTS'),
  getDoctorAppointments
);

// POST /api/appointments - Create new appointment
// Patient: create for themselves, Admin: create for any patient
router.post('/', 
  createAppointmentValidation,
  requirePatient,
  requireVerified,
  auditLog('CREATE_APPOINTMENT'),
  createAppointment
);

// GET /api/appointments/:id - Get specific appointment
// Patient: own appointments, Doctor: assigned appointments, Admin: all
router.get('/:id', 
  requireAppointmentAccess,
  getAppointment
);

// PUT /api/appointments/:id - Update appointment
// Patient: reschedule own appointments, Doctor: update assigned appointments, Admin: all
router.put('/:id', 
  updateAppointmentValidation,
  requireAppointmentAccess,
  auditLog('UPDATE_APPOINTMENT'),
  updateAppointment
);

// PUT /api/appointments/:id/status - Update appointment status only
// Doctor: update status of assigned appointments, Admin: all
router.put('/:id/status', 
  body('status')
    .isIn(['pending', 'confirmed', 'completed', 'cancelled', 'no-show'])
    .withMessage('Invalid appointment status'),
  requireAppointmentAccess,
  auditLog('UPDATE_APPOINTMENT_STATUS'),
  updateAppointment
);

// DELETE /api/appointments/:id - Cancel appointment
// Patient: cancel own appointments, Doctor: cancel assigned appointments, Admin: all
router.delete('/:id', 
  requireAppointmentAccess,
  auditLog('CANCEL_APPOINTMENT'),
  cancelAppointment
);

// Admin-only routes
router.use('/admin', requireAdmin);

// GET /api/appointments/admin/all - Get all appointments with full details (Admin only)
router.get('/admin/all', 
  auditLog('VIEW_ALL_APPOINTMENTS_ADMIN'),
  getAppointments
);

// PUT /api/appointments/admin/:id/force-update - Force update any appointment (Admin only)
router.put('/admin/:id/force-update', 
  updateAppointmentValidation,
  auditLog('FORCE_UPDATE_APPOINTMENT'),
  updateAppointment
);

module.exports = router;
