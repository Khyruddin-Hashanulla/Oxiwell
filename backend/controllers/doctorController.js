const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const { asyncHandler } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = asyncHandler(async (req, res, next) => {
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
      { lastName: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const doctors = await User.find(query)
    .select('firstName lastName specialization experience consultationFee qualifications profileImage')
    .sort({ firstName: 1 })
    .limit(limit * 1)
    .skip(startIndex);

  const total = await User.countDocuments(query);

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
      doctors
    }
  });
});

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
const getDoctor = asyncHandler(async (req, res, next) => {
  const doctor = await User.findOne({ 
    _id: req.params.id, 
    role: 'doctor', 
    status: 'active' 
  }).select('firstName lastName specialization experience consultationFee qualifications availableSlots profileImage');

  if (!doctor) {
    return res.status(404).json({
      status: 'error',
      message: 'Doctor not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      doctor
    }
  });
});

// @desc    Get doctor dashboard stats
// @route   GET /api/doctors/dashboard/stats
// @access  Private (Doctor only)
const getDoctorStats = asyncHandler(async (req, res, next) => {
  const doctorId = req.user._id;

  // Get current date ranges
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Parallel queries for better performance
  const [
    todayAppointments,
    weekAppointments,
    monthAppointments,
    totalPatients,
    pendingAppointments,
    completedAppointments,
    totalPrescriptions
  ] = await Promise.all([
    // Today's appointments
    Appointment.countDocuments({
      doctor: doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay }
    }),
    
    // This week's appointments
    Appointment.countDocuments({
      doctor: doctorId,
      appointmentDate: { $gte: startOfWeek, $lte: endOfWeek }
    }),
    
    // This month's appointments
    Appointment.countDocuments({
      doctor: doctorId,
      appointmentDate: { $gte: startOfMonth, $lte: endOfMonth }
    }),
    
    // Total unique patients
    Appointment.distinct('patient', { doctor: doctorId, status: 'completed' }),
    
    // Pending appointments
    Appointment.countDocuments({
      doctor: doctorId,
      status: 'pending'
    }),
    
    // Completed appointments
    Appointment.countDocuments({
      doctor: doctorId,
      status: 'completed'
    }),
    
    // Total prescriptions
    Prescription.countDocuments({
      doctor: doctorId
    })
  ]);

  // Get upcoming appointments for today
  const upcomingToday = await Appointment.find({
    doctor: doctorId,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['pending', 'confirmed'] }
  })
  .populate('patient', 'firstName lastName phone')
  .sort({ appointmentTime: 1 })
  .limit(5);

  // Calculate earnings (this month)
  const monthlyEarnings = await Appointment.aggregate([
    {
      $match: {
        doctor: doctorId,
        appointmentDate: { $gte: startOfMonth, $lte: endOfMonth },
        status: 'completed',
        paymentStatus: 'paid'
      }
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$consultationFee' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        today: {
          appointments: todayAppointments,
          upcoming: upcomingToday
        },
        week: {
          appointments: weekAppointments
        },
        month: {
          appointments: monthAppointments,
          earnings: monthlyEarnings[0]?.totalEarnings || 0
        },
        overall: {
          totalPatients: totalPatients.length,
          pendingAppointments,
          completedAppointments,
          totalPrescriptions
        }
      }
    }
  });
});

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private (Doctor only)
const updateDoctorProfile = asyncHandler(async (req, res, next) => {
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
    'specialization',
    'experience',
    'qualifications',
    'consultationFee',
    'availableSlots'
  ];

  const updates = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const doctor = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true
  }).select('-password');

  res.status(200).json({
    status: 'success',
    data: {
      doctor
    }
  });
});

// @desc    Get doctor's patients
// @route   GET /api/doctors/patients
// @access  Private (Doctor only)
const getDoctorPatients = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Get unique patients who have had appointments with this doctor
  const patientIds = await Appointment.distinct('patient', {
    doctor: req.user._id,
    status: { $in: ['completed', 'confirmed'] }
  });

  let query = { _id: { $in: patientIds } };

  // Search by name
  if (req.query.search) {
    query.$or = [
      { firstName: { $regex: req.query.search, $options: 'i' } },
      { lastName: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const patients = await User.find(query)
    .select('firstName lastName email phone dateOfBirth bloodGroup')
    .sort({ firstName: 1 })
    .limit(limit * 1)
    .skip(startIndex);

  const total = await User.countDocuments(query);

  // Get last appointment for each patient
  const patientsWithLastAppointment = await Promise.all(
    patients.map(async (patient) => {
      const lastAppointment = await Appointment.findOne({
        patient: patient._id,
        doctor: req.user._id
      }).sort({ appointmentDate: -1 });

      return {
        ...patient.toObject(),
        lastAppointment: lastAppointment ? {
          date: lastAppointment.appointmentDate,
          reason: lastAppointment.reason,
          status: lastAppointment.status
        } : null
      };
    })
  );

  res.status(200).json({
    status: 'success',
    count: patients.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      patients: patientsWithLastAppointment
    }
  });
});

// @desc    Get patient history for doctor
// @route   GET /api/doctors/patients/:patientId/history
// @access  Private (Doctor only)
const getPatientHistory = asyncHandler(async (req, res, next) => {
  const { patientId } = req.params;

  // Verify that the doctor has treated this patient
  const hasAppointment = await Appointment.findOne({
    patient: patientId,
    doctor: req.user._id,
    status: { $in: ['completed', 'confirmed'] }
  });

  if (!hasAppointment) {
    return res.status(403).json({
      status: 'error',
      message: 'You are not authorized to view this patient\'s history'
    });
  }

  // Get patient details
  const patient = await User.findById(patientId)
    .select('firstName lastName email phone dateOfBirth bloodGroup allergies medicalHistory emergencyContact');

  if (!patient) {
    return res.status(404).json({
      status: 'error',
      message: 'Patient not found'
    });
  }

  // Get appointments history
  const appointments = await Appointment.find({
    patient: patientId,
    doctor: req.user._id
  }).sort({ appointmentDate: -1 });

  // Get prescriptions
  const prescriptions = await Prescription.find({
    patient: patientId,
    doctor: req.user._id
  }).sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    data: {
      patient,
      appointments,
      prescriptions
    }
  });
});

// @desc    Get doctor's schedule
// @route   GET /api/doctors/schedule
// @access  Private (Doctor only)
const getDoctorSchedule = asyncHandler(async (req, res, next) => {
  const { date } = req.query;
  
  if (!date) {
    return res.status(400).json({
      status: 'error',
      message: 'Date is required'
    });
  }

  const requestedDate = new Date(date);
  const startOfDay = new Date(requestedDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(requestedDate.setHours(23, 59, 59, 999));

  const appointments = await Appointment.find({
    doctor: req.user._id,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay }
  })
  .populate('patient', 'firstName lastName phone')
  .sort({ appointmentTime: 1 });

  res.status(200).json({
    status: 'success',
    data: {
      date,
      appointments
    }
  });
});

// @desc    Complete doctor profile setup (onboarding)
// @route   POST /api/doctors/profile-setup
// @access  Private (Doctor only)
const completeProfileSetup = asyncHandler(async (req, res, next) => {
  const {
    qualifications,
    consultationFee,
    onlineConsultationAvailable,
    offlineConsultationAvailable,
    availableSlots,
    workplaces,
    professionalBio,
    languages,
    address
  } = req.body;

  console.log('🔍 Profile setup request received:', {
    userId: req.user._id,
    consultationFee,
    qualificationsCount: qualifications?.length || 0,
    availableSlotsCount: availableSlots?.length || 0,
    onlineConsultationAvailable,
    offlineConsultationAvailable
  });

  // Validate required fields (only new fields, not registration fields)
  if (!consultationFee || consultationFee <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Valid consultation fee is required'
    });
  }

  // Validate availability slots
  if (!availableSlots || !Array.isArray(availableSlots) || availableSlots.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'At least one available time slot is required'
    });
  }

  // Validate each time slot
  for (const slot of availableSlots) {
    if (!slot.day || !slot.startTime || !slot.endTime) {
      return res.status(400).json({
        status: 'error',
        message: 'Each time slot must have day, start time, and end time'
      });
    }
  }

  // Validate qualifications - require at least one qualification
  if (!qualifications || !Array.isArray(qualifications) || qualifications.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'At least one qualification is required'
    });
  }

  // Validate each qualification
  for (const qual of qualifications) {
    if (!qual.degree || !qual.institution || !qual.year) {
      return res.status(400).json({
        status: 'error',
        message: 'Each qualification must have degree, institution, and year'
      });
    }
  }

  // Validate online/offline consultation availability
  if (onlineConsultationAvailable === undefined && offlineConsultationAvailable === undefined) {
    return res.status(400).json({
      status: 'error',
      message: 'At least one consultation type (online or offline) must be available'
    });
  }

  try {
    const doctor = await User.findById(req.user._id);
    
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    console.log('👤 Doctor found:', {
      email: doctor.email,
      profileSetupCompleted: doctor.profileSetupCompleted,
      status: doctor.status
    });

    if (doctor.profileSetupCompleted) {
      return res.status(400).json({
        status: 'error',
        message: 'Profile setup has already been completed'
      });
    }

    // Update doctor profile with all provided information
    const updateData = {
      consultationFee: parseFloat(consultationFee),
      onlineConsultationAvailable: onlineConsultationAvailable !== false, // Default to true
      offlineConsultationAvailable: offlineConsultationAvailable !== false, // Default to true
      availableSlots: availableSlots || [],
      profileSetupCompleted: true,
      profileSetupCompletedAt: new Date()
    };

    // Add optional fields if provided
    if (qualifications && qualifications.length > 0) {
      updateData.qualifications = qualifications;
    }
    
    if (workplaces && workplaces.length > 0) {
      updateData.workplaces = workplaces;
    }
    
    if (professionalBio) {
      updateData.professionalBio = professionalBio;
    }
    
    if (languages && languages.length > 0) {
      updateData.languages = languages;
    }
    
    if (address) {
      updateData.address = address;
    }

    console.log('📝 Updating doctor profile with:', updateData);

    const updatedDoctor = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('✅ Profile setup completed successfully for:', updatedDoctor.email);

    res.status(200).json({
      status: 'success',
      message: 'Profile setup completed successfully',
      data: {
        doctor: {
          _id: updatedDoctor._id,
          email: updatedDoctor.email,
          firstName: updatedDoctor.firstName,
          lastName: updatedDoctor.lastName,
          profileSetupCompleted: updatedDoctor.profileSetupCompleted,
          consultationFee: updatedDoctor.consultationFee,
          onlineConsultationAvailable: updatedDoctor.onlineConsultationAvailable,
          offlineConsultationAvailable: updatedDoctor.offlineConsultationAvailable
        }
      }
    });
  } catch (error) {
    console.error('❌ Error completing profile setup:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to complete profile setup',
      error: error.message
    });
  }
});

// @desc    Check if doctor profile setup is required
// @route   GET /api/doctors/profile-setup/required
// @access  Private (Doctor only)
const checkProfileSetupRequired = asyncHandler(async (req, res, next) => {
  const doctor = await User.findById(req.user._id).select('profileSetupCompleted role status');
  
  if (!doctor || doctor.role !== 'doctor') {
    return res.status(404).json({
      status: 'error',
      message: 'Doctor not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      profileSetupRequired: !doctor.profileSetupCompleted,
      profileSetupCompleted: doctor.profileSetupCompleted
    }
  });
});

module.exports = {
  getDoctors,
  getDoctor,
  getDoctorStats,
  updateDoctorProfile,
  getDoctorPatients,
  getPatientHistory,
  getDoctorSchedule,
  completeProfileSetup,
  checkProfileSetupRequired
};
