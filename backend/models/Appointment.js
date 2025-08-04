const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  
  // Appointment Details
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
  },
  duration: {
    type: Number,
    default: 30, // minutes
    min: [15, 'Minimum appointment duration is 15 minutes'],
    max: [120, 'Maximum appointment duration is 120 minutes']
  },
  
  // Status and Type
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending'
  },
  appointmentType: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'routine-checkup'],
    default: 'consultation'
  },
  
  // Reason and Notes
  reason: {
    type: String,
    required: [true, 'Reason for appointment is required'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  symptoms: [{
    type: String,
    maxlength: [100, 'Each symptom cannot exceed 100 characters']
  }],
  patientNotes: {
    type: String,
    maxlength: [1000, 'Patient notes cannot exceed 1000 characters']
  },
  doctorNotes: {
    type: String,
    maxlength: [1000, 'Doctor notes cannot exceed 1000 characters']
  },
  
  // Payment and Billing
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: [0, 'Consultation fee cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'net-banking', 'insurance'],
    required: function() {
      return this.paymentStatus === 'paid';
    }
  },
  transactionId: {
    type: String,
    required: function() {
      return this.paymentStatus === 'paid' && this.paymentMethod !== 'cash';
    }
  },
  
  // Prescription and Follow-up
  prescriptionGiven: {
    type: Boolean,
    default: false
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date,
    required: function() {
      return this.followUpRequired;
    }
  },
  
  // Cancellation Details
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.status === 'cancelled';
    }
  },
  cancellationReason: {
    type: String,
    required: function() {
      return this.status === 'cancelled';
    },
    maxlength: [300, 'Cancellation reason cannot exceed 300 characters']
  },
  cancelledAt: {
    type: Date,
    required: function() {
      return this.status === 'cancelled';
    }
  },
  
  // Timestamps
  confirmedAt: Date,
  completedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for appointment duration in hours
appointmentSchema.virtual('durationInHours').get(function() {
  return this.duration / 60;
});

// Virtual for appointment date and time combined
appointmentSchema.virtual('appointmentDateTime').get(function() {
  if (!this.appointmentTime) {
    return new Date(this.appointmentDate);
  }
  const date = new Date(this.appointmentDate);
  const [hours, minutes] = this.appointmentTime.split(':');
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return date;
});

// Virtual for checking if appointment is upcoming
appointmentSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  const appointmentDateTime = this.appointmentDateTime;
  return appointmentDateTime > now && ['pending', 'confirmed'].includes(this.status);
});

// Virtual for checking if appointment can be cancelled
appointmentSchema.virtual('canBeCancelled').get(function() {
  const now = new Date();
  const appointmentDateTime = this.appointmentDateTime;
  const timeDiff = appointmentDateTime - now;
  const hoursUntilAppointment = timeDiff / (1000 * 60 * 60);
  
  return hoursUntilAppointment > 2 && ['pending', 'confirmed'].includes(this.status);
});

// Indexes for better query performance
appointmentSchema.index({ patient: 1, appointmentDate: 1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });
appointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });

// Pre-save middleware to set timestamps
appointmentSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    
    switch (this.status) {
      case 'confirmed':
        if (!this.confirmedAt) this.confirmedAt = now;
        break;
      case 'completed':
        if (!this.completedAt) this.completedAt = now;
        break;
      case 'cancelled':
        if (!this.cancelledAt) this.cancelledAt = now;
        break;
    }
  }
  next();
});

// Static method to find available slots for a doctor
appointmentSchema.statics.findAvailableSlots = async function(doctorId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const bookedAppointments = await this.find({
    doctor: doctorId,
    appointmentDate: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $in: ['pending', 'confirmed'] }
  }).select('appointmentTime duration');
  
  return bookedAppointments;
};

// Static method to check slot availability
appointmentSchema.statics.isSlotAvailable = async function(doctorId, date, time, duration = 30) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const [hours, minutes] = time.split(':');
  const appointmentStart = parseInt(hours) * 60 + parseInt(minutes);
  const appointmentEnd = appointmentStart + duration;
  
  const conflictingAppointments = await this.find({
    doctor: doctorId,
    appointmentDate: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $in: ['pending', 'confirmed'] }
  });
  
  for (const appointment of conflictingAppointments) {
    const [existingHours, existingMinutes] = appointment.appointmentTime.split(':');
    const existingStart = parseInt(existingHours) * 60 + parseInt(existingMinutes);
    const existingEnd = existingStart + appointment.duration;
    
    // Check for overlap
    if (appointmentStart < existingEnd && appointmentEnd > existingStart) {
      return false;
    }
  }
  
  return true;
};

module.exports = mongoose.model('Appointment', appointmentSchema);
