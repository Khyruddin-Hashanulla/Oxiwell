const express = require('express');
const { body } = require('express-validator');
const { upload } = require('../config/cloudinary');
const {
  getReports,
  getReport,
  uploadReport,
  updateReport,
  deleteReport,
  shareReport,
  addComment,
  markAsCritical
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const {
  requirePermission,
  requirePatientAccess,
  requireDoctorAccess,
  requireAdmin,
  requireDoctor,
  requirePatient,
  requireVerified,
  requireActive,
  auditLog
} = require('../middleware/rbac');

const router = express.Router();

// Apply authentication and active status to all routes
router.use(protect, requireActive);

// Validation rules
const uploadReportValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Report title must be between 3 and 200 characters'),
  body('reportType')
    .isIn(['blood-test', 'urine-test', 'x-ray', 'mri', 'ct-scan', 'ultrasound', 'ecg', 'echo', 'biopsy', 'pathology', 'radiology', 'lab-report', 'prescription', 'discharge-summary', 'other'])
    .withMessage('Invalid report type'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('testDate')
    .optional()
    .isISO8601()
    .withMessage('Valid test date is required'),
  body('labName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Lab name must not exceed 200 characters'),
  body('doctorNotes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Doctor notes must not exceed 2000 characters'),
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean value')
];

const updateReportValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Report title must be between 3 and 200 characters'),
  body('reportType')
    .optional()
    .isIn(['blood-test', 'urine-test', 'x-ray', 'mri', 'ct-scan', 'ultrasound', 'ecg', 'echo', 'biopsy', 'pathology', 'radiology', 'lab-report', 'prescription', 'discharge-summary', 'other'])
    .withMessage('Invalid report type'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'reviewed', 'archived'])
    .withMessage('Invalid report status'),
  body('doctorNotes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Doctor notes must not exceed 2000 characters'),
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean value')
];

// GET /api/reports - Get all reports (with role-based filtering)
// Patient: own reports only, Doctor: assigned patients only, Admin: all
router.get('/', 
  requireVerified,
  requireActive,
  auditLog('VIEW_REPORTS'),
  getReports
);

// GET /api/reports/patient/:patientId - Get reports for a specific patient
// Patient: own reports only, Doctor: assigned patients only, Admin: all
router.get('/patient/:patientId', 
  requirePatientAccess,
  auditLog('VIEW_PATIENT_REPORTS'),
  getReports
);

// GET /api/reports/doctor/:doctorId - Get reports reviewed by a specific doctor
// Doctor: own reviewed reports only, Admin: all
router.get('/doctor/:doctorId', 
  requireDoctorAccess,
  auditLog('VIEW_DOCTOR_REPORTS'),
  getReports
);

// POST /api/reports/upload - Upload new report
// Patient: upload for themselves, Doctor: upload for assigned patients, Admin: upload for any patient
router.post('/upload', 
  upload.single('reportFile'),
  uploadReportValidation,
  requireVerified,
  auditLog('UPLOAD_REPORT'),
  uploadReport
);

// GET /api/reports/:id - Get specific report
// Patient: own reports, Doctor: shared reports, Admin: all
router.get('/:id', 
  requireReportAccess,
  auditLog('VIEW_REPORT'),
  getReport
);

// PUT /api/reports/:id - Update report
// Patient: own reports (limited fields), Doctor: assigned patients' reports, Admin: all
router.put('/:id', 
  requireReportAccess,
  updateReportValidation,
  auditLog('UPDATE_REPORT'),
  updateReport
);

// DELETE /api/reports/:id - Delete report
// Patient: own reports, Doctor: assigned patients' reports, Admin: all
router.delete('/:id', 
  requireReportAccess,
  auditLog('DELETE_REPORT'),
  deleteReport
);

// Admin-only routes
router.use('/admin', requireAdmin);

// GET /api/reports/admin/all - Get all reports with full details (Admin only)
router.get('/admin/all', 
  auditLog('VIEW_ALL_REPORTS_ADMIN'),
  getReports
);

// Middleware to check report access
function requireReportAccess(req, res, next) {
  const reportId = req.params.id;
  
  // Admin can access all reports
  if (req.user.role === 'admin') {
    return next();
  }
  
  // For other roles, we need to check the report details
  // This will be handled in the controller with proper database queries
  next();
}

module.exports = router;
