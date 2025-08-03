const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('./errorHandler');

// Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check for token in cookies
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'No user found with this token'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        status: 'error',
        message: 'User account is not active'
      });
    }

    // Check if user changed password after the token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'error',
        message: 'User recently changed password. Please log in again'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized to access this route'
    });
  }
});

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user is the owner of the resource or has admin privileges
const authorizeOwnerOrAdmin = (resourceField = 'user') => {
  return (req, res, next) => {
    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user is the owner
    const resourceUserId = req[resourceField] || req.params.userId || req.body.userId;
    
    if (req.user._id.toString() === resourceUserId.toString()) {
      return next();
    }

    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to access this resource'
    });
  };
};

// Check if user can access patient data (patient themselves, their doctor, or admin)
const authorizePatientAccess = asyncHandler(async (req, res, next) => {
  const patientId = req.params.patientId || req.body.patient;
  
  // Admin can access everything
  if (req.user.role === 'admin') {
    return next();
  }

  // Patient can access their own data
  if (req.user.role === 'patient' && req.user._id.toString() === patientId.toString()) {
    return next();
  }

  // Doctor can access their patient's data (check if they have appointments together)
  if (req.user.role === 'doctor') {
    const Appointment = require('../models/Appointment');
    const hasAppointment = await Appointment.findOne({
      patient: patientId,
      doctor: req.user._id,
      status: { $in: ['confirmed', 'completed'] }
    });

    if (hasAppointment) {
      return next();
    }
  }

  return res.status(403).json({
    status: 'error',
    message: 'Not authorized to access this patient data'
  });
});

// Check if user can access doctor data
const authorizeDoctorAccess = (req, res, next) => {
  const doctorId = req.params.doctorId || req.body.doctor;
  
  // Admin can access everything
  if (req.user.role === 'admin') {
    return next();
  }

  // Doctor can access their own data
  if (req.user.role === 'doctor' && req.user._id.toString() === doctorId.toString()) {
    return next();
  }

  // Patients can access basic doctor info (handled in controller with limited fields)
  if (req.user.role === 'patient') {
    return next();
  }

  return res.status(403).json({
    status: 'error',
    message: 'Not authorized to access this doctor data'
  });
};

// Middleware to check if user account is verified
const requireVerification = (req, res, next) => {
  if (!req.user.emailVerified) {
    return res.status(403).json({
      status: 'error',
      message: 'Please verify your email address to access this feature'
    });
  }
  next();
};

// Middleware to log user activity
const logActivity = (action) => {
  return (req, res, next) => {
    // Update last login time
    if (req.user) {
      User.findByIdAndUpdate(req.user._id, { lastLogin: new Date() }).exec();
    }
    
    // Log activity (in production, you might want to use a proper logging service)
    console.log(`User ${req.user?._id} performed action: ${action} at ${new Date().toISOString()}`);
    next();
  };
};

module.exports = {
  protect,
  authorize,
  authorizeOwnerOrAdmin,
  authorizePatientAccess,
  authorizeDoctorAccess,
  requireVerification,
  logActivity
};
