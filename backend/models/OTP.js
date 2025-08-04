const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    length: 6
  },
  purpose: {
    type: String,
    enum: ['email_verification', 'password_reset'],
    default: 'email_verification'
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5 // Maximum 5 attempts allowed
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 600 // 10 minutes in seconds
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
otpSchema.index({ email: 1, purpose: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Instance method to check if OTP is expired
otpSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Instance method to check if OTP attempts exceeded
otpSchema.methods.isAttemptsExceeded = function() {
  return this.attempts >= 5;
};

// Static method to find valid OTP
otpSchema.statics.findValidOTP = async function(email, otp, purpose = 'email_verification') {
  return await this.findOne({
    email,
    otp,
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });
};

// Static method to cleanup expired OTPs
otpSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isUsed: true },
      { attempts: { $gte: 5 } }
    ]
  });
  console.log(`🧹 Cleaned up ${result.deletedCount} expired/used OTPs`);
  return result;
};

// Pre-save middleware to set expiration time
otpSchema.pre('save', function(next) {
  if (this.isNew) {
    // Set expiration to 10 minutes from now
    this.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  }
  next();
});

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
