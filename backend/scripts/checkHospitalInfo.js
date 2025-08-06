const mongoose = require('mongoose');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
require('dotenv').config();

const checkHospitalInfo = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // First, let's see all doctors to find the correct name format
    console.log('\n📋 All doctors in database:');
    const allDoctors = await User.find({ role: 'doctor' }).select('firstName lastName email');
    allDoctors.forEach((doc, index) => {
      console.log(`${index + 1}. Dr. ${doc.firstName} ${doc.lastName} (${doc.email})`);
    });

    // Try different variations to find Dr. Saheb Ali Mistry
    let doctor = null;
    
    // Try exact match first
    doctor = await User.findOne({
      firstName: 'Saheb Ali',
      lastName: 'Mistry',
      role: 'doctor'
    }).populate('workplaces.hospital');

    // If not found, try with different name combinations
    if (!doctor) {
      doctor = await User.findOne({
        firstName: 'Saheb',
        lastName: 'Ali Mistry',
        role: 'doctor'
      }).populate('workplaces.hospital');
    }

    if (!doctor) {
      doctor = await User.findOne({
        firstName: 'Saheb',
        lastName: 'Mistry',
        role: 'doctor'
      }).populate('workplaces.hospital');
    }

    // Try searching by partial name match
    if (!doctor) {
      doctor = await User.findOne({
        $and: [
          { role: 'doctor' },
          {
            $or: [
              { firstName: { $regex: 'Saheb', $options: 'i' } },
              { lastName: { $regex: 'Mistry', $options: 'i' } },
              { firstName: { $regex: 'Ali', $options: 'i' } }
            ]
          }
        ]
      }).populate('workplaces.hospital');
    }

    if (!doctor) {
      console.log('❌ Dr. Saheb Ali Mistry not found with any name variation');
      return;
    }

    console.log(`\n👨‍⚕️ Found: Dr. ${doctor.firstName} ${doctor.lastName}`);
    console.log(`📧 Email: ${doctor.email}`);
    console.log(`🏥 Specialization: ${doctor.specialization}`);
    console.log(`💼 Experience: ${doctor.experience} years`);
    console.log(`💰 Base Consultation Fee: ₹${doctor.consultationFee}`);

    console.log('\n🏥 Hospital/Workplace Information:');
    
    for (let i = 0; i < doctor.workplaces.length; i++) {
      const workplace = doctor.workplaces[i];
      console.log(`\n--- Workplace ${i + 1} ---`);
      console.log(`Hospital ID: ${workplace.hospital._id}`);
      console.log(`Hospital Name: ${workplace.hospital.name}`);
      console.log(`Hospital Type: ${workplace.hospital.type}`);
      console.log(`Phone: ${workplace.hospital.phone}`);
      console.log(`License Number: ${workplace.hospital.licenseNumber}`);
      
      console.log('Address:');
      console.log(`  Street: ${workplace.hospital.address.street}`);
      console.log(`  City: ${workplace.hospital.address.city}`);
      console.log(`  State: ${workplace.hospital.address.state}`);
      console.log(`  ZIP: ${workplace.hospital.address.zipCode}`);
      console.log(`  Country: ${workplace.hospital.address.country}`);
      
      console.log(`Consultation Fee at this location: ₹${workplace.consultationFee}`);
      console.log(`Primary workplace: ${workplace.isPrimary}`);
      
      console.log('Available Slots:');
      workplace.availableSlots.forEach(slot => {
        console.log(`  ${slot.day}: ${slot.startTime} - ${slot.endTime}`);
      });
      
      if (workplace.hospital.rating) {
        console.log(`Rating: ${workplace.hospital.rating.average} (${workplace.hospital.rating.count} reviews)`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
};

// Run the checker
checkHospitalInfo();
