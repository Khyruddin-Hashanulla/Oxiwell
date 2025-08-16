const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/oxiwell', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create admin user
const createAdmin = async () => {
  try {
    console.log('🔧 Creating admin user...');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'khyruddin.official@gmail.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email: khyruddin.official@gmail.com');
      console.log('🔑 Password: K.h@19122002');
      process.exit(0);
    }

    // Create new admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'khyruddin.official@gmail.com',
      password: 'K.h@19122002', // Will be hashed by User model pre-save middleware
      role: 'admin',
      phone: '+917557874889',
      dateOfBirth: new Date('2002-12-19'),
      gender: 'male',
      address: {
        street: 'Kolkata',
        city: 'Kolkata',
        state: 'West Bengal',
        zipCode: '700017',
        country: 'INDIA'
      },
      // Admin-specific required fields
      employeeId: 'ADM001',
      position: 'System Administrator',
      department: 'IT Administration',
      status: 'active',
      isVerified: true
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: khyruddin.official@gmail.com');
    console.log('🔑 Password: K.h@19122002');
    console.log('🎯 Role: admin');
    console.log('');
    console.log('You can now login with these credentials and access the admin dashboard.');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await createAdmin();
};

run();
