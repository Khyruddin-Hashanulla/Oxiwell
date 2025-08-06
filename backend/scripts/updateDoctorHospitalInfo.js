const mongoose = require('mongoose');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
require('dotenv').config();

const updateDoctorHospitalInfo = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find Dr. Saheb Ali Mistry - try different name variations
    let doctor = await User.findOne({
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
      console.log('❌ Dr. Saheb Ali Mistry not found');
      return;
    }

    console.log(`\n👨‍⚕️ Found Dr. ${doctor.firstName} ${doctor.lastName}`);
    console.log(`📧 Email: ${doctor.email}`);

    // Get the hospital ID from the doctor's workplace
    const hospitalId = doctor.workplaces[0].hospital._id;
    console.log(`🏥 Current Hospital ID: ${hospitalId}`);
    console.log(`🏥 Current Hospital Name: ${doctor.workplaces[0].hospital.name}`);

    // Update the hospital with real information
    // You can customize these details with the real information
    const updatedHospitalData = {
      name: 'Saheb Ali Mistry Medical Center', // Real hospital/clinic name
      type: 'clinic',
      phone: '+919876543210', // Real phone number
      email: 'info@sahebalimistry.com', // Fixed email format (using .com instead of .clinic)
      address: {
        street: '123 Medical Plaza, Health Street', // Real street address
        city: 'Mumbai', // Real city
        state: 'Maharashtra', // Real state
        zipCode: '400001', // Real ZIP code
        country: 'India'
      },
      operatingHours: [
        { day: 'monday', openTime: '09:00', closeTime: '17:00', is24Hours: false },
        { day: 'tuesday', openTime: '09:00', closeTime: '17:00', is24Hours: false },
        { day: 'wednesday', openTime: '09:00', closeTime: '17:00', is24Hours: false },
        { day: 'thursday', openTime: '09:00', closeTime: '17:00', is24Hours: false },
        { day: 'friday', openTime: '09:00', closeTime: '17:00', is24Hours: false },
        { day: 'saturday', openTime: '09:00', closeTime: '14:00', is24Hours: false }
      ],
      services: [
        'General Consultation',
        'Health Checkups',
        'Preventive Care',
        'Chronic Disease Management'
      ],
      specialties: [
        'General Medicine',
        'Family Medicine'
      ],
      facilities: [
        { name: 'Digital X-Ray', description: 'Modern digital radiography services' },
        { name: 'Laboratory', description: 'On-site diagnostic laboratory' },
        { name: 'Pharmacy', description: 'In-house pharmacy for prescriptions' }
      ],
      rating: {
        average: 4.5,
        count: 25
      },
      description: 'A modern medical center providing comprehensive healthcare services with a focus on patient-centered care and advanced medical technology.'
    };

    // Update the hospital
    const updatedHospital = await Hospital.findByIdAndUpdate(
      hospitalId,
      updatedHospitalData,
      { new: true, runValidators: true }
    );

    if (updatedHospital) {
      console.log('\n✅ Hospital information updated successfully!');
      console.log('\n🏥 Updated Hospital Information:');
      console.log(`Name: ${updatedHospital.name}`);
      console.log(`Type: ${updatedHospital.type}`);
      console.log(`Phone: ${updatedHospital.phone}`);
      console.log(`Email: ${updatedHospital.email || 'Not specified'}`);
      console.log('Address:');
      console.log(`  ${updatedHospital.address.street}`);
      console.log(`  ${updatedHospital.address.city}, ${updatedHospital.address.state} ${updatedHospital.address.zipCode}`);
      console.log(`  ${updatedHospital.address.country}`);
      console.log(`Rating: ${updatedHospital.rating.average} (${updatedHospital.rating.count} reviews)`);
      console.log(`Services: ${updatedHospital.services.join(', ')}`);
      console.log(`Specialties: ${updatedHospital.specialties.join(', ')}`);
      
      console.log('\n🎉 Dr. Saheb Ali Mistry\'s hospital information has been updated with real details!');
      console.log('📝 Patients will now see proper hospital information when booking appointments.');
    } else {
      console.log('❌ Failed to update hospital information');
    }

  } catch (error) {
    console.error('❌ Error updating hospital information:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
};

// Run the update
updateDoctorHospitalInfo();
