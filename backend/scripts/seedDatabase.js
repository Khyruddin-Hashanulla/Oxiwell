const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🍃 MongoDB connected for seeding');

    // Clear existing users (optional - remove this if you want to keep existing users)
    // await User.deleteMany({});
    // console.log('🗑️  Cleared existing users');

    // Check if demo users already exist
    const existingPatient = await User.findOne({ email: 'patient@oxiwell.com' });
    const existingDoctor = await User.findOne({ email: 'doctor@oxiwell.com' });
    const existingAdmin = await User.findOne({ email: 'admin@oxiwell.com' });

    const demoUsers = [];

    // Create demo patient if doesn't exist
    if (!existingPatient) {
      demoUsers.push({
        firstName: 'John',
        lastName: 'Patient',
        email: 'patient@oxiwell.com',
        password: await bcrypt.hash('password123', 12),
        phone: '+1234567890',
        role: 'patient',
        dateOfBirth: new Date('1990-01-15'),
        gender: 'male',
        bloodGroup: 'O+',
        address: {
          street: '123 Demo Street',
          city: 'Demo City',
          state: 'Demo State',
          zipCode: '12345',
          country: 'Demo Country'
        },
        emergencyContact: {
          name: 'Jane Patient',
          relationship: 'Spouse',
          phone: '+1234567891'
        },
        status: 'active',
        isEmailVerified: true
      });
    }

    // Create demo doctor if doesn't exist
    if (!existingDoctor) {
      demoUsers.push({
        firstName: 'Dr. Sarah',
        lastName: 'Doctor',
        email: 'doctor@oxiwell.com',
        password: await bcrypt.hash('password123', 12),
        phone: '+1234567892',
        role: 'doctor',
        dateOfBirth: new Date('1985-05-20'),
        gender: 'female',
        address: {
          street: '456 Medical Avenue',
          city: 'Healthcare City',
          state: 'Medical State',
          zipCode: '54321',
          country: 'Demo Country'
        },
        specialization: 'General Medicine',
        licenseNumber: 'MD123456',
        experience: 8,
        qualifications: [
          {
            degree: 'MBBS',
            institution: 'Medical University',
            year: 2015
          },
          {
            degree: 'MD Internal Medicine',
            institution: 'Advanced Medical College',
            year: 2018
          }
        ],
        consultationFee: 150,
        status: 'active',
        isEmailVerified: true
      });
    }

    // Create demo admin if doesn't exist
    if (!existingAdmin) {
      demoUsers.push({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@oxiwell.com',
        password: await bcrypt.hash('password123', 12),
        phone: '+1234567893',
        role: 'admin',
        dateOfBirth: new Date('1980-12-10'),
        gender: 'male',
        address: {
          street: '789 Admin Boulevard',
          city: 'Management City',
          state: 'Admin State',
          zipCode: '98765',
          country: 'Demo Country'
        },
        status: 'active',
        isEmailVerified: true
      });
    }

    // Insert demo users
    if (demoUsers.length > 0) {
      await User.insertMany(demoUsers);
      console.log(`✅ Created ${demoUsers.length} demo users successfully!`);
      
      console.log('\n📋 Demo Credentials:');
      console.log('Patient: patient@oxiwell.com / password123');
      console.log('Doctor: doctor@oxiwell.com / password123');
      console.log('Admin: admin@oxiwell.com / password123');
    } else {
      console.log('ℹ️  All demo users already exist');
    }

    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedUsers();
