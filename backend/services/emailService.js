const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create email transporter
const createTransporter = () => {
  // For development, you can use Gmail or any SMTP service
  // For production, use services like SendGrid, AWS SES, etc.
  return nodemailer.createTransport({
    service: 'gmail', // You can change this to your preferred service
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS  // Your app password
    }
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, firstName = 'User') => {
  try {
    // For development: if no email credentials, just log the OTP
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('📧 DEVELOPMENT MODE - Email credentials not configured');
      console.log('🔢 OTP for', email, ':', otp);
      console.log('📝 Copy this OTP to complete registration:', otp);
      return { success: true, messageId: 'dev-mode-' + Date.now() };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Oxiwell Health Center',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Verify Your Email - Oxiwell Health Center',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-code { background: #667eea; color: white; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 Oxiwell Health Center</h1>
              <p>Email Verification Required</p>
            </div>
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              <p>Thank you for registering with Oxiwell Health Center. To complete your registration, please verify your email address using the OTP code below:</p>
              
              <div class="otp-code">${otp}</div>
              
              <p><strong>This OTP is valid for 10 minutes only.</strong></p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul>
                  <li>Never share this OTP with anyone</li>
                  <li>Oxiwell staff will never ask for your OTP</li>
                  <li>If you didn't request this verification, please ignore this email</li>
                </ul>
              </div>
              
              <p>If you have any questions, please contact our support team.</p>
              
              <p>Best regards,<br>The Oxiwell Health Center Team</p>
            </div>
            <div class="footer">
              <p>© 2025 Oxiwell Health Center. All rights reserved.</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email after successful verification
const sendWelcomeEmail = async (email, firstName) => {
  try {
    // For development: if no email credentials, just log the OTP
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('📧 DEVELOPMENT MODE - Email credentials not configured');
      console.log('📝 Welcome email not sent');
      return { success: true, messageId: 'dev-mode-' + Date.now() };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Oxiwell Health Center',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Welcome to Oxiwell Health Center! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Oxiwell</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
            .cta-button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Oxiwell!</h1>
              <p>Your account has been successfully verified</p>
            </div>
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              <p>Congratulations! Your email has been verified and your Oxiwell Health Center account is now active.</p>
              
              <h3>What you can do now:</h3>
              
              <div class="feature">
                <h4>📅 Book Appointments</h4>
                <p>Schedule appointments with our qualified doctors at your convenience.</p>
              </div>
              
              <div class="feature">
                <h4>📋 View Medical Records</h4>
                <p>Access your medical history, prescriptions, and test reports securely.</p>
              </div>
              
              <div class="feature">
                <h4>💊 Manage Prescriptions</h4>
                <p>Keep track of your medications and prescription history.</p>
              </div>
              
              <div class="feature">
                <h4>📱 24/7 Access</h4>
                <p>Access your health information anytime, anywhere through our platform.</p>
              </div>
              
              <p>Ready to get started? Log in to your account and explore all the features we have to offer.</p>
              
              <a href="${process.env.FRONTEND_URL}/login" class="cta-button">Login to Your Account</a>
              
              <p>If you have any questions or need assistance, our support team is here to help.</p>
              
              <p>Best regards,<br>The Oxiwell Health Center Team</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetUrl, firstName = 'User') => {
  try {
    // For development: if no email credentials, just log the reset URL
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('📧 DEVELOPMENT MODE - Email credentials not configured');
      console.log('🔗 Password reset URL for', email, ':', resetUrl);
      console.log('📝 Copy this URL to reset password:', resetUrl);
      return { success: true, messageId: 'dev-mode-' + Date.now() };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Oxiwell Health Center',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Reset Your Password - Oxiwell Health Center',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .reset-button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .reset-button:hover { background: #5a67d8; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .url-box { background: #e2e8f0; padding: 15px; border-radius: 5px; margin: 15px 0; word-break: break-all; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Oxiwell Health Center</h1>
              <p>Password Reset Request</p>
            </div>
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              <p>You have requested to reset your password for your Oxiwell Health Center account. Click the button below to create a new password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="reset-button">Reset My Password</a>
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <div class="url-box">${resetUrl}</div>
              
              <div class="warning">
                <strong>⚠️ Important Security Information:</strong>
                <ul>
                  <li><strong>This link expires in 1 hour</strong> for your security</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                  <li>Contact support if you have any concerns</li>
                </ul>
              </div>
              
              <p>If you continue to have problems, please contact our support team.</p>
              
              <p>Best regards,<br>The Oxiwell Health Center Team</p>
            </div>
            <div class="footer">
              <p>© 2025 Oxiwell Health Center. All rights reserved.</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
};
