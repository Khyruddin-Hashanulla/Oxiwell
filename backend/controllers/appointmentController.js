const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private (Admin only)
const getAppointments = asyncHandler(async (req, res, next) => {
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
    query.appointmentDate = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  }

  const appointments = await Appointment.find(query)
    .populate('patient', 'firstName lastName email phone')
    .populate('doctor', 'firstName lastName specialization')
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

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient', 'firstName lastName email phone dateOfBirth bloodGroup')
    .populate('doctor', 'firstName lastName specialization consultationFee')
    .populate('cancelledBy', 'firstName lastName role');

  if (!appointment) {
    return res.status(404).json({
      status: 'error',
      message: 'Appointment not found'
    });
  }

  // Check authorization
  if (req.user.role !== 'admin' && 
      req.user._id.toString() !== appointment.patient._id.toString() && 
      req.user._id.toString() !== appointment.doctor._id.toString()) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to access this appointment'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      appointment
    }
  });
});

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
const createAppointment = asyncHandler(async (req, res, next) => {
  console.log('📝 Appointment creation endpoint hit');
  console.log('📊 Request body:', req.body);
  console.log('👤 User:', req.user.email);

  try {
    // Validation check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    console.log('✅ Validation passed');

    // Extract data from request body
    const {
      doctor,
      appointmentDate,
      appointmentTime,
      duration,
      appointmentType,
      reason,
      symptoms,
      patientNotes
    } = req.body;

    console.log('🔍 DEBUG: Appointment data extracted:', {
      doctor,
      appointmentDate,
      appointmentTime,
      duration,
      appointmentType,
      reason,
      patient: req.user._id
    });

    // Verify doctor exists and is active
    console.log('🔍 Checking if doctor exists...');
    const doctorUser = await User.findOne({ _id: doctor, role: 'doctor', status: 'active' });
    if (!doctorUser) {
      console.log('❌ Doctor not found:', doctor);
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found or not available'
      });
    }

    console.log('✅ Doctor found:', doctorUser.firstName, doctorUser.lastName);

    // Check if the appointment slot is available
    console.log('🔍 Checking if time slot is available...');
    
    // Simple availability check - just check if slot exists
    const existingAppointment = await Appointment.findOne({
      doctor,
      appointmentDate,
      appointmentTime,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      console.log('❌ Time slot not available - existing appointment found');
      return res.status(400).json({
        status: 'error',
        message: 'The selected time slot is not available'
      });
    }

    console.log('✅ Time slot available');

    // Check if appointment date is in the future
    console.log('🔍 Checking if appointment date is valid...');
    const appointmentDateTime = new Date(appointmentDate);
    const [hours, minutes] = appointmentTime.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (appointmentDateTime <= new Date()) {
      console.log('❌ Appointment date is in the past');
      return res.status(400).json({
        status: 'error',
        message: 'Appointment must be scheduled for a future date and time'
      });
    }

    console.log('✅ Appointment date is valid');

    // Create appointment in database
    console.log('🔄 Creating appointment in database...');
    
    const appointmentData = {
      patient: req.user._id,
      doctor,
      appointmentDate,
      appointmentTime,
      duration: duration || 30,
      appointmentType: appointmentType || 'consultation',
      reason,
      symptoms: symptoms || [],
      patientNotes: patientNotes || '',
      consultationFee: doctorUser.consultationFee || 0,
      status: 'pending'
    };

    console.log('🔍 DEBUG: Appointment data to save:', appointmentData);

    const appointment = await Appointment.create(appointmentData);

    console.log('✅ Appointment created successfully:', appointment._id);
    console.log('🔍 DEBUG: Created appointment details:', {
      _id: appointment._id,
      patient: appointment.patient,
      doctor: appointment.doctor,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      status: appointment.status
    });

    // Verify appointment was actually saved
    const savedAppointment = await Appointment.findById(appointment._id);
    if (!savedAppointment) {
      console.log('❌ ERROR: Appointment was not saved to database');
      return res.status(500).json({
        status: 'error',
        message: 'Failed to save appointment to database'
      });
    }

    console.log('✅ Appointment verified in database');

    // Populate the appointment with doctor and patient details
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization consultationFee');

    console.log('✅ Appointment populated successfully');

    // Return success response
    res.status(201).json({
      status: 'success',
      data: {
        appointment: populatedAppointment
      }
    });

    console.log('✅ Success response sent');

  } catch (error) {
    console.log('❌ CRITICAL ERROR in appointment creation:', error.message);
    console.log('❌ Error stack:', error.stack);
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create appointment',
      error: error.message
    });
  }
});

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = asyncHandler(async (req, res, next) => {
  let appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      status: 'error',
      message: 'Appointment not found'
    });
  }

  // Check authorization
  if (req.user.role !== 'admin' && 
      req.user._id.toString() !== appointment.patient.toString() && 
      req.user._id.toString() !== appointment.doctor.toString()) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to update this appointment'
    });
  }

  // Patients can only update certain fields and only if appointment is pending
  if (req.user.role === 'patient') {
    if (appointment.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Can only update pending appointments'
      });
    }

    const allowedFields = ['reason', 'symptoms', 'patientNotes'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    appointment = await Appointment.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization');
  }

  // Doctors can update status and add notes
  if (req.user.role === 'doctor') {
    const allowedFields = ['status', 'doctorNotes', 'prescriptionGiven', 'followUpRequired', 'followUpDate'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    appointment = await Appointment.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization');
  }

  // Admins can update any field
  if (req.user.role === 'admin') {
    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization');
  }

  res.status(200).json({
    status: 'success',
    data: {
      appointment
    }
  });
});

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      status: 'error',
      message: 'Appointment not found'
    });
  }

  // Check authorization
  if (req.user.role !== 'admin' && 
      req.user._id.toString() !== appointment.patient.toString() && 
      req.user._id.toString() !== appointment.doctor.toString()) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to cancel this appointment'
    });
  }

  // Check if appointment can be cancelled
  if (!appointment.canBeCancelled) {
    return res.status(400).json({
      status: 'error',
      message: 'Appointment cannot be cancelled (less than 2 hours remaining or already completed/cancelled)'
    });
  }

  const { cancellationReason } = req.body;

  if (!cancellationReason) {
    return res.status(400).json({
      status: 'error',
      message: 'Cancellation reason is required'
    });
  }

  appointment.status = 'cancelled';
  appointment.cancelledBy = req.user._id;
  appointment.cancellationReason = cancellationReason;
  appointment.cancelledAt = new Date();

  await appointment.save();

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('patient', 'firstName lastName email phone')
    .populate('doctor', 'firstName lastName specialization')
    .populate('cancelledBy', 'firstName lastName role');

  res.status(200).json({
    status: 'success',
    data: {
      appointment: populatedAppointment
    }
  });
});

// @desc    Get patient appointments
// @route   GET /api/appointments/patient/:patientId
// @access  Private
const getPatientAppointments = asyncHandler(async (req, res, next) => {
  const { patientId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  console.log('🔍 DEBUG: getPatientAppointments called');
  console.log('🔍 DEBUG: patientId:', patientId);
  console.log('🔍 DEBUG: query params:', req.query);

  let query = { patient: patientId };

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  console.log('🔍 DEBUG: MongoDB query:', query);

  // DEBUG: Let's see what appointments actually exist in the database
  const allAppointments = await Appointment.find({}).select('patient doctor appointmentDate status').limit(5);
  console.log('🔍 DEBUG: All appointments in database (sample):', allAppointments);
  console.log('🔍 DEBUG: Sample appointment patient IDs:', allAppointments.map(apt => ({ 
    id: apt._id, 
    patient: apt.patient, 
    patientType: typeof apt.patient,
    patientString: apt.patient?.toString()
  })));

  const appointments = await Appointment.find(query)
    .populate('doctor', 'firstName lastName specialization consultationFee')
    .sort({ appointmentDate: -1 })
    .limit(limit * 1)
    .skip(startIndex);

  console.log('🔍 DEBUG: Found appointments count:', appointments.length);
  if (appointments.length > 0) {
    console.log('🔍 DEBUG: First appointment:', appointments[0]);
    console.log('🔍 DEBUG: First appointment doctor:', appointments[0].doctor);
  }

  const total = await Appointment.countDocuments(query);
  console.log('🔍 DEBUG: Total appointments count:', total);

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

// @desc    Get doctor appointments
// @route   GET /api/appointments/doctor/:doctorId
// @access  Private
const getDoctorAppointments = asyncHandler(async (req, res, next) => {
  const { doctorId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = { doctor: doctorId };

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by date
  if (req.query.date) {
    const date = new Date(req.query.date);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    query.appointmentDate = {
      $gte: startOfDay,
      $lte: endOfDay
    };
  }

  const appointments = await Appointment.find(query)
    .populate('patient', 'firstName lastName email phone dateOfBirth bloodGroup')
    .sort({ appointmentDate: 1, appointmentTime: 1 })
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

// @desc    Get available slots for a doctor
// @route   GET /api/appointments/available-slots/:doctorId
// @access  Private
const getAvailableSlots = asyncHandler(async (req, res, next) => {
  const { doctorId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      status: 'error',
      message: 'Date is required'
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

  // Get booked appointments for the date
  const bookedSlots = await Appointment.findAvailableSlots(doctorId, date);

  // Generate available slots based on doctor's availability
  const availableSlots = [];
  const requestedDate = new Date(date);
  const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'lowercase' });

  // Find doctor's available slots for the day
  const doctorSlots = doctor.availableSlots?.filter(slot => slot.day === dayOfWeek) || [];

  if (doctorSlots.length === 0) {
    return res.status(200).json({
      status: 'success',
      data: {
        availableSlots: [],
        message: 'Doctor is not available on this day'
      }
    });
  }

  // Generate time slots (30-minute intervals)
  doctorSlots.forEach(slot => {
    const startTime = slot.startTime;
    const endTime = slot.endTime;
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    for (let time = startMinutes; time < endMinutes; time += 30) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Check if slot is not booked
      const isBooked = bookedSlots.some(booked => booked.appointmentTime === timeSlot);
      
      if (!isBooked) {
        availableSlots.push({
          time: timeSlot,
          available: true
        });
      }
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      availableSlots,
      doctorInfo: {
        name: doctor.fullName,
        specialization: doctor.specialization,
        consultationFee: doctor.consultationFee
      }
    }
  });
});

// @desc    Get available doctors for appointment booking
// @route   GET /api/appointments/available-doctors
// @access  Private (Authenticated users)
const getAvailableDoctors = asyncHandler(async (req, res, next) => {
  // Get all active and verified doctors
  const doctors = await User.find({
    role: 'doctor',
    status: 'active',
    isVerified: true
  }).select('firstName lastName specialization experience phone location consultationFee');

  res.status(200).json({
    status: 'success',
    results: doctors.length,
    data: {
      doctors
    }
  });
});

module.exports = {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAvailableSlots,
  getAvailableDoctors
};
