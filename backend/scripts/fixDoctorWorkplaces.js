const mongoose = require('mongoose');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
require('dotenv').config();

const fixDoctorWorkplaces = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all doctors with workplaces
    const doctors = await User.find({
      role: 'doctor',
      workplaces: { $exists: true, $not: { $size: 0 } }
    });

    console.log(`📋 Found ${doctors.length} doctors with workplaces`);

    for (const doctor of doctors) {
      console.log(`\n👨‍⚕️ Processing Dr. ${doctor.firstName} ${doctor.lastName}`);
      console.log(`   📋 Current workplaces:`, JSON.stringify(doctor.workplaces, null, 2));
      
      const updatedWorkplaces = [];
      
      for (const workplace of doctor.workplaces) {
        // Check if hospital is already an ObjectId
        if (mongoose.Types.ObjectId.isValid(workplace.hospital) && 
            workplace.hospital.toString().length === 24) {
          console.log(`   ✅ Hospital already has ObjectId: ${workplace.hospital}`);
          updatedWorkplaces.push(workplace);
          continue;
        }

        // Hospital is a string, need to create/find Hospital document
        const hospitalName = workplace.hospital;
        console.log(`   🏥 Processing hospital: "${hospitalName}"`);

        // Handle undefined or empty hospital names
        if (!hospitalName || hospitalName === 'undefined' || hospitalName.trim() === '') {
          console.log(`   ⚠️ Skipping invalid hospital name: "${hospitalName}"`);
          console.log(`   🔧 Creating default hospital for Dr. ${doctor.firstName} ${doctor.lastName}`);
          
          // Create a default hospital name based on doctor's name
          const defaultHospitalName = `${doctor.firstName} ${doctor.lastName} Clinic`;
          
          // Check if default hospital already exists
          let hospital = await Hospital.findOne({ name: defaultHospitalName });
          
          if (!hospital) {
            // Create new Hospital document with default data
            hospital = new Hospital({
              name: defaultHospitalName,
              type: 'clinic',
              phone: '+911234567890', // Default phone
              licenseNumber: `LIC${Date.now()}`, // Generate unique license number
              address: {
                street: 'Address to be updated',
                city: 'City to be updated',
                state: 'State to be updated',
                zipCode: '000000',
                country: 'India'
              },
              operatingHours: [
                { day: 'monday', openTime: '09:00', closeTime: '18:00', is24Hours: false },
                { day: 'tuesday', openTime: '09:00', closeTime: '18:00', is24Hours: false },
                { day: 'wednesday', openTime: '09:00', closeTime: '18:00', is24Hours: false },
                { day: 'thursday', openTime: '09:00', closeTime: '18:00', is24Hours: false },
                { day: 'friday', openTime: '09:00', closeTime: '18:00', is24Hours: false },
                { day: 'saturday', openTime: '09:00', closeTime: '14:00', is24Hours: false }
              ],
              services: ['General Consultation'],
              rating: {
                average: 4.0,
                count: 1
              }
            });
            
            await hospital.save();
            console.log(`   ✅ Created default hospital: ${hospital.name} (ID: ${hospital._id})`);
          } else {
            console.log(`   ✅ Found existing default hospital: ${hospital.name} (ID: ${hospital._id})`);
          }

          // Update workplace to use Hospital ObjectId
          updatedWorkplaces.push({
            hospital: hospital._id,
            availableSlots: workplace.availableSlots || [],
            consultationFee: workplace.consultationFee || 500,
            isPrimary: workplace.isPrimary || true
          });
          continue;
        }

        // Check if Hospital document already exists
        let hospital = await Hospital.findOne({ name: hospitalName });
        
        if (!hospital) {
          // Create new Hospital document with default data
          hospital = new Hospital({
            name: hospitalName,
            type: 'hospital',
            phone: '+911234567890', // Default phone
            licenseNumber: `LIC${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique license number
            address: {
              street: 'Address to be updated',
              city: 'City to be updated',
              state: 'State to be updated',
              zipCode: '000000',
              country: 'India'
            },
            operatingHours: [
              { day: 'monday', openTime: '09:00', closeTime: '18:00', is24Hours: false },
              { day: 'tuesday', openTime: '09:00', closeTime: '18:00', is24Hours: false },
              { day: 'wednesday', openTime: '09:00', closeTime: '18:00', is24Hours: false },
              { day: 'thursday', openTime: '09:00', closeTime: '18:00', is24Hours: false },
              { day: 'friday', openTime: '09:00', closeTime: '18:00', is24Hours: false },
              { day: 'saturday', openTime: '09:00', closeTime: '14:00', is24Hours: false }
            ],
            services: ['General Consultation'],
            rating: {
              average: 4.0,
              count: 1
            }
          });
          
          await hospital.save();
          console.log(`   ✅ Created new hospital: ${hospital.name} (ID: ${hospital._id})`);
        } else {
          console.log(`   ✅ Found existing hospital: ${hospital.name} (ID: ${hospital._id})`);
        }

        // Update workplace to use Hospital ObjectId
        updatedWorkplaces.push({
          hospital: hospital._id,
          availableSlots: workplace.availableSlots || [],
          consultationFee: workplace.consultationFee || 500,
          isPrimary: workplace.isPrimary || false
        });
      }

      // Update doctor with new workplace structure
      await User.findByIdAndUpdate(doctor._id, {
        workplaces: updatedWorkplaces
      });

      console.log(`   ✅ Updated ${doctor.firstName} ${doctor.lastName} with ${updatedWorkplaces.length} workplaces`);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('📝 Summary:');
    console.log(`   - Processed ${doctors.length} doctors`);
    
    const hospitalCount = await Hospital.countDocuments();
    console.log(`   - Total hospitals in database: ${hospitalCount}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
};

// Run the migration
fixDoctorWorkplaces();
