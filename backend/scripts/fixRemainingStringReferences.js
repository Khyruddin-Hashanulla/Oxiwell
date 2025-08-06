const mongoose = require('mongoose');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
require('dotenv').config();

const fixRemainingStringReferences = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find Dr. Saheb Ali Mistry
    const doctor = await User.findOne({
      firstName: 'Saheb',
      lastName: 'Ali Mistry',
      role: 'doctor'
    });

    if (!doctor) {
      console.log('❌ Dr. Saheb Ali Mistry not found');
      return;
    }

    console.log(`👨‍⚕️ Found Dr. ${doctor.firstName} ${doctor.lastName}`);
    console.log('🏥 Current workplaces:', JSON.stringify(doctor.workplaces, null, 2));

    let needsUpdate = false;
    const updatedWorkplaces = [];

    for (const workplace of doctor.workplaces) {
      if (typeof workplace.hospital === 'string') {
        console.log(`🔧 Found string hospital reference: "${workplace.hospital}"`);
        needsUpdate = true;

        // Try to find existing hospital with this name
        let hospital = await Hospital.findOne({ 
          name: { $regex: new RegExp(workplace.hospital, 'i') } 
        });

        if (!hospital) {
          // Create new hospital if not found
          console.log(`🏗️ Creating new hospital: ${workplace.hospital}`);
          hospital = new Hospital({
            name: workplace.hospital,
            type: 'hospital',
            address: {
              street: 'Address to be updated',
              city: 'City to be updated',
              state: 'State to be updated',
              zipCode: '000000',
              country: 'India'
            },
            phone: '+91-XXX-XXX-XXXX',
            email: 'info@hospital.com',
            licenseNumber: `LIC-${Date.now()}`,
            operatingHours: [
              { day: 'monday', openTime: '09:00', closeTime: '17:00', is24Hours: false },
              { day: 'tuesday', openTime: '09:00', closeTime: '17:00', is24Hours: false },
              { day: 'wednesday', openTime: '09:00', closeTime: '17:00', is24Hours: false },
              { day: 'thursday', openTime: '09:00', closeTime: '17:00', is24Hours: false },
              { day: 'friday', openTime: '09:00', closeTime: '17:00', is24Hours: false },
              { day: 'saturday', openTime: '09:00', closeTime: '14:00', is24Hours: false }
            ]
          });
          await hospital.save();
        }

        // Update workplace with ObjectId reference
        updatedWorkplaces.push({
          hospital: hospital._id,
          consultationFee: workplace.consultationFee,
          availableSlots: workplace.availableSlots
        });

        console.log(`✅ Converted "${workplace.hospital}" to ObjectId: ${hospital._id}`);
      } else {
        // Keep existing ObjectId reference
        updatedWorkplaces.push(workplace);
      }
    }

    if (needsUpdate) {
      // Update doctor with fixed workplace references
      await User.findByIdAndUpdate(doctor._id, {
        $set: { workplaces: updatedWorkplaces }
      });

      console.log('✅ Doctor workplaces updated successfully!');
      console.log('🏥 Updated workplaces:', JSON.stringify(updatedWorkplaces, null, 2));
    } else {
      console.log('✅ No string references found - all workplaces already use ObjectId references');
    }

  } catch (error) {
    console.error('❌ Error fixing string references:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
};

fixRemainingStringReferences();
