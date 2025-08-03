const express = require('express');
const { body } = require('express-validator');
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
const { protect, authorize, authorizePatientAccess } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Validation rules
const uploadReportValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('reportType')
    .isIn(['blood-test', 'urine-test', 'x-ray', 'mri', 'ct-scan', 'ultrasound', 'ecg', 'echo', 'biopsy', 'pathology', 'other'])
    .withMessage('Invalid report type'),
  body('category')
    .optional()
    .isIn(['diagnostic', 'therapeutic', 'preventive', 'follow-up'])
    .withMessage('Invalid category'),
  body('testDate')
    .isISO8601()
    .withMessage('Valid test date is required'),
  body('labName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Lab name must be between 2 and 100 characters'),
  body('doctorName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Doctor name must be between 2 and 100 characters'),
  body('referringDoctor')
    .optional()
    .isMongoId()
    .withMessage('Valid referring doctor ID is required'),
  body('patient')
    .optional()
    .isMongoId()
    .withMessage('Valid patient ID is required')
];

const updateReportValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('reportType')
    .optional()
    .isIn(['blood-test', 'urine-test', 'x-ray', 'mri', 'ct-scan', 'ultrasound', 'ecg', 'echo', 'biopsy', 'pathology', 'other'])
    .withMessage('Invalid report type'),
  body('category')
    .optional()
    .isIn(['diagnostic', 'therapeutic', 'preventive', 'follow-up'])
    .withMessage('Invalid category'),
  body('testDate')
    .optional()
    .isISO8601()
    .withMessage('Valid test date is required'),
  body('labName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Lab name must be between 2 and 100 characters'),
  body('doctorName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Doctor name must be between 2 and 100 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'reviewed', 'archived'])
    .withMessage('Invalid status'),
  body('reviewNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Review notes cannot exceed 500 characters')
];

const shareReportValidation = [
  body('doctorId')
    .isMongoId()
    .withMessage('Valid doctor ID is required'),
  body('accessLevel')
    .optional()
    .isIn(['view', 'comment', 'edit'])
    .withMessage('Invalid access level')
];

const commentValidation = [
  body('content')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Comment must be between 5 and 500 characters')
];

const criticalValidation = [
  body('notes')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Critical notes must be between 10 and 500 characters')
];

// Protected routes
router.use(protect);

// Admin routes
router.get('/', authorize('admin'), getReports);

// General report routes
router.post('/', upload.array('files', 5), uploadReportValidation, uploadReport);
router.get('/:id', getReport);
router.put('/:id', updateReportValidation, updateReport);
router.delete('/:id', deleteReport);

// Report sharing and collaboration
router.post('/:id/share', shareReportValidation, shareReport);
router.post('/:id/comments', commentValidation, addComment);
router.put('/:id/critical', authorize(['doctor', 'admin']), criticalValidation, markAsCritical);

module.exports = router;
