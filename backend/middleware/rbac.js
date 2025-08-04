const { asyncHandler } = require('./errorHandler');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// Define role-based permissions
const PERMISSIONS = {
  // Patient permissions
  PATIENT: {
    appointments: ['create', 'read_own', 'update_own', 'cancel_own'],
    prescriptions: ['read_own'],
    reports: ['create_own', 'read_own', 'update_own'],
    profile: ['read_own', 'update_own'],
    doctors: ['read_public']
  },
  
  // Doctor permissions
  DOCTOR: {
    appointments: ['read_assigned', 'update_assigned', 'complete_assigned'],
    prescriptions: ['create_for_patients', 'read_assigned', 'update_assigned'],
    reports: ['read_assigned', 'create_for_patients', 'update_assigned'],
    patients: ['read_assigned', 'update_assigned'],
    profile: ['read_own', 'update_own'],
    medical_notes: ['create_for_patients', 'read_assigned', 'update_assigned']
  },
  
  // Admin permissions
  ADMIN: {
    users: ['create', 'read_all', 'update_all', 'delete_all', 'approve', 'suspend'],
    appointments: ['read_all', 'update_all', 'cancel_all'],
    prescriptions: ['read_all', 'update_all', 'delete_all'],
    reports: ['read_all', 'update_all', 'delete_all'],
    doctors: ['approve', 'reject', 'suspend', 'manage_all'],
    analytics: ['read_all', 'generate_reports'],
    system: ['manage_settings', 'view_logs', 'backup']
  }
};

// Check if user has specific permission
const hasPermission = (userRole, resource, action) => {
  const rolePermissions = PERMISSIONS[userRole.toUpperCase()];
  if (!rolePermissions || !rolePermissions[resource]) {
    return false;
  }
  return rolePermissions[resource].includes(action);
};

// Generic permission checker middleware
const requirePermission = (resource, action) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (!hasPermission(req.user.role, resource, action)) {
      return res.status(403).json({
        status: 'error',
        message: `Insufficient permissions. Required: ${resource}:${action}`
      });
    }

    next();
  });
};

// Patient-specific access control
const requirePatientAccess = asyncHandler(async (req, res, next) => {
  const patientId = req.params.patientId || req.params.id || req.body.patient;
  
  // Admin can access all patient data
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Patient can only access their own data
  if (req.user.role === 'patient') {
    if (req.user._id.toString() !== patientId) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only access your own data.'
      });
    }
    return next();
  }
  
  // Doctor can access their assigned patients
  if (req.user.role === 'doctor') {
    // Check if patient has appointments with this doctor
    const hasAppointment = await Appointment.findOne({
      patient: patientId,
      doctor: req.user._id,
      status: { $in: ['scheduled', 'completed', 'in-progress'] }
    });
    
    if (!hasAppointment) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only access your assigned patients.'
      });
    }
    return next();
  }
  
  return res.status(403).json({
    status: 'error',
    message: 'Access denied'
  });
});

// Doctor-specific access control
const requireDoctorAccess = asyncHandler(async (req, res, next) => {
  const doctorId = req.params.doctorId || req.params.id || req.body.doctor;
  
  // Admin can access all doctor data
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Doctor can only access their own data
  if (req.user.role === 'doctor') {
    if (req.user._id.toString() !== doctorId) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only access your own data.'
      });
    }
    return next();
  }
  
  return res.status(403).json({
    status: 'error',
    message: 'Access denied'
  });
});

// Appointment access control
const requireAppointmentAccess = asyncHandler(async (req, res, next) => {
  const appointmentId = req.params.appointmentId || req.params.id;
  
  // Admin can access all appointments
  if (req.user.role === 'admin') {
    return next();
  }
  
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return res.status(404).json({
      status: 'error',
      message: 'Appointment not found'
    });
  }
  
  // Patient can access their own appointments
  if (req.user.role === 'patient') {
    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only access your own appointments.'
      });
    }
    return next();
  }
  
  // Doctor can access appointments assigned to them
  if (req.user.role === 'doctor') {
    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only access your assigned appointments.'
      });
    }
    return next();
  }
  
  return res.status(403).json({
    status: 'error',
    message: 'Access denied'
  });
});

// Resource ownership validation
const requireOwnership = (resourceModel, userField = 'user') => {
  return asyncHandler(async (req, res, next) => {
    const resourceId = req.params.id;
    
    // Admin bypass
    if (req.user.role === 'admin') {
      return next();
    }
    
    const resource = await resourceModel.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found'
      });
    }
    
    // Check ownership
    const ownerId = resource[userField];
    if (ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only access your own resources.'
      });
    }
    
    next();
  });
};

// Admin-only access
const requireAdmin = asyncHandler(async (req, res, next) => {
  console.log('🔍 requireAdmin middleware - checking user role');
  console.log('   User ID:', req.user?._id);
  console.log('   User Email:', req.user?.email);
  console.log('   User Role:', req.user?.role);
  console.log('   User Status:', req.user?.status);
  
  if (req.user.role !== 'admin') {
    console.log('❌ Admin access denied - user role is:', req.user.role);
    return res.status(403).json({
      status: 'error',
      message: 'Admin access required'
    });
  }
  
  console.log('✅ Admin access granted');
  next();
});

// Doctor-only access
const requireDoctor = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({
      status: 'error',
      message: 'Doctor access required'
    });
  }
  next();
});

// Patient-only access
const requirePatient = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({
      status: 'error',
      message: 'Patient access required'
    });
  }
  next();
});

// Verified account requirement
const requireVerified = asyncHandler(async (req, res, next) => {
  console.log('🔍 requireVerified middleware - checking verification status');
  console.log('   User Email:', req.user?.email);
  console.log('   isVerified:', req.user?.isVerified);
  console.log('   isVerified type:', typeof req.user?.isVerified);
  
  if (!req.user.isVerified) {
    console.log('❌ Verification failed - user is not verified');
    return res.status(403).json({
      status: 'error',
      message: 'Account verification required'
    });
  }
  
  console.log('✅ Verification passed');
  next();
});

// Active account requirement
const requireActive = asyncHandler(async (req, res, next) => {
  if (req.user.status !== 'active') {
    return res.status(403).json({
      status: 'error',
      message: 'Account is not active'
    });
  }
  next();
});

// Audit logging for sensitive operations
const auditLog = (action) => {
  return asyncHandler(async (req, res, next) => {
    // Log the action (in production, this would go to a proper audit log)
    console.log(`AUDIT: User ${req.user._id} (${req.user.role}) performed ${action} at ${new Date().toISOString()}`);
    console.log(`Request: ${req.method} ${req.originalUrl}`);
    console.log(`IP: ${req.ip}`);
    
    next();
  });
};

module.exports = {
  PERMISSIONS,
  hasPermission,
  requirePermission,
  requirePatientAccess,
  requireDoctorAccess,
  requireAppointmentAccess,
  requireOwnership,
  requireAdmin,
  requireDoctor,
  requirePatient,
  requireVerified,
  requireActive,
  auditLog
};
