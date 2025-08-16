const MedicalReport = require('../models/MedicalReport');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');
const { deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all medical reports
// @route   GET /api/reports
// @access  Private (Admin only)
const getReports = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = {};

  // Role-based filtering
  if (req.user.role === 'patient') {
    // Patients can only see their own reports
    query.patient = req.user._id;
  } else if (req.user.role === 'doctor') {
    // Doctors can see reports shared with them or from their patients
    // For now, let's show all reports (admin-like access for doctors)
    // In a real system, you'd filter by sharedWith or assigned patients
    // query.$or = [
    //   { 'sharedWith.doctor': req.user._id },
    //   { patient: { $in: assignedPatientIds } }
    // ];
  }
  // Admins can see all reports (no additional filtering)

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by report type
  if (req.query.reportType) {
    query.reportType = req.query.reportType;
  }

  // Filter by critical reports
  if (req.query.critical === 'true') {
    query.isCritical = true;
  }

  // Search by title or description
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  const reports = await MedicalReport.find(query)
    .populate('patient', 'firstName lastName email phone')
    .populate('uploadedBy', 'firstName lastName role')
    .populate('reviewedBy', 'firstName lastName specialization')
    .sort({ testDate: -1 })
    .limit(limit * 1)
    .skip(startIndex);

  const total = await MedicalReport.countDocuments(query);

  res.status(200).json({
    status: 'success',
    count: reports.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: reports
  });
});

// @desc    Get single medical report
// @route   GET /api/reports/:id
// @access  Private
const getReport = asyncHandler(async (req, res, next) => {
  const report = await MedicalReport.findById(req.params.id)
    .populate('patient', 'firstName lastName email phone dateOfBirth bloodGroup')
    .populate('uploadedBy', 'firstName lastName role')
    .populate('reviewedBy', 'firstName lastName specialization')
    .populate('sharedWith.doctor', 'firstName lastName specialization')
    .populate('comments.author', 'firstName lastName role');

  if (!report) {
    return res.status(404).json({
      status: 'error',
      message: 'Medical report not found'
    });
  }

  // Check authorization
  const isAuthorized = 
    req.user.role === 'admin' ||
    req.user._id.toString() === report.patient._id.toString() ||
    req.user._id.toString() === report.uploadedBy._id.toString() ||
    report.sharedWith.some(share => share.doctor._id.toString() === req.user._id.toString());

  if (!isAuthorized) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to access this medical report'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      report
    }
  });
});

// @desc    Upload medical report
// @route   POST /api/reports
// @access  Private
const uploadReport = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  // Normalize files: support both multer.single('reportFile') and .array('files')
  const incomingFiles = req.files && Array.isArray(req.files)
    ? req.files
    : (req.file ? [req.file] : []);

  if (!incomingFiles || incomingFiles.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'At least one file is required'
    });
  }

  const {
    patient,
    title,
    description,
    reportType,
    category,
    testDate,
    labName,
    doctorName,
    referringDoctor,
    results,
    tags,
    keywords
  } = req.body;

  // If user is a patient, they can only upload their own reports
  let patientId = patient;
  if (req.user.role === 'patient') {
    patientId = req.user._id;
  }

  // Verify patient exists
  const patientDoc = await User.findOne({ _id: patientId, role: 'patient' });
  if (!patientDoc) {
    return res.status(404).json({
      status: 'error',
      message: 'Patient not found'
    });
  }

  // Process uploaded files
  console.log(' File object structure:', JSON.stringify(incomingFiles[0], null, 2));
  
  const files = incomingFiles.map(file => ({
    filename: file.filename || file.originalname || 'unknown',
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    cloudinaryUrl: file.path || file.secure_url || file.url,
    cloudinaryPublicId: file.public_id || file.filename || `${Date.now()}_${file.originalname}`
  }));

  console.log(' Processed files:', JSON.stringify(files, null, 2));
  
  const report = await MedicalReport.create({
    patient: patientId,
    uploadedBy: req.user._id,
    title,
    description,
    reportType,
    category: category || 'diagnostic',
    testDate,
    labName,
    doctorName,
    referringDoctor,
    files,
    results: results ? JSON.parse(results) : [],
    tags: tags ? JSON.parse(tags) : [],
    keywords: keywords ? JSON.parse(keywords) : []
  });

  const populatedReport = await MedicalReport.findById(report._id)
    .populate('patient', 'firstName lastName email phone')
    .populate('uploadedBy', 'firstName lastName role');

  res.status(201).json({
    status: 'success',
    data: {
      report: populatedReport
    }
  });
});

// @desc    Update medical report
// @route   PUT /api/reports/:id
// @access  Private
const updateReport = asyncHandler(async (req, res, next) => {
  let report = await MedicalReport.findById(req.params.id);

  if (!report) {
    return res.status(404).json({
      status: 'error',
      message: 'Medical report not found'
    });
  }

  // Check authorization
  const canEdit = 
    req.user.role === 'admin' ||
    req.user._id.toString() === report.uploadedBy._id.toString() ||
    report.sharedWith.some(share => 
      share.doctor._id.toString() === req.user._id.toString() && 
      share.accessLevel === 'edit'
    );

  if (!canEdit) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to update this medical report'
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const allowedFields = [
    'title',
    'description',
    'reportType',
    'category',
    'testDate',
    'labName',
    'doctorName',
    'results',
    'tags',
    'keywords',
    'status',
    'reviewNotes'
  ];

  const updates = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      if (field === 'results' || field === 'tags' || field === 'keywords') {
        updates[field] = typeof req.body[field] === 'string' ? 
          JSON.parse(req.body[field]) : req.body[field];
      } else {
        updates[field] = req.body[field];
      }
    }
  });

  // If status is being changed to reviewed, set reviewed info
  if (updates.status === 'reviewed' && report.status !== 'reviewed') {
    updates.reviewedBy = req.user._id;
    updates.reviewedAt = new Date();
  }

  report = await MedicalReport.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  })
  .populate('patient', 'firstName lastName email phone')
  .populate('uploadedBy', 'firstName lastName role')
  .populate('reviewedBy', 'firstName lastName specialization');

  res.status(200).json({
    status: 'success',
    data: {
      report
    }
  });
});

// @desc    Delete medical report
// @route   DELETE /api/reports/:id
// @access  Private
const deleteReport = asyncHandler(async (req, res, next) => {
  const report = await MedicalReport.findById(req.params.id);

  if (!report) {
    return res.status(404).json({
      status: 'error',
      message: 'Medical report not found'
    });
  }

  // Check authorization (only admin or uploader can delete)
  if (req.user.role !== 'admin' && req.user._id.toString() !== report.uploadedBy.toString()) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to delete this medical report'
    });
  }

  // Delete files from Cloudinary
  for (const file of report.files) {
    try {
      await deleteFromCloudinary(file.cloudinaryPublicId);
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
    }
  }

  await MedicalReport.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Medical report deleted successfully'
  });
});

// @desc    Share report with doctor
// @route   POST /api/reports/:id/share
// @access  Private (Patient or Admin)
const shareReport = asyncHandler(async (req, res, next) => {
  const report = await MedicalReport.findById(req.params.id);

  if (!report) {
    return res.status(404).json({
      status: 'error',
      message: 'Medical report not found'
    });
  }

  // Check authorization (patient can share their own reports, admin can share any)
  if (req.user.role !== 'admin' && req.user._id.toString() !== report.patient.toString()) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to share this medical report'
    });
  }

  const { doctorId, accessLevel } = req.body;

  if (!doctorId) {
    return res.status(400).json({
      status: 'error',
      message: 'Doctor ID is required'
    });
  }

  // Verify doctor exists
  const doctor = await User.findOne({ _id: doctorId, role: 'doctor', status: 'active' });
  if (!doctor) {
    return res.status(404).json({
      status: 'error',
      message: 'Doctor not found'
    });
  }

  await report.shareWithDoctor(doctorId, accessLevel || 'view');

  const updatedReport = await MedicalReport.findById(report._id)
    .populate('sharedWith.doctor', 'firstName lastName specialization');

  res.status(200).json({
    status: 'success',
    data: {
      report: updatedReport
    }
  });
});

// @desc    Add comment to report
// @route   POST /api/reports/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res, next) => {
  const report = await MedicalReport.findById(req.params.id);

  if (!report) {
    return res.status(404).json({
      status: 'error',
      message: 'Medical report not found'
    });
  }

  // Check authorization
  const canComment = 
    req.user.role === 'admin' ||
    req.user._id.toString() === report.patient._id.toString() ||
    req.user._id.toString() === report.uploadedBy._id.toString() ||
    report.sharedWith.some(share => 
      share.doctor._id.toString() === req.user._id.toString() && 
      ['comment', 'edit'].includes(share.accessLevel)
    );

  if (!canComment) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to comment on this medical report'
    });
  }

  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Comment content is required'
    });
  }

  await report.addComment(req.user._id, content.trim());

  const updatedReport = await MedicalReport.findById(report._id)
    .populate('comments.author', 'firstName lastName role');

  res.status(200).json({
    status: 'success',
    data: {
      report: updatedReport
    }
  });
});

// @desc    Mark report as critical
// @route   PUT /api/reports/:id/critical
// @access  Private (Doctor or Admin)
const markAsCritical = asyncHandler(async (req, res, next) => {
  const report = await MedicalReport.findById(req.params.id);

  if (!report) {
    return res.status(404).json({
      status: 'error',
      message: 'Medical report not found'
    });
  }

  // Only doctors and admins can mark reports as critical
  if (!['doctor', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to mark reports as critical'
    });
  }

  const { notes } = req.body;

  if (!notes || notes.trim().length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Critical notes are required'
    });
  }

  await report.markAsCritical(notes.trim());

  const updatedReport = await MedicalReport.findById(report._id)
    .populate('patient', 'firstName lastName email phone')
    .populate('uploadedBy', 'firstName lastName role');

  res.status(200).json({
    status: 'success',
    data: {
      report: updatedReport
    }
  });
});

module.exports = {
  getReports,
  getReport,
  uploadReport,
  updateReport,
  deleteReport,
  shareReport,
  addComment,
  markAsCritical
};
