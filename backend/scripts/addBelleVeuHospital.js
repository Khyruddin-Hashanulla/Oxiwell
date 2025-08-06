const mongoose = require('mongoose');
const Hospital = require('../models/Hospital');
require('dotenv').config();

const addBelleVeuHospital = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if Belle Veu hospital already exists
    const existingHospital = await Hospital.findOne({ 
      name: { $regex: /belle veu/i } 
    });

    if (existingHospital) {
      console.log('🏥 Belle Veu hospital already exists:', existingHospital.name);
      return;
    }

    // Create Belle Veu hospital
    const belleVeuHospital = await Hospital.create({
      name: 'Belle Veu Hospital',
      type: 'hospital',
      licenseNumber: 'LIC-BELLEVEU-2024-002',
      address: {
        street: '456 Medical Center Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400002',
        country: 'India'
      },
      phone: '+919876543211',
      email: 'info@belleveu.com',
      website: 'https://belleveu.com',
      description: 'Premium healthcare facility with state-of-the-art medical services',
      specialties: [
        'Cardiology',
        'General Medicine',
        'Orthopedics',
        'Gynecology'
      ],
      services: [
        'Emergency Services',
        'General Consultation',
        'Specialist Care',
        'Diagnostic Tests'
      ],
      operatingHours: [
        { day: 'monday', openTime: '08:00', closeTime: '20:00', is24Hours: false },
        { day: 'tuesday', openTime: '08:00', closeTime: '20:00', is24Hours: false },
        { day: 'wednesday', openTime: '08:00', closeTime: '20:00', is24Hours: false },
        { day: 'thursday', openTime: '08:00', closeTime: '20:00', is24Hours: false },
        { day: 'friday', openTime: '08:00', closeTime: '20:00', is24Hours: false },
        { day: 'saturday', openTime: '08:00', closeTime: '18:00', is24Hours: false },
        { day: 'sunday', openTime: '09:00', closeTime: '17:00', is24Hours: false }
      ],
      rating: {
        average: 4.5,
        count: 89
      },
      status: 'active',
      isEmergencyAvailable: true,
      coordinates: {
        latitude: 19.0760,
        longitude: 72.8777
      }
    });

    console.log('🎉 Belle Veu hospital created successfully!');
    console.log('Hospital ID:', belleVeuHospital._id);
    console.log('Hospital Name:', belleVeuHospital.name);
    console.log('Address:', belleVeuHospital.address.street, belleVeuHospital.address.city);

  } catch (error) {
    console.error('❌ Error creating Belle Veu hospital:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
};

// Run the script
addBelleVeuHospital();
