const express = require('express');
const { body } = require('express-validator');
const {
  getDashboardStats,
  getUsers,
  getUser,
  updateUserStatus,
  deleteUser,
  getActivityLogs,
  generateSystemReports
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Validation rules
const updateUserStatusValidation = [
  body('status')
    .isIn(['active', 'inactive', 'suspended', 'pending'])
    .withMessage('Invalid status. Must be: active, inactive, suspended, or pending')
];

// Dashboard and analytics
router.get('/dashboard', getDashboardStats);
router.get('/activity', getActivityLogs);
router.get('/reports', generateSystemReports);

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id/status', updateUserStatusValidation, updateUserStatus);
router.delete('/users/:id', deleteUser);

module.exports = router;
