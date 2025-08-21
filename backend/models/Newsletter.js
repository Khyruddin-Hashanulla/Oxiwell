const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  source: {
    type: String,
    enum: ['footer_subscription', 'website', 'registration', 'appointment_booking', 'admin'],
    default: 'website'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    healthTips: {
      type: Boolean,
      default: true
    },
    appointmentReminders: {
      type: Boolean,
      default: true
    },
    serviceUpdates: {
      type: Boolean,
      default: true
    },
    promotions: {
      type: Boolean,
      default: false
    }
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date,
    default: null
  },
  unsubscribeToken: {
    type: String,
    default: () => uuidv4(),
    unique: true
  },
  lastEmailSent: {
    type: Date,
    default: null
  },
  emailsSent: {
    type: Number,
    default: 0
  },
  bounced: {
    type: Boolean,
    default: false
  },
  bounceReason: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.unsubscribeToken
      return ret
    }
  }
})

// Indexes for better query performance
newsletterSchema.index({ email: 1, isActive: 1 })
newsletterSchema.index({ subscribedAt: -1 })
newsletterSchema.index({ source: 1 })
newsletterSchema.index({ unsubscribeToken: 1 })

// Static method to get active subscriptions
newsletterSchema.statics.getActiveSubscriptions = function() {
  return this.find({ isActive: true }).sort({ subscribedAt: -1 })
}

// Static method to get subscription stats
newsletterSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalSubscriptions: { $sum: 1 },
        activeSubscriptions: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        inactiveSubscriptions: {
          $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
        }
      }
    }
  ])

  const sourceStats = await this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$source',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ])

  return {
    overview: stats[0] || {
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      inactiveSubscriptions: 0
    },
    bySource: sourceStats
  }
}

// Instance method to unsubscribe
newsletterSchema.methods.unsubscribe = function() {
  this.isActive = false
  this.unsubscribedAt = new Date()
  return this.save()
}

// Instance method to resubscribe
newsletterSchema.methods.resubscribe = function() {
  this.isActive = true
  this.unsubscribedAt = null
  return this.save()
}

// Instance method to update preferences
newsletterSchema.methods.updatePreferences = function(newPreferences) {
  this.preferences = { ...this.preferences, ...newPreferences }
  return this.save()
}

// Pre-save middleware to ensure email is lowercase
newsletterSchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase()
  }
  next()
})

// Virtual for subscription duration
newsletterSchema.virtual('subscriptionDuration').get(function() {
  if (!this.subscribedAt) return 0
  const endDate = this.unsubscribedAt || new Date()
  return Math.floor((endDate - this.subscribedAt) / (1000 * 60 * 60 * 24)) // days
})

module.exports = mongoose.model('Newsletter', newsletterSchema)
