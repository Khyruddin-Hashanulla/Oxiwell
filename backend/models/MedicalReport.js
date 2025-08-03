const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema({
  // References
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient is required']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: false
  },
  
  // Report Details
  title: {
    type: String,
    required: [true, 'Report title is required'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  reportType: {
    type: String,
    enum: [
      'blood-test',
      'urine-test',
      'x-ray',
      'mri',
      'ct-scan',
      'ultrasound',
      'ecg',
      'echo',
      'biopsy',
      'pathology',
      'radiology',
      'lab-report',
      'prescription',
      'discharge-summary',
      'other'
    ],
    required: [true, 'Report type is required']
  },
  category: {
    type: String,
    enum: ['diagnostic', 'therapeutic', 'preventive', 'follow-up'],
    default: 'diagnostic'
  },
  
  // File Information
  files: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    cloudinaryUrl: {
      type: String,
      required: true
    },
    cloudinaryPublicId: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Medical Information
  testDate: {
    type: Date,
    required: [true, 'Test date is required']
  },
  labName: {
    type: String,
    maxlength: [200, 'Lab name cannot exceed 200 characters']
  },
  doctorName: {
    type: String,
    maxlength: [100, 'Doctor name cannot exceed 100 characters']
  },
  referringDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Test Results (for structured data)
  results: [{
    parameter: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    unit: String,
    normalRange: String,
    status: {
      type: String,
      enum: ['normal', 'abnormal', 'critical', 'borderline'],
      default: 'normal'
    },
    notes: String
  }],
  
  // Status and Visibility
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'archived'],
    default: 'pending'
  },
  visibility: {
    type: String,
    enum: ['private', 'shared-with-doctors', 'public'],
    default: 'private'
  },
  
  // Review Information
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewNotes: {
    type: String,
    maxlength: [500, 'Review notes cannot exceed 500 characters']
  },
  
  // Tags and Keywords
  tags: [{
    type: String,
    maxlength: [50, 'Each tag cannot exceed 50 characters']
  }],
  keywords: [{
    type: String,
    maxlength: [30, 'Each keyword cannot exceed 30 characters']
  }],
  
  // Critical Information
  isCritical: {
    type: Boolean,
    default: false
  },
  criticalNotes: {
    type: String,
    required: function() {
      return this.isCritical;
    },
    maxlength: [300, 'Critical notes cannot exceed 300 characters']
  },
  
  // Sharing and Access
  sharedWith: [{
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    },
    accessLevel: {
      type: String,
      enum: ['view', 'comment', 'edit'],
      default: 'view'
    }
  }],
  
  // Comments and Notes
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for file count
medicalReportSchema.virtual('fileCount').get(function() {
  return this.files.length;
});

// Virtual for total file size
medicalReportSchema.virtual('totalFileSize').get(function() {
  return this.files.reduce((total, file) => total + file.size, 0);
});

// Virtual for checking if report is recent (within 30 days)
medicalReportSchema.virtual('isRecent').get(function() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.testDate > thirtyDaysAgo;
});

// Virtual for formatted file size
medicalReportSchema.virtual('formattedFileSize').get(function() {
  const bytes = this.totalFileSize;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Indexes for better query performance
medicalReportSchema.index({ patient: 1, testDate: -1 });
medicalReportSchema.index({ uploadedBy: 1, createdAt: -1 });
medicalReportSchema.index({ reportType: 1, status: 1 });
medicalReportSchema.index({ tags: 1 });
medicalReportSchema.index({ keywords: 1 });
medicalReportSchema.index({ isCritical: 1, status: 1 });

// Text index for search functionality
medicalReportSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  keywords: 'text'
});

// Pre-save middleware
medicalReportSchema.pre('save', function(next) {
  // Set review timestamp when status changes to reviewed
  if (this.isModified('status') && this.status === 'reviewed' && !this.reviewedAt) {
    this.reviewedAt = new Date();
  }
  next();
});

// Static method to find reports by patient
medicalReportSchema.statics.findByPatient = function(patientId, options = {}) {
  const query = this.find({ patient: patientId })
    .populate('uploadedBy', 'firstName lastName role')
    .populate('reviewedBy', 'firstName lastName specialization')
    .sort({ testDate: -1 });
    
  if (options.reportType) {
    query.where('reportType', options.reportType);
  }
  
  if (options.status) {
    query.where('status', options.status);
  }
  
  if (options.limit) {
    query.limit(options.limit);
  }
  
  return query;
};

// Static method to search reports
medicalReportSchema.statics.searchReports = function(searchQuery, patientId, options = {}) {
  const query = {
    patient: patientId,
    $text: { $search: searchQuery }
  };
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .populate('uploadedBy', 'firstName lastName role')
    .populate('reviewedBy', 'firstName lastName specialization')
    .sort({ score: { $meta: 'textScore' } })
    .limit(options.limit || 10);
};

// Instance method to add comment
medicalReportSchema.methods.addComment = function(authorId, content) {
  this.comments.push({
    author: authorId,
    content: content
  });
  return this.save();
};

// Instance method to share with doctor
medicalReportSchema.methods.shareWithDoctor = function(doctorId, accessLevel = 'view') {
  const existingShare = this.sharedWith.find(share => 
    share.doctor.toString() === doctorId.toString()
  );
  
  if (existingShare) {
    existingShare.accessLevel = accessLevel;
    existingShare.sharedAt = new Date();
  } else {
    this.sharedWith.push({
      doctor: doctorId,
      accessLevel: accessLevel
    });
  }
  
  return this.save();
};

// Instance method to remove sharing
medicalReportSchema.methods.removeSharing = function(doctorId) {
  this.sharedWith = this.sharedWith.filter(share => 
    share.doctor.toString() !== doctorId.toString()
  );
  return this.save();
};

// Instance method to mark as critical
medicalReportSchema.methods.markAsCritical = function(notes) {
  this.isCritical = true;
  this.criticalNotes = notes;
  return this.save();
};

module.exports = mongoose.model('MedicalReport', medicalReportSchema);
