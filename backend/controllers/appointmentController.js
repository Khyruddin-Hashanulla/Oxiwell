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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

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

  // Verify doctor exists and is active
  const doctorUser = await User.findOne({ _id: doctor, role: 'doctor', status: 'active' });
  if (!doctorUser) {
    return res.status(404).json({
      status: 'error',
      message: 'Doctor not found or not available'
    });
  }

  // Check if the appointment slot is available
  const isAvailable = await Appointment.isSlotAvailable(doctor, appointmentDate, appointmentTime, duration);
  if (!isAvailable) {
    return res.status(400).json({
      status: 'error',
      message: 'The selected time slot is not available'
    });
  }

  // Check if appointment date is in the future
  const appointmentDateTime = new Date(appointmentDate);
  const [hours, minutes] = appointmentTime.split(':');
  appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  if (appointmentDateTime <= new Date()) {
    return res.status(400).json({
      status: 'error',
      message: 'Appointment must be scheduled for a future date and time'
    });
  }

  const appointment = await Appointment.create({
    patient: req.user._id,
    doctor,
    appointmentDate,
    appointmentTime,
    duration: duration || 30,
    appointmentType: appointmentType || 'consultation',
    reason,
    symptoms,
    patientNotes,
    consultationFee: doctorUser.consultationFee
  });

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('patient', 'firstName lastName email phone')
    .populate('doctor', 'firstName lastName specialization consultationFee');

  res.status(201).json({
    status: 'success',
    data: {
      appointment: populatedAppointment
    }
  });
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

  let query = { patient: patientId };

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
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

module.exports = {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAvailableSlots
};
