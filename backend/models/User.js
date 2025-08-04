const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  
  // Role and Status
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked', 'pending'],
    default: 'pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Contact Information
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  
  // Profile Information
  dateOfBirth: {
    type: Date,
    required: function() {
      return this.role === 'patient';
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: function() {
      return this.role === 'patient';
    }
  },
  profileImage: {
    type: String,
    default: null
  },
  
  // Doctor-specific fields
  specialization: {
    type: String,
    required: function() {
      return this.role === 'doctor' && this.isVerified && this.status === 'active';
    }
  },
  licenseNumber: {
    type: String,
    required: function() {
      return this.role === 'doctor' && this.isVerified && this.status === 'active';
    },
    unique: true,
    sparse: true
  },
  experience: {
    type: Number,
    required: function() {
      return this.role === 'doctor' && this.isVerified && this.status === 'active';
    }
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  consultationFee: {
    type: Number,
    required: function() {
      return this.role === 'doctor' && this.isVerified && this.status === 'active';
    }
  },
  availableSlots: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: String,
    endTime: String
  }],
  
  // Patient-specific fields
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: function() {
      return this.role === 'patient';
    }
  },
  emergencyContact: {
    name: {
      type: String,
      // Made optional for registration - can be added later in profile
    },
    relationship: {
      type: String,
      // Made optional for registration - can be added later in profile
    },
    phone: {
      type: String,
      // Made optional for registration - can be added later in profile
    }
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    status: {
      type: String,
      enum: ['active', 'resolved', 'chronic'],
      default: 'active'
    }
  }],
  allergies: [String],
  
  // Timestamps and Metadata
  lastLogin: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age (for patients)
userSchema.virtual('age').get(function() {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  return null;
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ specialization: 1 }, { sparse: true });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);
