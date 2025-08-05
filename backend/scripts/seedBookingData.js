const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Appointment = require('../models/Appointment');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/oxiwell', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Sample hospitals data
const hospitalsData = [
  {
    name: 'Oxiwell General Hospital',
    type: 'hospital',
    phone: '+919876543210',
    email: 'info@oxiwellhospital.com',
    website: 'https://oxiwellhospital.com',
    address: {
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    },
    coordinates: {
      latitude: 19.0760,
      longitude: 72.8777
    },
    status: 'active',
    operatingHours: [
      { day: 'monday', openTime: '08:00', closeTime: '20:00', is24Hours: false },
      { day: 'tuesday', openTime: '08:00', closeTime: '20:00', is24Hours: false },
      { day: 'wednesday', openTime: '08:00', closeTime: '20:00', is24Hours: false },
      { day: 'thursday', openTime: '08:00', closeTime: '20:00', is24Hours: false },
      { day: 'friday', openTime: '08:00', closeTime: '20:00', is24Hours: false },
      { day: 'saturday', openTime: '09:00', closeTime: '18:00', is24Hours: false },
      { day: 'sunday', openTime: '10:00', closeTime: '16:00', is24Hours: false }
    ],
    services: ['Emergency Care', 'Surgery', 'Cardiology', 'Neurology', 'Orthopedics'],
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'General Medicine'],
    facilities: [
      { name: 'ICU', description: 'Intensive Care Unit', available: true },
      { name: 'Emergency Room', description: '24/7 Emergency Services', available: true },
      { name: 'Pharmacy', description: 'In-house Pharmacy', available: true },
      { name: 'Laboratory', description: 'Diagnostic Laboratory', available: true }
    ],
    rating: {
      average: 4.5,
      count: 150
    },
    licenseNumber: 'HOSP-MH-001',
    accreditation: [
      { organization: 'NABH', certificate: 'Hospital Accreditation', validUntil: new Date('2025-12-31') },
      { organization: 'JCI', certificate: 'International Accreditation', validUntil: new Date('2026-06-30') }
    ],
    emergencyContact: '+919876543211'
  },
  {
    name: 'City Heart Clinic',
    type: 'clinic',
    phone: '+919876543211',
    email: 'contact@cityheartclinic.com',
    address: {
      street: '456 Wellness Street',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India'
    },
    coordinates: {
      latitude: 28.6139,
      longitude: 77.2090
    },
    status: 'active',
    operatingHours: [
      { day: 'monday', openTime: '09:00', closeTime: '18:00', is24Hours: false },
      { day: 'tuesday', openTime: '09:00', closeTime: '18:00', is24Hours: false },
      { day: 'wednesday', openTime: '09:00', closeTime: '18:00', is24Hours: false },
      { day: 'thursday', openTime: '09:00', closeTime: '18:00', is24Hours: false },
      { day: 'friday', openTime: '09:00', closeTime: '18:00', is24Hours: false },
      { day: 'saturday', openTime: '10:00', closeTime: '16:00', is24Hours: false },
      { day: 'sunday', openTime: '10:00', closeTime: '14:00', is24Hours: false }
    ],
    services: ['Cardiology', 'Preventive Care', 'Health Checkups'],
    specialties: ['Cardiology', 'Preventive Medicine'],
    facilities: [
      { name: 'ECG', description: 'Electrocardiogram', available: true },
      { name: 'Echo', description: 'Echocardiography', available: true }
    ],
    rating: {
      average: 4.2,
      count: 85
    },
    licenseNumber: 'CLIN-DL-002',
    accreditation: [
      { organization: 'NABH', certificate: 'Clinic Accreditation', validUntil: new Date('2025-09-30') }
    ]
  },
  {
    name: 'Neuro Care Center',
    type: 'specialty-center',
    phone: '+919876543212',
    email: 'info@neurocarecentre.com',
    address: {
      street: '789 Brain Health Avenue',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    },
    coordinates: {
      latitude: 12.9716,
      longitude: 77.5946
    },
    status: 'active',
    operatingHours: [
      { day: 'monday', openTime: '08:00', closeTime: '19:00', is24Hours: false },
      { day: 'tuesday', openTime: '08:00', closeTime: '19:00', is24Hours: false },
      { day: 'wednesday', openTime: '08:00', closeTime: '19:00', is24Hours: false },
      { day: 'thursday', openTime: '08:00', closeTime: '19:00', is24Hours: false },
      { day: 'friday', openTime: '08:00', closeTime: '19:00', is24Hours: false },
      { day: 'saturday', openTime: '09:00', closeTime: '17:00', is24Hours: false },
      { day: 'sunday', openTime: '10:00', closeTime: '15:00', is24Hours: false }
    ],
    services: ['Neurology', 'Neurosurgery', 'Brain Imaging', 'Rehabilitation'],
    specialties: ['Neurology', 'Neurosurgery', 'Neuropsychology'],
    facilities: [
      { name: 'MRI', description: 'Magnetic Resonance Imaging', available: true },
      { name: 'CT Scan', description: 'Computed Tomography', available: true },
      { name: 'EEG', description: 'Electroencephalography', available: true }
    ],
    rating: {
      average: 4.7,
      count: 120
    },
    licenseNumber: 'SPEC-KA-003',
    accreditation: [
      { organization: 'NABH', certificate: 'Specialty Center Accreditation', validUntil: new Date('2025-11-15') },
      { organization: 'ISO 9001', certificate: 'Quality Management System', validUntil: new Date('2026-03-20') }
    ]
  }
];

// Sample doctors data with workplaces
const doctorsData = [
  {
    firstName: "Sarah",
    lastName: "Johnson",
    email: "dr.sarah.johnson@oxiwell.com",
    password: "password123",
    role: "doctor",
    status: "active",
    isVerified: true,
    phone: "+919876543220",
    gender: "female",
    specialization: "Cardiology",
    licenseNumber: "DOC-CARD-001",
    experience: 12,
    qualifications: [
      { degree: "MBBS", institution: "All India Institute of Medical Sciences", year: 2010 },
      { degree: "MD Cardiology", institution: "Post Graduate Institute", year: 2014 }
    ],
    consultationFee: 2500,
    rating: { average: 4.8, count: 95 },
    availableSlots: [
      { day: "monday", startTime: "09:00", endTime: "17:00" },
      { day: "tuesday", startTime: "09:00", endTime: "17:00" },
      { day: "wednesday", startTime: "09:00", endTime: "17:00" },
      { day: "thursday", startTime: "09:00", endTime: "17:00" },
      { day: "friday", startTime: "09:00", endTime: "17:00" },
      { day: "saturday", startTime: "10:00", endTime: "16:00" }
    ]
  },
  {
    firstName: "Michael",
    lastName: "Chen",
    email: "dr.michael.chen@oxiwell.com",
    password: "password123",
    role: "doctor",
    status: "active",
    isVerified: true,
    phone: "+919876543221",
    gender: "male",
    specialization: "Neurology",
    licenseNumber: "DOC-NEURO-002",
    experience: 15,
    qualifications: [
      { degree: "MBBS", institution: "Christian Medical College", year: 2007 },
      { degree: "DM Neurology", institution: "National Institute of Mental Health", year: 2012 }
    ],
    consultationFee: 3000,
    rating: { average: 4.9, count: 120 },
    availableSlots: [
      { day: "monday", startTime: "08:30", endTime: "16:30" },
      { day: "tuesday", startTime: "08:30", endTime: "16:30" },
      { day: "wednesday", startTime: "08:30", endTime: "16:30" },
      { day: "thursday", startTime: "08:30", endTime: "16:30" },
      { day: "friday", startTime: "08:30", endTime: "16:30" },
      { day: "saturday", startTime: "09:00", endTime: "14:00" }
    ]
  },
  {
    firstName: "Emily",
    lastName: "Rodriguez",
    email: "dr.emily.rodriguez@oxiwell.com",
    password: "password123",
    role: "doctor",
    status: "active",
    isVerified: true,
    phone: "+919876543222",
    gender: "female",
    specialization: "General Medicine",
    licenseNumber: "DOC-GEN-003",
    experience: 8,
    qualifications: [
      { degree: "MBBS", institution: "King George Medical University", year: 2014 },
      { degree: "MD Internal Medicine", institution: "Sanjay Gandhi Institute", year: 2018 }
    ],
    consultationFee: 1500,
    rating: { average: 4.6, count: 78 },
    availableSlots: [
      { day: "monday", startTime: "10:00", endTime: "18:00" },
      { day: "tuesday", startTime: "10:00", endTime: "18:00" },
      { day: "wednesday", startTime: "10:00", endTime: "18:00" },
      { day: "thursday", startTime: "10:00", endTime: "18:00" },
      { day: "friday", startTime: "10:00", endTime: "18:00" },
      { day: "saturday", startTime: "11:00", endTime: "17:00" }
    ]
  },
  {
    firstName: "David",
    lastName: "Patel",
    email: "dr.david.patel@oxiwell.com",
    password: "password123",
    role: "doctor",
    status: "active",
    isVerified: true,
    phone: "+919876543223",
    gender: "male",
    specialization: "Orthopedics",
    licenseNumber: "DOC-ORTHO-004",
    experience: 10,
    qualifications: [
      { degree: "MBBS", institution: "Grant Medical College", year: 2012 },
      { degree: "MS Orthopedics", institution: "Seth GS Medical College", year: 2016 }
    ],
    consultationFee: 2000,
    rating: { average: 4.7, count: 65 },
    availableSlots: [
      { day: "monday", startTime: "09:30", endTime: "17:30" },
      { day: "tuesday", startTime: "09:30", endTime: "17:30" },
      { day: "wednesday", startTime: "09:30", endTime: "17:30" },
      { day: "thursday", startTime: "09:30", endTime: "17:30" },
      { day: "friday", startTime: "09:30", endTime: "17:30" },
      { day: "saturday", startTime: "10:30", endTime: "16:30" }
    ]
  }
];

// Function to seed hospitals
const seedHospitals = async () => {
  try {
    console.log('🏥 Seeding hospitals...');
    
    // Clear existing hospitals
    await Hospital.deleteMany({});
    
    // Insert new hospitals
    const hospitals = await Hospital.insertMany(hospitalsData);
    console.log(`✅ Created ${hospitals.length} hospitals`);
    
    return hospitals;
  } catch (error) {
    console.error('❌ Error seeding hospitals:', error.message);
    throw error;
  }
};

// Function to seed doctors with workplaces
const seedDoctors = async (hospitals) => {
  try {
    console.log('👨‍⚕️ Seeding doctors...');
    
    // Clear existing doctors
    await User.deleteMany({ role: 'doctor' });
    
    const doctors = [];
    
    for (let i = 0; i < doctorsData.length; i++) {
      const doctorData = { ...doctorsData[i] };
      
      // Note: Password hashing is handled by User model pre-save middleware
      // No need to hash manually here
      
      // Assign workplaces based on specialization
      doctorData.workplaces = [];
      
      if (doctorData.specialization === 'Cardiology') {
        // Cardiologist works at General Hospital and Heart Clinic
        doctorData.workplaces.push({
          hospital: hospitals[0]._id, // Oxiwell General Hospital
          availableSlots: doctorData.availableSlots,
          consultationFee: 2500,
          isPrimary: true
        });
        doctorData.workplaces.push({
          hospital: hospitals[1]._id, // City Heart Clinic
          availableSlots: [
            { day: "tuesday", startTime: "14:00", endTime: "18:00" },
            { day: "thursday", startTime: "14:00", endTime: "18:00" },
            { day: "saturday", startTime: "10:00", endTime: "16:00" }
          ],
          consultationFee: 3000,
          isPrimary: false
        });
      } else if (doctorData.specialization === 'Neurology') {
        // Neurologist works at General Hospital and Neuro Care Center
        doctorData.workplaces.push({
          hospital: hospitals[0]._id, // Oxiwell General Hospital
          availableSlots: [
            { day: "monday", startTime: "09:00", endTime: "13:00" },
            { day: "wednesday", startTime: "09:00", endTime: "13:00" },
            { day: "friday", startTime: "09:00", endTime: "13:00" }
          ],
          consultationFee: 3000,
          isPrimary: false
        });
        doctorData.workplaces.push({
          hospital: hospitals[2]._id, // Neuro Care Center
          availableSlots: doctorData.availableSlots,
          consultationFee: 3500,
          isPrimary: true
        });
      } else {
        // General Medicine and Orthopedics work primarily at General Hospital
        doctorData.workplaces.push({
          hospital: hospitals[0]._id, // Oxiwell General Hospital
          availableSlots: doctorData.availableSlots,
          consultationFee: doctorData.consultationFee,
          isPrimary: true
        });
      }
      
      const doctor = new User(doctorData);
      await doctor.save();
      doctors.push(doctor);
    }
    
    console.log(`✅ Created ${doctors.length} doctors with workplaces`);
    return doctors;
  } catch (error) {
    console.error('❌ Error seeding doctors:', error.message);
    throw error;
  }
};

// Function to create sample patient
const seedPatient = async () => {
  try {
    console.log('👤 Creating sample patient...');
    
    // Check if patient already exists
    let patient = await User.findOne({ email: 'patient@oxiwell.com' });
    
    if (!patient) {
      const patientData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'patient@oxiwell.com',
        password: 'password123', // User model pre-save middleware will hash this
        role: 'patient',
        status: 'active',
        isVerified: true,
        phone: '+919876543230',
        dateOfBirth: new Date('1990-05-15'),
        gender: 'male',
        bloodGroup: 'O+',
        address: {
          street: '123 Patient Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400003',
          country: 'India'
        }
      };
      
      patient = new User(patientData);
      await patient.save();
      console.log('✅ Created sample patient');
    } else {
      console.log('✅ Sample patient already exists');
    }
    
    return patient;
  } catch (error) {
    console.error('❌ Error creating sample patient:', error.message);
    throw error;
  }
};

// Main seeding function
const seedBookingData = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Starting booking data seeding...');
    
    // Clean existing data
    console.log('🧹 Cleaning existing data...');
    await User.deleteMany({ email: { $in: [
      'patient@oxiwell.com',
      'dr.sarah.johnson@oxiwell.com',
      'dr.michael.chen@oxiwell.com',
      'dr.emily.rodriguez@oxiwell.com',
      'dr.david.patel@oxiwell.com'
    ]}});
    await Hospital.deleteMany({ name: { $in: [
      'Oxiwell General Hospital',
      'City Heart Clinic',
      'Neuro Care Center'
    ]}});
    console.log('✅ Existing data cleaned');
    
    // Seed hospitals
    const hospitals = await seedHospitals();
    
    // Seed doctors with workplaces
    const doctors = await seedDoctors(hospitals);
    
    // Create sample patient
    const patient = await seedPatient();
    
    console.log('\n🎉 Booking data seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • ${hospitals.length} hospitals created`);
    console.log(`   • ${doctors.length} doctors created with workplaces`);
    console.log(`   • 1 sample patient created`);
    
    console.log('\n🔑 Test Credentials:');
    console.log('   Patient: patient@oxiwell.com / password123');
    console.log('   Doctors:');
    doctors.forEach(doctor => {
      console.log(`     ${doctor.email} / password123 (${doctor.specialization})`);
    });
    
    console.log('\n🏥 Hospitals:');
    hospitals.forEach(hospital => {
      console.log(`   • ${hospital.name} (${hospital.address.city})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedBookingData();
}

module.exports = { seedBookingData };
