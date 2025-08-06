const mongoose = require('mongoose');
const Hospital = require('../models/Hospital');
require('dotenv').config();

const addApoloHospital = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if Appolo hospital already exists
    const existingHospital = await Hospital.findOne({ 
      name: { $regex: /appolo/i } 
    });

    if (existingHospital) {
      console.log('🏥 Appolo hospital already exists:', existingHospital.name);
      return;
    }

    // Create Appolo hospital
    const apoloHospital = await Hospital.create({
      name: 'Appolo Hospital',
      type: 'hospital', 
      licenseNumber: 'LIC-APOLO-2024-001', 
      address: {
        street: '123 Healthcare Avenue',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      },
      phone: '+919876543210',
      email: 'info@apolohospital.com',
      website: 'https://apolohospital.com',
      description: 'Leading multi-specialty hospital providing comprehensive healthcare services',
      specialties: [
        'Cardiology',
        'General Medicine',
        'Emergency Care',
        'Diagnostic Services'
      ],
      services: [
        'Emergency Services',
        'General Consultation',
        'Diagnostic Tests',
        'Pharmacy'
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
        average: 4.2,
        count: 156
      },
      status: 'active',
      isEmergencyAvailable: true,
      coordinates: {
        latitude: 19.0760,
        longitude: 72.8777
      }
    });

    console.log('🎉 Appolo hospital created successfully!');
    console.log('Hospital ID:', apoloHospital._id);
    console.log('Hospital Name:', apoloHospital.name);
    console.log('Address:', apoloHospital.address.street, apoloHospital.address.city);

  } catch (error) {
    console.error('❌ Error creating Appolo hospital:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
};

// Run the script
addApoloHospital();
