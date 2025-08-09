const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const MedicalReport = require('../models/MedicalReport');
const { asyncHandler } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

// @desc    Get patient dashboard stats
// @route   GET /api/patients/dashboard/stats
// @access  Private (Patient only)
const getPatientStats = asyncHandler(async (req, res, next) => {
  const patientId = req.user._id;

  // Get current date ranges
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Parallel queries for better performance
  const [
    totalAppointments,
    upcomingAppointments,
    completedAppointments,
    totalPrescriptions,
    activePrescriptions,
    totalReports,
    recentReports
  ] = await Promise.all([
    // Total appointments
    Appointment.countDocuments({ patient: patientId }),
    
    // Upcoming appointments
    Appointment.find({
      patient: patientId,
      appointmentDate: { $gte: today },
      status: { $in: ['pending', 'confirmed'] }
    })
    .populate('doctor', 'firstName lastName specialization')
    .sort({ appointmentDate: 1 })
    .limit(5),
    
    // Completed appointments
    Appointment.countDocuments({
      patient: patientId,
      status: 'completed'
    }),
    
    // Total prescriptions
    Prescription.countDocuments({ patient: patientId }),
    
    // Active prescriptions
    Prescription.countDocuments({
      patient: patientId,
      status: 'active',
      validUntil: { $gte: today }
    }),
    
    // Total medical reports
    MedicalReport.countDocuments({ patient: patientId }),
    
    // Recent reports (last 30 days)
    MedicalReport.find({
      patient: patientId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    })
    .populate('uploadedBy', 'firstName lastName role')
    .sort({ createdAt: -1 })
    .limit(5)
  ]);

  // Get recent appointments
  const recentAppointments = await Appointment.find({
    patient: patientId,
    appointmentDate: { $lte: today }
  })
  .populate('doctor', 'firstName lastName specialization')
  .sort({ appointmentDate: -1 })
  .limit(5);

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        appointments: {
          total: totalAppointments,
          completed: completedAppointments,
          upcoming: upcomingAppointments.length
        },
        prescriptions: {
          total: totalPrescriptions,
          active: activePrescriptions
        },
        reports: {
          total: totalReports,
          recent: recentReports.length
        }
      },
      upcomingAppointments,
      recentAppointments,
      recentReports
    }
  });
});

// @desc    Update patient profile
// @route   PUT /api/patients/profile
// @access  Private (Patient only)
const updatePatientProfile = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const allowedFields = [
    'firstName',
    'lastName',
    'phone',
    'address',
    'emergencyContact',
    'allergies',
    'medicalHistory'
  ];

  const updates = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const patient = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true
  }).select('-password');

  res.status(200).json({
    status: 'success',
    data: {
      patient
    }
  });
});

// @desc    Get patient appointments
// @route   GET /api/patients/appointments
// @access  Private (Patient only)
const getPatientAppointments = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = { patient: req.user._id };

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by date range
  if (req.query.startDate && req.query.endDate) {
    query.appointmentDate = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  }

  const appointments = await Appointment.find(query)
    .populate('doctor', 'firstName lastName specialization consultationFee')
    .sort({ appointmentDate: -1 })
    .limit(limit * 1)
    .skip(startIndex);

  const total = await Appointment.countDocuments(query);

  res.status(200).json({
    status: 'success',
    count: appointments.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      appointments
    }
  });
});

// @desc    Get patient prescriptions
// @route   GET /api/patients/prescriptions
// @access  Private (Patient only)
const getPatientPrescriptions = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = { patient: req.user._id };

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  const prescriptions = await Prescription.find(query)
    .populate({
      path: 'doctor',
      select: 'firstName lastName specialization medicalRegistrationNumber licenseNumber qualifications workplaces',
      populate: {
        path: 'workplaces.hospital',
        model: 'Hospital',
        select: 'name address phone email'
      }
    })
    .populate('patient', 'firstName lastName dateOfBirth gender email phone')
    .populate('appointment', 'appointmentDate reason')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip(startIndex);

  const total = await Prescription.countDocuments(query);

  res.status(200).json({
    status: 'success',
    count: prescriptions.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      prescriptions
    }
  });
});

// @desc    Get patient medical reports
// @route   GET /api/patients/reports
// @access  Private (Patient only)
const getPatientReports = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = { patient: req.user._id };

  // Filter by report type
  if (req.query.reportType) {
    query.reportType = req.query.reportType;
  }

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Search by title or description
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const reports = await MedicalReport.find(query)
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
    data: {
      reports
    }
  });
});

// @desc    Get patient medical history
// @route   GET /api/patients/medical-history
// @access  Private (Patient only)
const getPatientMedicalHistory = asyncHandler(async (req, res, next) => {
  const patientId = req.user._id;

  // Get patient details with medical history
  const patient = await User.findById(patientId)
    .select('firstName lastName dateOfBirth bloodGroup allergies medicalHistory emergencyContact');

  // Get all appointments
  const appointments = await Appointment.find({ patient: patientId })
    .populate('doctor', 'firstName lastName specialization')
    .sort({ appointmentDate: -1 });

  // Get all prescriptions
  const prescriptions = await Prescription.find({ patient: patientId })
    .populate('doctor', 'firstName lastName specialization')
    .sort({ createdAt: -1 });

  // Get all medical reports
  const reports = await MedicalReport.find({ patient: patientId })
    .populate('uploadedBy', 'firstName lastName role')
    .sort({ testDate: -1 });

  // Get doctors patient has visited
  const doctorIds = [...new Set(appointments.map(apt => apt.doctor._id.toString()))];
  const doctors = await User.find({ _id: { $in: doctorIds } })
    .select('firstName lastName specialization');

  res.status(200).json({
    status: 'success',
    data: {
      patient,
      appointments,
      prescriptions,
      reports,
      doctors
    }
  });
});

// @desc    Search doctors
// @route   GET /api/patients/search-doctors
// @access  Private (Patient only)
const searchDoctors = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = { role: 'doctor', status: 'active' };

  // Filter by specialization
  if (req.query.specialization) {
    query.specialization = { $regex: req.query.specialization, $options: 'i' };
  }

  // Search by name
  if (req.query.search) {
    query.$or = [
      { firstName: { $regex: req.query.search, $options: 'i' } },
      { lastName: { $regex: req.query.search, $options: 'i' } },
      { specialization: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Filter by consultation fee range
  if (req.query.minFee || req.query.maxFee) {
    query.consultationFee = {};
    if (req.query.minFee) query.consultationFee.$gte = parseInt(req.query.minFee);
    if (req.query.maxFee) query.consultationFee.$lte = parseInt(req.query.maxFee);
  }

  const doctors = await User.find(query)
    .select('firstName lastName specialization experience consultationFee qualifications availableSlots profileImage')
    .sort({ firstName: 1 })
    .limit(limit * 1)
    .skip(startIndex);

  const total = await User.countDocuments(query);

  // Get appointment counts for each doctor (for rating/popularity)
  const doctorsWithStats = await Promise.all(
    doctors.map(async (doctor) => {
      const appointmentCount = await Appointment.countDocuments({
        doctor: doctor._id,
        status: 'completed'
      });

      return {
        ...doctor.toObject(),
        appointmentCount
      };
    })
  );

  res.status(200).json({
    status: 'success',
    count: doctors.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      doctors: doctorsWithStats
    }
  });
});

// @desc    Get available specializations
// @route   GET /api/patients/specializations
// @access  Private (Patient only)
const getSpecializations = asyncHandler(async (req, res, next) => {
  const specializations = await User.distinct('specialization', {
    role: 'doctor',
    status: 'active'
  });

  res.status(200).json({
    status: 'success',
    data: {
      specializations: specializations.filter(spec => spec).sort()
    }
  });
});

module.exports = {
  getPatientStats,
  updatePatientProfile,
  getPatientAppointments,
  getPatientPrescriptions,
  getPatientReports,
  getPatientMedicalHistory,
  searchDoctors,
  getSpecializations
};
