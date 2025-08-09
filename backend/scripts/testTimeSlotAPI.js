const mongoose = require('mongoose');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Appointment = require('../models/Appointment');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const testTimeSlotAPI = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/oxiwell');
    console.log('✅ Connected to MongoDB');

    // Get the doctor and hospital IDs from our debug data
    const doctor = await User.findOne({
      email: 'business.khyruddin@gmail.com',
      role: 'doctor'
    }).populate('workplaces.hospital');

    if (!doctor) {
      console.log('❌ Doctor not found');
      return;
    }

    console.log(`\n🔍 Testing time slots for Dr. ${doctor.firstName} ${doctor.lastName}`);
    
    // Test dates that should have availability
    const testDates = [
      { date: '2025-08-11', day: 'Monday', expected: 'Available' },    // Monday
      { date: '2025-08-09', day: 'Saturday', expected: 'Available' },  // Saturday
      { date: '2025-08-10', day: 'Sunday', expected: 'Available' },    // Sunday
      { date: '2025-08-08', day: 'Friday', expected: 'Empty' },        // Friday (should be empty)
    ];

    for (const workplace of doctor.workplaces) {
      const hospitalId = workplace.hospital._id || workplace.hospital;
      const hospitalName = workplace.hospital.name || 'Unknown Hospital';
      
      console.log(`\n🏥 Testing ${hospitalName} (${hospitalId})`);
      console.log(`📅 Configured availability:`);
      
      workplace.availableSlots.forEach(slot => {
        console.log(`   ${slot.day}: ${slot.startTime}-${slot.endTime} (isAvailable: ${slot.isAvailable})`);
      });

      for (const testDate of testDates) {
        console.log(`\n📅 Testing ${testDate.day} (${testDate.date}):`);
        
        // Simulate the exact logic from getAvailableTimeSlots
        const [year, month, day] = testDate.date.split('-').map(Number);
        const requestedDate = new Date(year, month - 1, day);
        const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        
        console.log(`   📊 Date parsing: ${testDate.date} → ${dayOfWeek}`);
        
        // Find doctor's available slots for the day at this workplace
        const doctorSlots = workplace.availableSlots.filter(slot => 
          slot.day === dayOfWeek && slot.isAvailable === true
        );
        
        console.log(`   🔍 Matching slots found: ${doctorSlots.length}`);
        
        if (doctorSlots.length === 0) {
          console.log(`   ❌ No slots available for ${dayOfWeek}`);
          continue;
        }
        
        // Check for booked appointments on this date
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
        
        const bookedAppointments = await Appointment.find({
          doctor: doctor._id,
          hospital: hospitalId,
          appointmentDate: {
            $gte: startOfDay,
            $lte: endOfDay
          },
          status: { $in: ['pending', 'confirmed'] }
        }).select('appointmentTime duration');
        
        console.log(`   📋 Booked appointments: ${bookedAppointments.length}`);
        
        // Generate time slots
        const availableSlots = [];
        
        doctorSlots.forEach(slot => {
          const startTime = slot.startTime;
          const endTime = slot.endTime;
          
          console.log(`   ⏰ Processing slot: ${startTime} - ${endTime}`);
          
          const [startHour, startMinute] = startTime.split(':').map(Number);
          const [endHour, endMinute] = endTime.split(':').map(Number);
          
          const startMinutes = startHour * 60 + startMinute;
          const endMinutes = endHour * 60 + endMinute;
          
          for (let time = startMinutes; time < endMinutes; time += 30) {
            const hour = Math.floor(time / 60);
            const minute = time % 60;
            const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            
            // Check if slot is not booked
            const isBooked = bookedAppointments.some(booked => {
              const [bookedHour, bookedMinute] = booked.appointmentTime.split(':').map(Number);
              const bookedStart = bookedHour * 60 + bookedMinute;
              const bookedEnd = bookedStart + (booked.duration || 30);
              
              return time < bookedEnd && (time + 30) > bookedStart;
            });
            
            if (!isBooked) {
              availableSlots.push({
                time: timeSlot,
                available: true,
                consultationFee: workplace.consultationFee
              });
            }
          }
        });
        
        console.log(`   ✅ Generated time slots: ${availableSlots.length}`);
        if (availableSlots.length > 0) {
          console.log(`   📋 Available times: ${availableSlots.map(s => s.time).join(', ')}`);
        } else {
          console.log(`   🚨 PROBLEM: No time slots generated despite having availability!`);
        }
        
        // Compare with expected result
        const hasSlots = availableSlots.length > 0;
        const shouldHaveSlots = testDate.expected === 'Available';
        
        if (hasSlots === shouldHaveSlots) {
          console.log(`   ✅ CORRECT: ${testDate.expected} slots as expected`);
        } else {
          console.log(`   ❌ BUG FOUND: Expected ${testDate.expected} but got ${hasSlots ? 'Available' : 'Empty'} slots`);
        }
      }
      
      console.log('\n' + '='.repeat(80));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
};

// Run the test
testTimeSlotAPI();
