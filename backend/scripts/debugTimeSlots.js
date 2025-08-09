const mongoose = require('mongoose');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const debugTimeSlots = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/oxiwell');
    console.log('✅ Connected to MongoDB');

    // Find all doctors with workplaces
    const doctors = await User.find({
      role: 'doctor',
      status: 'active',
      workplaces: { $exists: true, $not: { $size: 0 } }
    }).populate('workplaces.hospital', 'name');

    console.log(`\n🔍 Found ${doctors.length} active doctors with workplaces\n`);

    for (const doctor of doctors) {
      console.log(`\n👨‍⚕️ Doctor: ${doctor.firstName} ${doctor.lastName}`);
      console.log(`📧 Email: ${doctor.email}`);
      console.log(`🏥 Workplaces: ${doctor.workplaces.length}`);

      doctor.workplaces.forEach((workplace, index) => {
        console.log(`\n  Workplace ${index + 1}:`);
        console.log(`  🏥 Hospital: ${workplace.hospital?.name || 'Unknown'}`);
        console.log(`  📞 Phone: ${workplace.phone}`);
        console.log(`  💰 Fee: ₹${workplace.consultationFee}`);
        console.log(`  📅 Available Slots: ${workplace.availableSlots.length}`);

        if (workplace.availableSlots.length === 0) {
          console.log(`  ❌ NO AVAILABILITY SLOTS SET!`);
        } else {
          workplace.availableSlots.forEach((slot, slotIndex) => {
            const status = slot.isAvailable ? '✅ AVAILABLE' : '❌ NOT AVAILABLE';
            console.log(`    Slot ${slotIndex + 1}: ${slot.day} (${slot.startTime}-${slot.endTime}) - ${status}`);
          });

          // Check if any slots are actually available
          const availableSlots = workplace.availableSlots.filter(slot => slot.isAvailable === true);
          const unavailableSlots = workplace.availableSlots.filter(slot => slot.isAvailable !== true);
          
          console.log(`  ✅ Available days: ${availableSlots.length}`);
          console.log(`  ❌ Unavailable days: ${unavailableSlots.length}`);
          
          if (availableSlots.length === 0) {
            console.log(`  🚨 PROBLEM: All slots have isAvailable = false!`);
          }
        }
      });

      console.log('\n' + '='.repeat(60));
    }

    // Summary statistics
    let totalWorkplaces = 0;
    let workplacesWithNoSlots = 0;
    let workplacesWithAllUnavailable = 0;
    let workplacesWithSomeAvailable = 0;

    doctors.forEach(doctor => {
      doctor.workplaces.forEach(workplace => {
        totalWorkplaces++;
        
        if (workplace.availableSlots.length === 0) {
          workplacesWithNoSlots++;
        } else {
          const availableSlots = workplace.availableSlots.filter(slot => slot.isAvailable === true);
          if (availableSlots.length === 0) {
            workplacesWithAllUnavailable++;
          } else {
            workplacesWithSomeAvailable++;
          }
        }
      });
    });

    console.log('\n📊 SUMMARY STATISTICS:');
    console.log(`Total workplaces: ${totalWorkplaces}`);
    console.log(`Workplaces with no slots: ${workplacesWithNoSlots}`);
    console.log(`Workplaces with all unavailable slots: ${workplacesWithAllUnavailable}`);
    console.log(`Workplaces with some available slots: ${workplacesWithSomeAvailable}`);

    if (workplacesWithNoSlots > 0 || workplacesWithAllUnavailable > 0) {
      console.log('\n🚨 ISSUES FOUND:');
      if (workplacesWithNoSlots > 0) {
        console.log(`- ${workplacesWithNoSlots} workplaces have no availability slots configured`);
      }
      if (workplacesWithAllUnavailable > 0) {
        console.log(`- ${workplacesWithAllUnavailable} workplaces have all slots marked as unavailable (isAvailable: false)`);
      }
      console.log('\n💡 SOLUTION: Update doctor profiles to set isAvailable: true for working days');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
};

// Run the debug script
debugTimeSlots();
