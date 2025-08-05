const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('./errorHandler');

// Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  console.log(' Auth middleware - checking token for:', req.method, req.path);
  console.log(' Headers:', req.headers.authorization ? 'Has Authorization header' : 'No Authorization header');

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log(' Token found in headers:', token ? `${token.substring(0, 20)}...` : 'Empty token');
  }

  // Check for token in cookies
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log(' Token found in cookies:', token ? `${token.substring(0, 20)}...` : 'Empty token');
  }

  // Make sure token exists
  if (!token) {
    console.log(' No token found - returning 401');
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(' Token decoded successfully for user ID:', decoded.id);

    // Get user from token with fresh data from database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      console.log(' No user found with this token - returning 401');
      return res.status(401).json({
        status: 'error',
        message: 'No user found with this token'
      });
    }

    console.log(' User found:', user.email, 'Role:', user.role, 'Status:', user.status);

    // Check if user is active (allow pending for some routes)
    if (user.status !== 'active' && user.status !== 'pending') {
      console.log(' User account is not active - returning 401');
      return res.status(401).json({
        status: 'error',
        message: 'User account is not active'
      });
    }

    // Check if user changed password after the token was issued
    if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
      console.log(' User recently changed password - returning 401');
      return res.status(401).json({
        status: 'error',
        message: 'User recently changed password. Please log in again'
      });
    }

    // Attach fresh user data to request
    req.user = user;
    console.log(' User attached to request:', user.email, user.role);
    next();
  } catch (error) {
    console.log(' Error verifying token - returning 401:', error.message);
    
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired. Please log in again'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token. Please log in again'
      });
    }
    
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

// Validate session and refresh user data
const validateSession = asyncHandler(async (req, res, next) => {
  // Skip if no user is attached (will be handled by protect middleware)
  if (!req.user) {
    return next();
  }

  try {
    // Refresh user data from database to ensure latest status
    const freshUser = await User.findById(req.user._id).select('-password');
    
    if (!freshUser) {
      console.log(' Session validation failed - user no longer exists');
      return res.status(401).json({
        status: 'error',
        message: 'User session is no longer valid'
      });
    }

    // Check if user status changed
    if (freshUser.status !== req.user.status) {
      console.log(' User status changed from', req.user.status, 'to', freshUser.status);
      req.user = freshUser; // Update with fresh data
    }

    // Check if user role changed
    if (freshUser.role !== req.user.role) {
      console.log(' User role changed from', req.user.role, 'to', freshUser.role);
      req.user = freshUser; // Update with fresh data
    }

    next();
  } catch (error) {
    console.log(' Session validation error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Session validation failed'
    });
  }
});

module.exports = {
  protect,
  authorize,
  authorizeOwnerOrAdmin,
  authorizePatientAccess,
  authorizeDoctorAccess,
  requireVerification,
  logActivity,
  validateSession
};
