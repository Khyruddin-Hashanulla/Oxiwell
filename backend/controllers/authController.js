const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { asyncHandler } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');
const { generateOTP, sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');

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

// @desc    Register user (Step 1: Send OTP)
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  console.log('📝 Registration attempt started');
  console.log('📧 Request body:', { ...req.body, password: '***' });

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { firstName, lastName, email, password, phone, dateOfBirth, gender, bloodGroup, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.isVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email'
      });
    } else {
      // Delete existing unverified user and their OTPs to allow re-registration
      await User.findByIdAndDelete(existingUser._id);
      await OTP.deleteMany({ email });
      console.log('�️  Deleted existing unverified user');
    }
  }

  // Generate OTP
  const otp = generateOTP();
  console.log('🔢 Generated OTP for:', email);

  try {
    // Save OTP to database
    await OTP.deleteMany({ email, purpose: 'email_verification' }); // Clear any existing OTPs
    const otpRecord = new OTP({
      email,
      otp,
      purpose: 'email_verification'
    });
    await otpRecord.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, firstName);
    
    if (!emailResult.success) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to send verification email. Please try again.'
      });
    }

    // Store user data temporarily (without saving to User collection yet)
    // We'll create the user after OTP verification
    const tempUserData = {
      firstName,
      lastName,
      email,
      password, // Will be hashed when user is created after verification
      phone,
      dateOfBirth,
      gender,
      bloodGroup,
      role: role || 'patient' // Use provided role or default to patient
    };

    // Store in session or cache (for now, we'll use a simple approach)
    // In production, you might want to use Redis or similar
    global.tempUserData = global.tempUserData || {};
    global.tempUserData[email] = tempUserData;

    console.log('✅ OTP sent successfully');
    res.status(200).json({
      status: 'success',
      message: 'Verification code sent to your email. Please check your inbox.',
      data: {
        email,
        otpSent: true,
        expiresIn: '10 minutes'
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error message:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// @desc    Verify OTP and complete registration (Step 2)
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res, next) => {
  console.log('🔐 OTP verification attempt started');
  console.log('📧 Request body:', req.body);
  console.log('📧 Email received:', req.body.email);
  console.log('🔢 OTP received:', req.body.otp);
  console.log('🔢 OTP type:', typeof req.body.otp);
  console.log('🔢 OTP length:', req.body.otp?.length);
  
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ OTP Validation errors:', errors.array());
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      status: 'error',
      message: 'Email and OTP are required'
    });
  }

  try {
    // Find valid OTP
    const otpRecord = await OTP.findValidOTP(email, otp, 'email_verification');
    
    if (!otpRecord) {
      // Increment attempts for existing OTP
      await OTP.updateOne(
        { email, purpose: 'email_verification', isUsed: false },
        { $inc: { attempts: 1 } }
      );
      
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired OTP. Please request a new one.'
      });
    }

    // Check if attempts exceeded
    if (otpRecord.isAttemptsExceeded()) {
      await OTP.deleteMany({ email, purpose: 'email_verification' });
      return res.status(400).json({
        status: 'error',
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Get temporary user data
    const tempUserData = global.tempUserData?.[email];
    if (!tempUserData) {
      return res.status(400).json({
        status: 'error',
        message: 'Registration session expired. Please start registration again.'
      });
    }

    // Create the user now that email is verified
    const userData = {
      ...tempUserData,
      isVerified: true,
      status: tempUserData.role === 'doctor' ? 'pending' : 'active',
      emailVerifiedAt: new Date()
    };

    // Check if user already exists (in case of race condition)
    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists and is verified'
      });
    }

    if (user && !user.isVerified) {
      // Update existing unverified user
      Object.assign(user, userData);
      await user.save();
    } else {
      // Create new user
      user = await User.create(userData);
    }

    // Clean up temporary data
    delete global.tempUserData[email];

    // Send welcome email
    await sendWelcomeEmail(email, user.firstName);

    console.log('✅ User registration completed:', user.email);

    // Send token response (automatically log in the user)
    createSendToken(user, 201, res);

  } catch (error) {
    console.error('❌ OTP verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Verification failed. Please try again.'
    });
  }
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = asyncHandler(async (req, res, next) => {
  console.log('🔄 OTP resend request');
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      status: 'error',
      message: 'Email is required'
    });
  }

  try {
    // Check if there's temporary user data or existing unverified user
    const tempUserData = global.tempUserData?.[email];
    const existingUser = await User.findOne({ email, isVerified: false });
    
    if (!tempUserData && !existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'No pending registration found for this email'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    
    // Clear existing OTPs and create new one
    await OTP.deleteMany({ email, purpose: 'email_verification' });
    const otpRecord = new OTP({
      email,
      otp,
      purpose: 'email_verification'
    });
    await otpRecord.save();

    // Send OTP email
    const firstName = tempUserData?.firstName || existingUser?.firstName || 'User';
    const emailResult = await sendOTPEmail(email, otp, firstName);
    
    if (!emailResult.success) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to send verification email. Please try again.'
      });
    }

    console.log('✅ OTP resent successfully');
    res.status(200).json({
      status: 'success',
      message: 'New verification code sent to your email.',
      data: {
        email,
        otpSent: true,
        expiresIn: '10 minutes'
      }
    });

  } catch (error) {
    console.error('❌ OTP resend error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to resend OTP. Please try again.'
    });
  }
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
      message: 'No account found with this email address. Please check your email or register for a new account.'
    });
  }

  console.log('🔐 Checking password...');
  const isPasswordCorrect = await user.correctPassword(password, user.password);
  console.log('✅ Password correct:', isPasswordCorrect);

  if (!isPasswordCorrect) {
    console.log('❌ Password incorrect');
    return res.status(401).json({
      status: 'error',
      message: 'Incorrect password. Please check your password and try again.'
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

  if (user.status === 'pending') {
    console.log('⏳ User pending approval');
    const message = user.role === 'doctor' 
      ? 'Your doctor account is pending admin approval. You will receive an email once approved.'
      : 'Your account is pending approval. Please contact administrator.';
    
    return res.status(403).json({
      status: 'error',
      message: message,
      code: 'PENDING_APPROVAL'
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
  verifyEmail,
  verifyOTP,
  resendOTP
};
