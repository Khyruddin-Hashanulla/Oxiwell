const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  // References
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient is required']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor is required']
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: [true, 'Appointment is required']
  },
  
  // Prescription Details
  prescriptionNumber: {
    type: String,
    unique: true,
    required: true
  },
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required'],
    maxlength: [500, 'Diagnosis cannot exceed 500 characters']
  },
  
  // Medications
  medications: [{
    name: {
      type: String,
      required: [true, 'Medication name is required']
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required']
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      enum: ['once-daily', 'twice-daily', 'thrice-daily', 'four-times-daily', 'as-needed', 'custom']
    },
    customFrequency: {
      type: String,
      required: function() {
        return this.frequency === 'custom';
      }
    },
    duration: {
      type: String,
      required: [true, 'Duration is required']
    },
    instructions: {
      type: String,
      maxlength: [200, 'Instructions cannot exceed 200 characters']
    },
    beforeFood: {
      type: Boolean,
      default: false
    },
    afterFood: {
      type: Boolean,
      default: true
    }
  }],
  
  // Additional Instructions
  generalInstructions: {
    type: String,
    maxlength: [1000, 'General instructions cannot exceed 1000 characters']
  },
  dietaryRestrictions: [{
    type: String,
    maxlength: [100, 'Each dietary restriction cannot exceed 100 characters']
  }],
  precautions: [{
    type: String,
    maxlength: [200, 'Each precaution cannot exceed 200 characters']
  }],
  
  // Follow-up and Tests
  followUpDate: Date,
  recommendedTests: [{
    testName: {
      type: String,
      required: true
    },
    urgency: {
      type: String,
      enum: ['urgent', 'routine', 'optional'],
      default: 'routine'
    },
    instructions: String
  }],
  
  // Status and Validity
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'expired'],
    default: 'active'
  },
  validUntil: {
    type: Date,
    required: true
  },
  
  // Digital Signature and Verification
  digitalSignature: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Pharmacy and Dispensing
  pharmacyNotes: {
    type: String,
    maxlength: [500, 'Pharmacy notes cannot exceed 500 characters']
  },
  dispensedBy: {
    pharmacyName: String,
    pharmacistName: String,
    licenseNumber: String,
    dispensedAt: Date
  },
  
  // Emergency Information
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if prescription is expired
prescriptionSchema.virtual('isExpired').get(function() {
  return new Date() > this.validUntil;
});

// Virtual for days until expiry
prescriptionSchema.virtual('daysUntilExpiry').get(function() {
  const now = new Date();
  const timeDiff = this.validUntil - now;
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
});

// Virtual for total medications count
prescriptionSchema.virtual('medicationCount').get(function() {
  return this.medications.length;
});

// Indexes for better query performance
prescriptionSchema.index({ patient: 1, createdAt: -1 });
prescriptionSchema.index({ doctor: 1, createdAt: -1 });
prescriptionSchema.index({ prescriptionNumber: 1 });
prescriptionSchema.index({ status: 1, validUntil: 1 });
prescriptionSchema.index({ verificationCode: 1 }, { sparse: true });

// Pre-save middleware to generate prescription number
prescriptionSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.prescriptionNumber = `RX${year}${String(count + 1).padStart(6, '0')}`;
    
    // Generate verification code
    this.verificationCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Set default validity (30 days from creation)
    if (!this.validUntil) {
      this.validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    
    // Generate digital signature (simplified - in production, use proper digital signing)
    this.digitalSignature = `${this.doctor}_${this.prescriptionNumber}_${Date.now()}`;
  }
  next();
});

// Static method to find prescriptions by patient
prescriptionSchema.statics.findByPatient = function(patientId, options = {}) {
  const query = this.find({ patient: patientId })
    .populate('doctor', 'firstName lastName specialization licenseNumber')
    .populate('appointment', 'appointmentDate appointmentTime reason')
    .sort({ createdAt: -1 });
    
  if (options.status) {
    query.where('status', options.status);
  }
  
  if (options.limit) {
    query.limit(options.limit);
  }
  
  return query;
};

// Static method to find prescriptions by doctor
prescriptionSchema.statics.findByDoctor = function(doctorId, options = {}) {
  const query = this.find({ doctor: doctorId })
    .populate('patient', 'firstName lastName dateOfBirth bloodGroup')
    .populate('appointment', 'appointmentDate appointmentTime reason')
    .sort({ createdAt: -1 });
    
  if (options.status) {
    query.where('status', options.status);
  }
  
  if (options.limit) {
    query.limit(options.limit);
  }
  
  return query;
};

// Static method to verify prescription
prescriptionSchema.statics.verifyPrescription = async function(verificationCode) {
  const prescription = await this.findOne({ verificationCode })
    .populate('patient', 'firstName lastName')
    .populate('doctor', 'firstName lastName specialization licenseNumber');
    
  if (!prescription) {
    throw new Error('Invalid verification code');
  }
  
  if (prescription.isExpired) {
    throw new Error('Prescription has expired');
  }
  
  return prescription;
};

// Instance method to add medication
prescriptionSchema.methods.addMedication = function(medication) {
  this.medications.push(medication);
  return this.save();
};

// Instance method to remove medication
prescriptionSchema.methods.removeMedication = function(medicationId) {
  this.medications.id(medicationId).remove();
  return this.save();
};

// Instance method to mark as dispensed
prescriptionSchema.methods.markAsDispensed = function(pharmacyInfo) {
  this.dispensedBy = {
    ...pharmacyInfo,
    dispensedAt: new Date()
  };
  this.status = 'completed';
  return this.save();
};

module.exports = mongoose.model('Prescription', prescriptionSchema);
