const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

// Generate JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Create and send token response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('token', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    role,
    dateOfBirth,
    gender,
    bloodGroup,
    address,
    emergencyContact,
    specialization,
    licenseNumber,
    experience,
    qualifications,
    consultationFee
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      status: 'error',
      message: 'User already exists with this email'
    });
  }

  // Create user object based on role
  let userData = {
    firstName,
    lastName,
    email,
    password,
    phone,
    role: role || 'patient',
    address
  };

  // Add role-specific fields
  if (userData.role === 'patient') {
    userData = {
      ...userData,
      dateOfBirth,
      gender,
      bloodGroup,
      emergencyContact
    };
  } else if (userData.role === 'doctor') {
    userData = {
      ...userData,
      specialization,
      licenseNumber,
      experience,
      qualifications,
      consultationFee
    };
  }

  // Create user
  const user = await User.create(userData);

  // Generate email verification token
  const verificationToken = crypto.randomBytes(20).toString('hex');
  user.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  await user.save({ validateBeforeSave: false });

  // TODO: Send verification email
  // await sendVerificationEmail(user.email, verificationToken);

  createSendToken(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  console.log('🔐 Login attempt started');
  console.log('📧 Request body:', req.body);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;
  console.log('📧 Email:', email);
  console.log('🔑 Password provided:', !!password);

  // Check if email and password exist
  if (!email || !password) {
    console.log('❌ Missing email or password');
    return res.status(400).json({
      status: 'error',
      message: 'Please provide email and password'
    });
  }

  // Check for user
  console.log('🔍 Looking for user with email:', email);
  const user = await User.findOne({ email }).select('+password');
  console.log('👤 User found:', !!user);
  
  if (!user) {
    console.log('❌ User not found');
    return res.status(401).json({
      status: 'error',
      message: 'Invalid credentials'
    });
  }

  console.log('🔐 Checking password...');
  const isPasswordCorrect = await user.correctPassword(password, user.password);
  console.log('✅ Password correct:', isPasswordCorrect);

  if (!isPasswordCorrect) {
    console.log('❌ Password incorrect');
    return res.status(401).json({
      status: 'error',
      message: 'Invalid credentials'
    });
  }

  // Check if user account is active
  console.log('📊 User status:', user.status);
  if (user.status === 'blocked') {
    console.log('❌ User blocked');
    return res.status(401).json({
      status: 'error',
      message: 'Your account has been blocked. Please contact administrator.'
    });
  }

  if (user.status === 'inactive') {
    console.log('❌ User inactive');
    return res.status(401).json({
      status: 'error',
      message: 'Your account is inactive. Please contact administrator.'
    });
  }

  // Update last login
  console.log('⏰ Updating last login...');
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  console.log('✅ Login successful, creating token...');
  createSendToken(user, 200, res);
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    status: 'success',
    message: 'User logged out successfully'
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
const updateDetails = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
    address: req.body.address
  };

  // Add role-specific fields
  if (req.user.role === 'patient') {
    if (req.body.emergencyContact) fieldsToUpdate.emergencyContact = req.body.emergencyContact;
    if (req.body.allergies) fieldsToUpdate.allergies = req.body.allergies;
    if (req.body.medicalHistory) fieldsToUpdate.medicalHistory = req.body.medicalHistory;
  } else if (req.user.role === 'doctor') {
    if (req.body.qualifications) fieldsToUpdate.qualifications = req.body.qualifications;
    if (req.body.consultationFee) fieldsToUpdate.consultationFee = req.body.consultationFee;
    if (req.body.availableSlots) fieldsToUpdate.availableSlots = req.body.availableSlots;
  }

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return res.status(401).json({
      status: 'error',
      message: 'Password is incorrect'
    });
  }

  user.password = req.body.newPassword;
  user.passwordChangedAt = new Date();
  await user.save();

  createSendToken(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'There is no user with that email'
    });
  }

  // Get reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    // TODO: Send email
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Password reset token',
    //   message
    // });

    res.status(200).json({
      status: 'success',
      message: 'Email sent'
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      status: 'error',
      message: 'Email could not be sent'
    });
  }
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: resetPasswordToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid token'
    });
  }

  // Set new password
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = new Date();
  await user.save();

  createSendToken(user, 200, res);
});

// @desc    Verify email
// @route   GET /api/auth/verify/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res, next) => {
  const verificationToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken: verificationToken
  });

  if (!user) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid verification token'
    });
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.status = 'active'; // Activate user account after email verification
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully'
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail
};
