const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/oxiwell', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkDoctorStatus() {
  try {
    console.log('🔍 Checking doctor profile setup status...');
    
    // Find the test doctor
    const doctor = await User.findOne({ 
      email: 'business.khyruddin@gmail.com',
      role: 'doctor' 
    });
    
    if (!doctor) {
      console.log('❌ Doctor not found with email: business.khyruddin@gmail.com');
      console.log('🔍 Let me check all doctors in the database...');
      
      const allDoctors = await User.find({ role: 'doctor' });
      console.log('👥 All doctors found:', allDoctors.map(d => ({ 
        email: d.email, 
        name: d.name,
        profileSetupCompleted: d.profileSetupCompleted 
      })));
      return;
    }
    
    console.log('👤 Doctor found:', {
      name: doctor.name,
      email: doctor.email,
      role: doctor.role,
      status: doctor.status,
      profileSetupCompleted: doctor.profileSetupCompleted,
      profileSetupCompletedAt: doctor.profileSetupCompletedAt
    });
    
    // If profile setup is completed, reset it for testing
    if (doctor.profileSetupCompleted) {
      console.log('🔄 Resetting profile setup status for testing...');
      
      doctor.profileSetupCompleted = false;
      doctor.profileSetupCompletedAt = null;
      
      await doctor.save();
      
      console.log('✅ Profile setup status reset successfully!');
      console.log('🎯 Doctor should now be redirected to profile setup on next login');
    } else {
      console.log('✅ Profile setup is already incomplete - doctor should be redirected to setup');
      console.log('🔄 But let\'s reset it anyway to ensure clean state...');
      
      doctor.profileSetupCompleted = false;
      doctor.profileSetupCompletedAt = null;
      
      await doctor.save();
      
      console.log('✅ Profile setup status reset to ensure clean state!');
    }
    
  } catch (error) {
    console.error('❌ Error checking doctor status:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

checkDoctorStatus();
