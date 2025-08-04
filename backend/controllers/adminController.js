const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const MedicalReport = require('../models/MedicalReport');
const { asyncHandler } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getDashboardStats = asyncHandler(async (req, res, next) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Get user statistics
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ status: 'active' });
  const pendingUsers = await User.countDocuments({ status: 'pending' });
  const totalPatients = await User.countDocuments({ role: 'patient' });
  const totalDoctors = await User.countDocuments({ role: 'doctor' });
  const newUsersThisMonth = await User.countDocuments({ 
    createdAt: { $gte: startOfMonth } 
  });

  // Get appointment statistics
  const totalAppointments = await Appointment.countDocuments();
  const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
  const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
  const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
  const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });
  const appointmentsThisMonth = await Appointment.countDocuments({
    appointmentDate: { $gte: startOfMonth }
  });

  // Get prescription statistics
  const totalPrescriptions = await Prescription.countDocuments();
  const activePrescriptions = await Prescription.countDocuments({ status: 'active' });
  const dispensedPrescriptions = await Prescription.countDocuments({ status: 'dispensed' });
  const prescriptionsThisMonth = await Prescription.countDocuments({
    createdAt: { $gte: startOfMonth }
  });

  // Get report statistics
  const totalReports = await MedicalReport.countDocuments();
  const pendingReports = await MedicalReport.countDocuments({ status: 'pending' });
  const reviewedReports = await MedicalReport.countDocuments({ status: 'reviewed' });
  const criticalReports = await MedicalReport.countDocuments({ isCritical: true });
  const reportsThisMonth = await MedicalReport.countDocuments({
    createdAt: { $gte: startOfMonth }
  });

  // Get revenue statistics (if payment tracking is implemented)
  const totalRevenue = await Appointment.aggregate([
    { $match: { 'payment.status': 'completed' } },
    { $group: { _id: null, total: { $sum: '$payment.amount' } } }
  ]);

  const monthlyRevenue = await Appointment.aggregate([
    { 
      $match: { 
        'payment.status': 'completed',
        appointmentDate: { $gte: startOfMonth }
      } 
    },
    { $group: { _id: null, total: { $sum: '$payment.amount' } } }
  ]);

  // Get monthly appointment trends
  const appointmentTrends = await Appointment.aggregate([
    {
      $match: {
        appointmentDate: { $gte: startOfYear }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$appointmentDate' },
          month: { $month: '$appointmentDate' }
        },
        count: { $sum: 1 },
        revenue: { 
          $sum: { 
            $cond: [
              { $eq: ['$payment.status', 'completed'] },
              '$payment.amount',
              0
            ]
          }
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      users: {
        total: totalUsers,
        active: activeUsers,
        pending: pendingUsers,
        patients: totalPatients,
        doctors: totalDoctors,
        newThisMonth: newUsersThisMonth
      },
      appointments: {
        total: totalAppointments,
        pending: pendingAppointments,
        confirmed: confirmedAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        thisMonth: appointmentsThisMonth
      },
      prescriptions: {
        total: totalPrescriptions,
        active: activePrescriptions,
        dispensed: dispensedPrescriptions,
        thisMonth: prescriptionsThisMonth
      },
      reports: {
        total: totalReports,
        pending: pendingReports,
        reviewed: reviewedReports,
        critical: criticalReports,
        thisMonth: reportsThisMonth
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        thisMonth: monthlyRevenue[0]?.total || 0
      },
      trends: {
        appointments: appointmentTrends
      }
    }
  });
});

// @desc    Get all users with filtering and pagination
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = {};

  // Filter by role
  if (req.query.role) {
    query.role = req.query.role;
  }

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Search by name or email
  if (req.query.search) {
    query.$or = [
      { firstName: { $regex: req.query.search, $options: 'i' } },
      { lastName: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select('-password -resetPasswordToken -resetPasswordExpire')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip(startIndex);

  const total = await User.countDocuments(query);

  res.status(200).json({
    status: 'success',
    count: users.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      users
    }
  });
});

// @desc    Get single user details
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password -resetPasswordToken -resetPasswordExpire');

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  // Get user statistics
  let userStats = {};

  if (user.role === 'patient') {
    const appointmentCount = await Appointment.countDocuments({ patient: user._id });
    const prescriptionCount = await Prescription.countDocuments({ patient: user._id });
    const reportCount = await MedicalReport.countDocuments({ patient: user._id });

    userStats = {
      appointments: appointmentCount,
      prescriptions: prescriptionCount,
      reports: reportCount
    };
  } else if (user.role === 'doctor') {
    const appointmentCount = await Appointment.countDocuments({ doctor: user._id });
    const prescriptionCount = await Prescription.countDocuments({ doctor: user._id });
    const patientCount = await Appointment.distinct('patient', { doctor: user._id });

    userStats = {
      appointments: appointmentCount,
      prescriptions: prescriptionCount,
      patients: patientCount.length
    };
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
      stats: userStats
    }
  });
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
const updateUserStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!['active', 'inactive', 'suspended', 'pending'].includes(status)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid status value'
    });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status, statusUpdatedAt: new Date() },
    { new: true, runValidators: true }
  ).select('-password -resetPasswordToken -resetPasswordExpire');

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  // Don't allow deletion of other admin users
  if (user.role === 'admin' && user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      status: 'error',
      message: 'Cannot delete other admin users'
    });
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully'
  });
});

// @desc    Get system activity logs
// @route   GET /api/admin/activity
// @access  Private (Admin only)
const getActivityLogs = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  // This would require implementing an activity logging system
  // For now, return recent user activities based on model timestamps
  const recentAppointments = await Appointment.find()
    .populate('patient', 'firstName lastName')
    .populate('doctor', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(10)
    .select('patient doctor status appointmentDate createdAt');

  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select('firstName lastName role status createdAt');

  const recentReports = await MedicalReport.find()
    .populate('patient', 'firstName lastName')
    .populate('uploadedBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(10)
    .select('title patient uploadedBy status createdAt');

  // Combine and sort activities
  const activities = [
    ...recentAppointments.map(apt => ({
      type: 'appointment',
      action: 'created',
      description: `Appointment ${apt.status} for ${apt.patient.firstName} ${apt.patient.lastName}`,
      timestamp: apt.createdAt,
      data: apt
    })),
    ...recentUsers.map(user => ({
      type: 'user',
      action: 'registered',
      description: `New ${user.role} registered: ${user.firstName} ${user.lastName}`,
      timestamp: user.createdAt,
      data: user
    })),
    ...recentReports.map(report => ({
      type: 'report',
      action: 'uploaded',
      description: `Report "${report.title}" uploaded by ${report.uploadedBy.firstName} ${report.uploadedBy.lastName}`,
      timestamp: report.createdAt,
      data: report
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const paginatedActivities = activities.slice(startIndex, startIndex + limit);

  res.status(200).json({
    status: 'success',
    count: paginatedActivities.length,
    pagination: {
      page,
      limit,
      total: activities.length,
      pages: Math.ceil(activities.length / limit)
    },
    data: {
      activities: paginatedActivities
    }
  });
});

// @desc    Generate system reports
// @route   GET /api/admin/reports
// @access  Private (Admin only)
const generateSystemReports = asyncHandler(async (req, res, next) => {
  const { type, startDate, endDate } = req.query;
  
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  let reportData = {};

  switch (type) {
    case 'users':
      reportData = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
            active: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            }
          }
        }
      ]);
      break;

    case 'appointments':
      reportData = await Appointment.aggregate([
        {
          $match: {
            appointmentDate: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$payment.amount' }
          }
        }
      ]);
      break;

    case 'revenue':
      reportData = await Appointment.aggregate([
        {
          $match: {
            appointmentDate: { $gte: start, $lte: end },
            'payment.status': 'completed'
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$appointmentDate' },
              month: { $month: '$appointmentDate' },
              day: { $dayOfMonth: '$appointmentDate' }
            },
            revenue: { $sum: '$payment.amount' },
            appointments: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);
      break;

    default:
      return res.status(400).json({
        status: 'error',
        message: 'Invalid report type. Use: users, appointments, or revenue'
      });
  }

  res.status(200).json({
    status: 'success',
    data: {
      type,
      period: { start, end },
      report: reportData
    }
  });
});

// @desc    Approve doctor application
// @route   PUT /api/admin/doctors/:id/approve
// @access  Private (Admin only)
const approveDoctor = asyncHandler(async (req, res, next) => {
  const doctor = await User.findById(req.params.id);

  if (!doctor) {
    return res.status(404).json({
      status: 'error',
      message: 'Doctor not found'
    });
  }

  if (doctor.role !== 'doctor') {
    return res.status(400).json({
      status: 'error',
      message: 'User is not a doctor'
    });
  }

  if (doctor.status === 'active') {
    return res.status(400).json({
      status: 'error',
      message: 'Doctor is already approved'
    });
  }

  // Approve the doctor
  doctor.status = 'active';
  doctor.isVerified = true;
  
  // Skip validation during approval since professional fields may be empty
  // The doctor can complete their profile after approval
  await doctor.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Doctor approved successfully',
    data: {
      doctor
    }
  });
});

// @desc    Reject doctor application
// @route   PUT /api/admin/doctors/:id/reject
// @access  Private (Admin only)
const rejectDoctor = asyncHandler(async (req, res, next) => {
  const { rejectionReason } = req.body;

  if (!rejectionReason || rejectionReason.trim().length < 10) {
    return res.status(400).json({
      status: 'error',
      message: 'Rejection reason is required and must be at least 10 characters'
    });
  }

  const doctor = await User.findById(req.params.id);

  if (!doctor) {
    return res.status(404).json({
      status: 'error',
      message: 'Doctor not found'
    });
  }

  if (doctor.role !== 'doctor') {
    return res.status(400).json({
      status: 'error',
      message: 'User is not a doctor'
    });
  }

  // Reject the doctor
  doctor.status = 'rejected';
  doctor.rejectionReason = rejectionReason.trim();
  doctor.rejectedAt = new Date();
  await doctor.save();

  res.status(200).json({
    status: 'success',
    message: 'Doctor application rejected',
    data: {
      doctor
    }
  });
});

// @desc    Suspend user account
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (Admin only)
const suspendUser = asyncHandler(async (req, res, next) => {
  const { suspensionReason } = req.body;

  if (!suspensionReason || suspensionReason.trim().length < 10) {
    return res.status(400).json({
      status: 'error',
      message: 'Suspension reason is required and must be at least 10 characters'
    });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  if (user.role === 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Cannot suspend admin users'
    });
  }

  if (user.status === 'suspended') {
    return res.status(400).json({
      status: 'error',
      message: 'User is already suspended'
    });
  }

  // Suspend the user
  user.status = 'suspended';
  user.suspensionReason = suspensionReason.trim();
  user.suspendedAt = new Date();
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'User suspended successfully',
    data: {
      user
    }
  });
});

// @desc    Reactivate suspended user
// @route   PUT /api/admin/users/:id/reactivate
// @access  Private (Admin only)
const reactivateUser = asyncHandler(async (req, res, next) => {
  const { reactivationNotes } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  if (user.status !== 'suspended') {
    return res.status(400).json({
      status: 'error',
      message: 'User is not suspended'
    });
  }

  // Reactivate the user
  user.status = 'active';
  user.reactivationNotes = reactivationNotes ? reactivationNotes.trim() : '';
  user.reactivatedAt = new Date();
  // Clear suspension data
  user.suspensionReason = undefined;
  user.suspendedAt = undefined;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'User reactivated successfully',
    data: {
      user
    }
  });
});

// @desc    Get pending doctors for approval
// @route   GET /api/admin/pending-doctors
// @access  Private/Admin
const getPendingDoctors = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Get pending doctors
  const pendingDoctors = await User.find({
    role: 'doctor',
    status: 'pending'
  })
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  // Get total count for pagination
  const total = await User.countDocuments({
    role: 'doctor',
    status: 'pending'
  });

  const pagination = {};
  const endIndex = page * limit;

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    status: 'success',
    count: pendingDoctors.length,
    total,
    pagination,
    data: {
      doctors: pendingDoctors
    }
  });
});

module.exports = {
  getDashboardStats,
  getUsers,
  getUser,
  updateUserStatus,
  deleteUser,
  getActivityLogs,
  generateSystemReports,
  approveDoctor,
  rejectDoctor,
  suspendUser,
  reactivateUser,
  getPendingDoctors
};
