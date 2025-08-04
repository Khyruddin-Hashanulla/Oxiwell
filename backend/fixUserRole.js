const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const fixUserRole = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Fix both email accounts
    const emails = ['khyruddin.official@gmail.com', 'khyruddinofficial@gmail.com'];
    
    for (const email of emails) {
      console.log(`\n🔍 Processing: ${email}`);
      const user = await User.findOne({ email });

      if (!user) {
        console.log(`❌ User not found with email: ${email}`);
        continue;
      }

      console.log('👤 User found:');
      console.log('   Name:', user.firstName, user.lastName);
      console.log('   Email:', user.email);
      console.log('   Current Role:', user.role);
      console.log('   Current Status:', user.status);
      console.log('   Current isVerified:', user.isVerified);

      // Update user role to admin and set as verified
      user.role = 'admin';
      user.status = 'active';
      user.isVerified = true;
      await user.save();

      console.log('✅ User role updated successfully!');
      console.log('   New Role:', user.role);
      console.log('   New Status:', user.status);
      console.log('   New isVerified:', user.isVerified);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
fixUserRole();
