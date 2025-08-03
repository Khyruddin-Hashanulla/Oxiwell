const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

// @desc    Get all prescriptions
// @route   GET /api/prescriptions
// @access  Private (Admin only)
const getPrescriptions = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = {};

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by date range
  if (req.query.startDate && req.query.endDate) {
    query.createdAt = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  }

  const prescriptions = await Prescription.find(query)
    .populate('patient', 'firstName lastName email phone')
    .populate('doctor', 'firstName lastName specialization')
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

// @desc    Get single prescription
// @route   GET /api/prescriptions/:id
// @access  Private
const getPrescription = asyncHandler(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('patient', 'firstName lastName email phone dateOfBirth bloodGroup')
    .populate('doctor', 'firstName lastName specialization licenseNumber')
    .populate('appointment', 'appointmentDate appointmentTime reason');

  if (!prescription) {
    return res.status(404).json({
      status: 'error',
      message: 'Prescription not found'
    });
  }

  // Check authorization
  if (req.user.role !== 'admin' && 
      req.user._id.toString() !== prescription.patient._id.toString() && 
      req.user._id.toString() !== prescription.doctor._id.toString()) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to access this prescription'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      prescription
    }
  });
});

// @desc    Create new prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor only)
const createPrescription = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const {
    patient,
    appointment,
    diagnosis,
    medications,
    generalInstructions,
    dietaryRestrictions,
    precautions,
    followUpDate,
    recommendedTests,
    validUntil
  } = req.body;

  // Verify appointment exists and belongs to this doctor
  const appointmentDoc = await Appointment.findOne({
    _id: appointment,
    doctor: req.user._id,
    patient: patient
  });

  if (!appointmentDoc) {
    return res.status(404).json({
      status: 'error',
      message: 'Appointment not found or you are not authorized to create prescription for this appointment'
    });
  }

  // Verify patient exists
  const patientDoc = await User.findOne({ _id: patient, role: 'patient' });
  if (!patientDoc) {
    return res.status(404).json({
      status: 'error',
      message: 'Patient not found'
    });
  }

  const prescription = await Prescription.create({
    patient,
    doctor: req.user._id,
    appointment,
    diagnosis,
    medications,
    generalInstructions,
    dietaryRestrictions,
    precautions,
    followUpDate,
    recommendedTests,
    validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
    emergencyContact: patientDoc.emergencyContact
  });

  // Update appointment to mark prescription as given
  await Appointment.findByIdAndUpdate(appointment, {
    prescriptionGiven: true,
    followUpRequired: !!followUpDate,
    followUpDate: followUpDate
  });

  const populatedPrescription = await Prescription.findById(prescription._id)
    .populate('patient', 'firstName lastName email phone')
    .populate('doctor', 'firstName lastName specialization')
    .populate('appointment', 'appointmentDate reason');

  res.status(201).json({
    status: 'success',
    data: {
      prescription: populatedPrescription
    }
  });
});

// @desc    Update prescription
// @route   PUT /api/prescriptions/:id
// @access  Private (Doctor only - own prescriptions)
const updatePrescription = asyncHandler(async (req, res, next) => {
  let prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    return res.status(404).json({
      status: 'error',
      message: 'Prescription not found'
    });
  }

  // Check if user is the doctor who created the prescription
  if (req.user.role !== 'admin' && req.user._id.toString() !== prescription.doctor.toString()) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to update this prescription'
    });
  }

  // Check if prescription is still active and not expired
  if (prescription.status !== 'active' || prescription.isExpired) {
    return res.status(400).json({
      status: 'error',
      message: 'Cannot update expired or inactive prescription'
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
    'diagnosis',
    'medications',
    'generalInstructions',
    'dietaryRestrictions',
    'precautions',
    'followUpDate',
    'recommendedTests',
    'validUntil',
    'pharmacyNotes'
  ];

  const updates = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  prescription = await Prescription.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  })
  .populate('patient', 'firstName lastName email phone')
  .populate('doctor', 'firstName lastName specialization')
  .populate('appointment', 'appointmentDate reason');

  res.status(200).json({
    status: 'success',
    data: {
      prescription
    }
  });
});

// @desc    Verify prescription
// @route   GET /api/prescriptions/verify/:verificationCode
// @access  Public
const verifyPrescription = asyncHandler(async (req, res, next) => {
  try {
    const prescription = await Prescription.verifyPrescription(req.params.verificationCode);
    
    res.status(200).json({
      status: 'success',
      data: {
        prescription: {
          prescriptionNumber: prescription.prescriptionNumber,
          patient: prescription.patient,
          doctor: prescription.doctor,
          diagnosis: prescription.diagnosis,
          medications: prescription.medications,
          generalInstructions: prescription.generalInstructions,
          validUntil: prescription.validUntil,
          isExpired: prescription.isExpired,
          createdAt: prescription.createdAt
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Get prescriptions by patient
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private
const getPrescriptionsByPatient = asyncHandler(async (req, res, next) => {
  const { patientId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  // Check authorization
  if (req.user.role !== 'admin' && req.user._id.toString() !== patientId) {
    // If user is a doctor, check if they have treated this patient
    if (req.user.role === 'doctor') {
      const hasAppointment = await Appointment.findOne({
        patient: patientId,
        doctor: req.user._id,
        status: { $in: ['completed', 'confirmed'] }
      });

      if (!hasAppointment) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to access this patient\'s prescriptions'
        });
      }
    } else {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this patient\'s prescriptions'
      });
    }
  }

  const prescriptions = await Prescription.findByPatient(patientId, {
    status: req.query.status,
    limit: limit
  });

  res.status(200).json({
    status: 'success',
    count: prescriptions.length,
    data: {
      prescriptions
    }
  });
});

// @desc    Get prescriptions by doctor
// @route   GET /api/prescriptions/doctor/:doctorId
// @access  Private
const getPrescriptionsByDoctor = asyncHandler(async (req, res, next) => {
  const { doctorId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  // Check authorization
  if (req.user.role !== 'admin' && req.user._id.toString() !== doctorId) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to access this doctor\'s prescriptions'
    });
  }

  const prescriptions = await Prescription.findByDoctor(doctorId, {
    status: req.query.status,
    limit: limit
  });

  res.status(200).json({
    status: 'success',
    count: prescriptions.length,
    data: {
      prescriptions
    }
  });
});

// @desc    Mark prescription as dispensed
// @route   PUT /api/prescriptions/:id/dispense
// @access  Private (Admin or Pharmacy)
const dispensePrescription = asyncHandler(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    return res.status(404).json({
      status: 'error',
      message: 'Prescription not found'
    });
  }

  if (prescription.status !== 'active') {
    return res.status(400).json({
      status: 'error',
      message: 'Prescription is not active'
    });
  }

  if (prescription.isExpired) {
    return res.status(400).json({
      status: 'error',
      message: 'Prescription has expired'
    });
  }

  const { pharmacyName, pharmacistName, licenseNumber } = req.body;

  if (!pharmacyName || !pharmacistName || !licenseNumber) {
    return res.status(400).json({
      status: 'error',
      message: 'Pharmacy name, pharmacist name, and license number are required'
    });
  }

  await prescription.markAsDispensed({
    pharmacyName,
    pharmacistName,
    licenseNumber
  });

  const updatedPrescription = await Prescription.findById(prescription._id)
    .populate('patient', 'firstName lastName')
    .populate('doctor', 'firstName lastName specialization');

  res.status(200).json({
    status: 'success',
    data: {
      prescription: updatedPrescription
    }
  });
});

// @desc    Add medication to prescription
// @route   POST /api/prescriptions/:id/medications
// @access  Private (Doctor only - own prescriptions)
const addMedication = asyncHandler(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    return res.status(404).json({
      status: 'error',
      message: 'Prescription not found'
    });
  }

  // Check authorization
  if (req.user._id.toString() !== prescription.doctor.toString()) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to modify this prescription'
    });
  }

  if (prescription.status !== 'active' || prescription.isExpired) {
    return res.status(400).json({
      status: 'error',
      message: 'Cannot modify expired or inactive prescription'
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

  await prescription.addMedication(req.body);

  const updatedPrescription = await Prescription.findById(prescription._id)
    .populate('patient', 'firstName lastName')
    .populate('doctor', 'firstName lastName specialization');

  res.status(200).json({
    status: 'success',
    data: {
      prescription: updatedPrescription
    }
  });
});

module.exports = {
  getPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription,
  verifyPrescription,
  getPrescriptionsByPatient,
  getPrescriptionsByDoctor,
  dispensePrescription,
  addMedication
};
