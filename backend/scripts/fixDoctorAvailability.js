const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const fixDoctorAvailability = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/oxiwell');
    console.log('✅ Connected to MongoDB');

    // Find all doctors with workplaces that have availability slots
    const doctors = await User.find({
      role: 'doctor',
      status: 'active',
      'workplaces.availableSlots': { $exists: true, $not: { $size: 0 } }
    });

    console.log(`\n🔍 Found ${doctors.length} doctors with availability slots\n`);

    let totalFixed = 0;
    let totalDoctors = 0;

    for (const doctor of doctors) {
      console.log(`\n👨‍⚕️ Processing: ${doctor.firstName} ${doctor.lastName} (${doctor.email})`);
      
      let doctorUpdated = false;
      let doctorSlotsFixed = 0;

      // Process each workplace
      doctor.workplaces.forEach((workplace, workplaceIndex) => {
        console.log(`  🏥 Workplace ${workplaceIndex + 1}: ${workplace.availableSlots.length} slots`);
        
        workplace.availableSlots.forEach((slot, slotIndex) => {
          // If slot has time configured but isAvailable is false/undefined, fix it
          if (slot.startTime && slot.endTime && slot.isAvailable !== true) {
            console.log(`    🔧 Fixing slot: ${slot.day} (${slot.startTime}-${slot.endTime}) - Setting isAvailable: true`);
            slot.isAvailable = true;
            doctorUpdated = true;
            doctorSlotsFixed++;
          } else if (slot.isAvailable === true) {
            console.log(`    ✅ Already available: ${slot.day} (${slot.startTime}-${slot.endTime})`);
          }
        });
      });

      if (doctorUpdated) {
        try {
          await doctor.save();
          console.log(`  ✅ Updated ${doctorSlotsFixed} slots for ${doctor.firstName} ${doctor.lastName}`);
          totalFixed += doctorSlotsFixed;
          totalDoctors++;
        } catch (error) {
          console.log(`  ❌ Error updating ${doctor.firstName} ${doctor.lastName}:`, error.message);
        }
      } else {
        console.log(`  ℹ️  No updates needed for ${doctor.firstName} ${doctor.lastName}`);
      }
    }

    console.log('\n📊 SUMMARY:');
    console.log(`✅ Doctors processed: ${doctors.length}`);
    console.log(`🔧 Doctors updated: ${totalDoctors}`);
    console.log(`📅 Total slots fixed: ${totalFixed}`);

    if (totalFixed > 0) {
      console.log('\n🎉 SUCCESS: Doctor availability has been fixed!');
      console.log('📱 Patients should now see available time slots when booking appointments.');
    } else {
      console.log('\n✅ No fixes needed - all availability slots are already properly configured.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
};

// Run the fix script
fixDoctorAvailability();
