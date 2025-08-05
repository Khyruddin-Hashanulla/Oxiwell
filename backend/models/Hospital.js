const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true,
    maxlength: [100, 'Hospital name cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: ['hospital', 'clinic', 'diagnostic-center', 'specialty-center'],
    default: 'hospital'
  },
  
  // Contact Information
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  website: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
  
  // Location Information
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required']
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  
  // Operational Information
  status: {
    type: String,
    enum: ['active', 'inactive', 'under-maintenance'],
    default: 'active'
  },
  operatingHours: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    },
    openTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
    },
    closeTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
    },
    is24Hours: {
      type: Boolean,
      default: false
    }
  }],
  
  // Services and Facilities
  services: [{
    type: String,
    trim: true
  }],
  specialties: [{
    type: String,
    trim: true
  }],
  facilities: [{
    name: String,
    description: String,
    available: {
      type: Boolean,
      default: true
    }
  }],
  
  // Ratings and Reviews
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  // Images and Media
  images: [{
    url: String,
    caption: String,
    type: {
      type: String,
      enum: ['exterior', 'interior', 'facility', 'equipment'],
      default: 'exterior'
    }
  }],
  
  // Administrative Information
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true
  },
  accreditation: [{
    organization: String,
    certificate: String,
    validUntil: Date
  }],
  
  // Doctors associated with this hospital
  doctors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full address
hospitalSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Virtual for checking if hospital is currently open
hospitalSchema.virtual('isCurrentlyOpen').get(function() {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  // Check if operatingHours exists and is an array
  if (!this.operatingHours || !Array.isArray(this.operatingHours)) {
    return false;
  }
  
  const todayHours = this.operatingHours.find(hours => hours.day === currentDay);
  if (!todayHours) return false;
  
  if (todayHours.is24Hours) return true;
  
  return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
});

// Indexes for better query performance
hospitalSchema.index({ name: 1 });
hospitalSchema.index({ 'address.city': 1, 'address.state': 1 });
hospitalSchema.index({ status: 1 });
hospitalSchema.index({ specialties: 1 });
hospitalSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

// Static method to find hospitals by location
hospitalSchema.statics.findByLocation = function(city, state, radius = 50) {
  return this.find({
    'address.city': new RegExp(city, 'i'),
    'address.state': new RegExp(state, 'i'),
    status: 'active'
  });
};

// Static method to find hospitals with specific specialties
hospitalSchema.statics.findBySpecialty = function(specialty) {
  return this.find({
    specialties: new RegExp(specialty, 'i'),
    status: 'active'
  });
};

module.exports = mongoose.model('Hospital', hospitalSchema);
