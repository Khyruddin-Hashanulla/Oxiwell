const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const OTP = require('./models/OTP');

const cleanupEmailData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/oxiwell');
    console.log('✅ Connected to MongoDB');

    // Check for users with normalized emails (without dots)
    console.log('\n🔍 Checking for users with normalized Gmail addresses...');
    
    // Look for Gmail addresses without dots that might have been normalized
    const normalizedUsers = await User.find({ 
      email: { $regex: '^[a-zA-Z0-9]+@gmail\\.com$' } // Gmail without dots
    });
    
    console.log(`📊 Found ${normalizedUsers.length} users with potentially normalized emails:`);
    normalizedUsers.forEach(user => {
      console.log(`   📧 ${user.email} - Role: ${user.role}, Status: ${user.status}`);
    });

    // Check for specific problematic user
    const problematicUser = await User.findOne({ email: 'khyruddinworking@gmail.com' });
    if (problematicUser) {
      console.log('\n🔧 Found problematic user: khyruddinworking@gmail.com');
      console.log('   This user was created with normalized email (dot removed)');
      console.log('   Deleting this user to allow fresh registration...');
      
      await User.deleteOne({ email: 'khyruddinworking@gmail.com' });
      console.log('✅ Deleted user: khyruddinworking@gmail.com');
    } else {
      console.log('\n✅ No problematic user found with email: khyruddinworking@gmail.com');
    }

    // Clean up any OTPs for normalized emails
    console.log('\n🧹 Cleaning up OTPs for normalized emails...');
    const otpDeleteResult = await OTP.deleteMany({ 
      email: { $regex: '^[a-zA-Z0-9]+@gmail\\.com$' } 
    });
    console.log(`✅ Deleted ${otpDeleteResult.deletedCount} OTPs with normalized emails`);

    // Specifically clean up OTPs for the problematic email
    const specificOtpDelete = await OTP.deleteMany({ email: 'khyruddinworking@gmail.com' });
    console.log(`✅ Deleted ${specificOtpDelete.deletedCount} OTPs for khyruddinworking@gmail.com`);

    console.log('\n🎉 Email data cleanup completed!');
    console.log('✨ You can now register with khyruddin.working@gmail.com without issues');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
};

// Run the cleanup
cleanupEmailData();
