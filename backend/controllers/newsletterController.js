const Newsletter = require('../models/Newsletter')
const { validationResult } = require('express-validator')
const nodemailer = require('nodemailer')

// Create newsletter subscription
const subscribeToNewsletter = async (req, res) => {
  try {
    const { email, source } = req.body

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      })
    }

    // Check if email already exists
    const existingSubscription = await Newsletter.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    })

    if (existingSubscription) {
      return res.status(409).json({
        success: false,
        message: 'This email is already subscribed to our newsletter'
      })
    }

    // Create new subscription
    const newsletter = new Newsletter({
      email: email.toLowerCase(),
      source: source || 'website',
      subscribedAt: new Date(),
      isActive: true,
      preferences: {
        healthTips: true,
        appointmentReminders: true,
        serviceUpdates: true,
        promotions: false
      }
    })

    await newsletter.save()

    // Send welcome email (optional)
    try {
      await sendWelcomeEmail(email)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the subscription if email sending fails
    }

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: {
        email: newsletter.email,
        subscribedAt: newsletter.subscribedAt
      }
    })

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to newsletter. Please try again.'
    })
  }
}

// Unsubscribe from newsletter
const unsubscribeFromNewsletter = async (req, res) => {
  try {
    const { email, token } = req.body

    if (!email && !token) {
      return res.status(400).json({
        success: false,
        message: 'Email or unsubscribe token is required'
      })
    }

    let subscription
    if (token) {
      subscription = await Newsletter.findOne({ unsubscribeToken: token })
    } else {
      subscription = await Newsletter.findOne({ 
        email: email.toLowerCase(),
        isActive: true 
      })
    }

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      })
    }

    // Mark as inactive instead of deleting
    subscription.isActive = false
    subscription.unsubscribedAt = new Date()
    await subscription.save()

    res.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    })

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe. Please try again.'
    })
  }
}

// Get subscription status
const getSubscriptionStatus = async (req, res) => {
  try {
    const { email } = req.params

    const subscription = await Newsletter.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    })

    res.json({
      success: true,
      data: {
        isSubscribed: !!subscription,
        subscribedAt: subscription?.subscribedAt || null,
        preferences: subscription?.preferences || null
      }
    })

  } catch (error) {
    console.error('Get subscription status error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to check subscription status'
    })
  }
}

// Update subscription preferences
const updatePreferences = async (req, res) => {
  try {
    const { email } = req.params
    const { preferences } = req.body

    const subscription = await Newsletter.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    })

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      })
    }

    subscription.preferences = { ...subscription.preferences, ...preferences }
    subscription.updatedAt = new Date()
    await subscription.save()

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: subscription.preferences
      }
    })

  } catch (error) {
    console.error('Update preferences error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    })
  }
}

// Admin: Get all subscriptions
const getAllSubscriptions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const skip = (page - 1) * limit

    const subscriptions = await Newsletter.find({ isActive: true })
      .select('-unsubscribeToken')
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Newsletter.countDocuments({ isActive: true })

    res.json({
      success: true,
      data: {
        subscriptions,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: subscriptions.length,
          totalSubscriptions: total
        }
      }
    })

  } catch (error) {
    console.error('Get all subscriptions error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions'
    })
  }
}

// Send welcome email
const sendWelcomeEmail = async (email) => {
  try {
    // Configure nodemailer (you'll need to set up SMTP credentials)
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    const mailOptions = {
      from: `"Oxiwell Health Center" <${process.env.SMTP_FROM || 'noreply@oxiwell.com'}>`,
      to: email,
      subject: 'Welcome to Oxiwell Newsletter!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Oxiwell!</h1>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e40af; margin-bottom: 20px;">Thank you for subscribing!</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              You've successfully subscribed to the Oxiwell newsletter. You'll now receive:
            </p>
            
            <ul style="color: #374151; line-height: 1.8; margin-bottom: 25px;">
              <li>🏥 Latest healthcare tips and insights</li>
              <li>📅 Appointment reminders and updates</li>
              <li>🔔 Important service announcements</li>
              <li>💡 Health and wellness advice</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://oxiwell.com'}" 
                 style="background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); 
                        color: white; padding: 12px 30px; text-decoration: none; 
                        border-radius: 8px; font-weight: bold; display: inline-block;">
                Visit Oxiwell
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
              You can unsubscribe at any time by clicking 
              <a href="${process.env.FRONTEND_URL}/newsletter/unsubscribe?email=${encodeURIComponent(email)}" 
                 style="color: #1e40af;">here</a>
            </p>
          </div>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log('Welcome email sent successfully to:', email)

  } catch (error) {
    console.error('Failed to send welcome email:', error)
    throw error
  }
}

module.exports = {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getSubscriptionStatus,
  updatePreferences,
  getAllSubscriptions
}
