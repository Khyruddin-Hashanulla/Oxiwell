const express = require('express');
const { body } = require('express-validator');
const {
  getDashboardStats,
  getUsers,
  getUser,
  updateUserStatus,
  updateAdminProfile,
  deleteUser,
  getActivityLogs,
  generateSystemReports,
  approveDoctor,
  rejectDoctor,
  suspendUser,
  reactivateUser,
  getPendingDoctors
} = require('../controllers/adminController');
const { protect, validateSession } = require('../middleware/auth');
const {
  requireAdmin,
  requireActive,
  requireVerified,
  auditLog
} = require('../middleware/rbac');

const router = express.Router();

// Validation rules
const updateUserValidation = [
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
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required'),
  body('role')
    .optional()
    .isIn(['patient', 'doctor', 'admin'])
    .withMessage('Invalid role'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended', 'pending'])
    .withMessage('Invalid status'),
  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean')
];

const doctorApprovalValidation = [
  body('licenseNumber')
    .optional()
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('License number must be between 5 and 50 characters'),
  body('specialization')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Specialization must be between 2 and 100 characters'),
  body('approvalNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Approval notes must not exceed 500 characters')
];

const suspensionValidation = [
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Suspension reason must be between 10 and 500 characters'),
  body('duration')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Suspension duration must be between 1 and 365 days')
];

const reportGenerationValidation = [
  body('reportType')
    .isIn(['users', 'appointments', 'prescriptions', 'reports', 'analytics', 'financial'])
    .withMessage('Invalid report type'),
  body('startDate')
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('endDate')
    .isISO8601()
    .withMessage('Valid end date is required'),
  body('format')
    .optional()
    .isIn(['pdf', 'csv', 'excel'])
    .withMessage('Invalid report format')
];

// Apply authentication, session validation, admin role, and active status to all routes
router.use(protect, validateSession, requireAdmin, requireActive, requireVerified);

// Admin Profile Management
// GET /api/admin/profile/:id - Get admin profile
router.get('/profile/:id', 
  auditLog('VIEW_ADMIN_PROFILE'),
  getUser
);

// PUT /api/admin/profile - Update admin profile
router.put('/profile', 
  updateUserValidation,
  auditLog('UPDATE_ADMIN_PROFILE'),
  updateAdminProfile
);

// Dashboard and Analytics
// GET /api/admin/dashboard - Get admin dashboard statistics
router.get('/dashboard', 
  auditLog('VIEW_ADMIN_DASHBOARD'),
  getDashboardStats
);

// GET /api/admin/analytics - Get system analytics
router.get('/analytics', 
  auditLog('VIEW_SYSTEM_ANALYTICS'),
  getDashboardStats
);

// User Management
// GET /api/admin/users - Get all users with filtering and pagination
router.get('/users', 
  auditLog('VIEW_ALL_USERS'),
  getUsers
);

// GET /api/admin/users/:id - Get specific user details
router.get('/users/:id', 
  auditLog('VIEW_USER_DETAILS'),
  getUser
);

// PUT /api/admin/users/:id - Update user information
router.put('/users/:id', 
  updateUserValidation,
  auditLog('UPDATE_USER'),
  updateUserStatus
);

// DELETE /api/admin/users/:id - Delete user account
router.delete('/users/:id', 
  auditLog('DELETE_USER'),
  deleteUser
);

// User Status Management
// PUT /api/admin/users/:id/status - Update user status (suspend/activate/etc)
router.put('/users/:id/status', 
  suspensionValidation,
  auditLog('UPDATE_USER_STATUS'),
  updateUserStatus
);

// Doctor Approval/Rejection
// GET /api/admin/doctors/pending - Get pending doctors for approval
router.get('/doctors/pending', 
  auditLog('VIEW_PENDING_DOCTORS'),
  getPendingDoctors
);

// PUT /api/admin/doctors/:id/approve - Approve doctor
router.put('/doctors/:id/approve', 
  doctorApprovalValidation,
  auditLog('APPROVE_DOCTOR'),
  approveDoctor
);

// PUT /api/admin/doctors/:id/reject - Reject doctor
router.put('/doctors/:id/reject', 
  doctorApprovalValidation,
  auditLog('REJECT_DOCTOR'),
  rejectDoctor
);

// User Suspension
// PUT /api/admin/users/:id/suspend - Suspend user
router.put('/users/:id/suspend', 
  suspensionValidation,
  auditLog('SUSPEND_USER'),
  suspendUser
);

// PUT /api/admin/users/:id/reactivate - Reactivate user
router.put('/users/:id/reactivate', 
  auditLog('REACTIVATE_USER'),
  reactivateUser
);

// System Management
// GET /api/admin/logs - Get system logs
router.get('/logs', 
  auditLog('VIEW_SYSTEM_LOGS'),
  getActivityLogs
);

// POST /api/admin/reports/generate - Generate system reports
router.post('/reports/generate', 
  reportGenerationValidation,
  auditLog('GENERATE_SYSTEM_REPORT'),
  generateSystemReports
);

module.exports = router;
