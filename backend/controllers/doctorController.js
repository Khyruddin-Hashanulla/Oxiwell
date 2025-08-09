const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Hospital = require('../models/Hospital');
const mongoose = require('mongoose');
const { asyncHandler } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = { role: 'doctor', status: 'active' };

  // Filter by specialization
  if (req.query.specialization) {
    query.specialization = { $regex: req.query.specialization, $options: 'i' };
  }

  // Search by name
  if (req.query.search) {
    query.$or = [
      { firstName: { $regex: req.query.search, $options: 'i' } },
      { lastName: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const doctors = await User.find(query)
    .select('firstName lastName specialization experience consultationFee qualifications profileImage')
    .sort({ firstName: 1 })
    .limit(limit * 1)
    .skip(startIndex);

  const total = await User.countDocuments(query);

  res.status(200).json({
    status: 'success',
    count: doctors.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      doctors
    }
  });
});

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
const getDoctor = asyncHandler(async (req, res, next) => {
  console.log('🔍 getDoctor called with ID:', req.params.id)
  console.log('🔍 Request headers:', req.headers.authorization ? 'Token present' : 'No token')
  
  try {
    const doctor = await User.findOne({ 
      _id: req.params.id, 
      role: 'doctor', 
      status: 'active' 
    })
    .select('-password -__v')
    .populate({
      path: 'workplaces.hospital',
      select: 'name address phone email website type specialties services operatingHours rating status'
    });

    console.log('🔍 Database query result:', {
      found: !!doctor,
      doctorId: doctor?._id,
      role: doctor?.role,
      status: doctor?.status,
      firstName: doctor?.firstName,
      lastName: doctor?.lastName,
      workplacesCount: doctor?.workplaces?.length || 0,
      workplacesPopulated: doctor?.workplaces?.some(w => w.hospital?.name) || false
    })

    if (!doctor) {
      console.log('❌ Doctor not found in database')
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    // Normalize isAvailable values in workplaces before sending to frontend
    if (doctor.workplaces && doctor.workplaces.length > 0) {
      console.log('🔧 NORMALIZING availability slots in getDoctor...');
      console.log('🔧 Original workplaces count:', doctor.workplaces.length);
      
      doctor.workplaces = doctor.workplaces.map((workplace, index) => {
        console.log(`🔧 Processing workplace ${index + 1}:`, workplace.hospital?.name || 'Unknown');
        console.log(`🔧 Original slots count:`, workplace.availableSlots?.length || 0);
        
        const normalizedWorkplace = {
          ...workplace.toObject(),
          availableSlots: (workplace.availableSlots || []).map((slot, slotIndex) => {
            const originalAvailable = slot.isAvailable;
            const normalizedAvailable = Boolean(slot.isAvailable);
            console.log(`🔧 Slot ${slotIndex + 1} (${slot.day}): ${originalAvailable} -> ${normalizedAvailable}`);
            
            return {
              ...slot.toObject(),
              isAvailable: normalizedAvailable // Convert undefined/null to false, true stays true
            };
          })
        };
        
        console.log(`🔧 Normalized slots count:`, normalizedWorkplace.availableSlots.length);
        return normalizedWorkplace;
      });
      
      console.log('✅ Normalization complete in getDoctor');
    } else {
      console.log('⚠️ No workplaces found to normalize in getDoctor');
    }

    console.log('✅ Doctor found, sending response')
    res.status(200).json({
      status: 'success',
      data: {
        doctor
      }
    });
  } catch (error) {
    console.error('❌ Error in getDoctor:', error)
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @desc    Get doctor dashboard stats
// @route   GET /api/doctors/dashboard/stats
// @access  Private (Doctor only)
const getDoctorStats = asyncHandler(async (req, res, next) => {
  const doctorId = req.user._id;

  // Get current date ranges
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Parallel queries for better performance
  const [
    todayAppointments,
    weekAppointments,
    monthAppointments,
    totalPatients,
    pendingAppointments,
    completedAppointments,
    totalPrescriptions
  ] = await Promise.all([
    // Today's appointments
    Appointment.countDocuments({
      doctor: doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay }
    }),
    
    // This week's appointments
    Appointment.countDocuments({
      doctor: doctorId,
      appointmentDate: { $gte: startOfWeek, $lte: endOfWeek }
    }),
    
    // This month's appointments
    Appointment.countDocuments({
      doctor: doctorId,
      appointmentDate: { $gte: startOfMonth, $lte: endOfMonth }
    }),
    
    // Total unique patients
    Appointment.distinct('patient', { doctor: doctorId, status: 'completed' }),
    
    // Pending appointments
    Appointment.countDocuments({
      doctor: doctorId,
      status: 'pending'
    }),
    
    // Completed appointments
    Appointment.countDocuments({
      doctor: doctorId,
      status: 'completed'
    }),
    
    // Total prescriptions
    Prescription.countDocuments({
      doctor: doctorId
    })
  ]);

  // Get upcoming appointments for today
  const upcomingToday = await Appointment.find({
    doctor: doctorId,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['pending', 'confirmed'] }
  })
  .populate('patient', 'firstName lastName phone')
  .sort({ appointmentTime: 1 })
  .limit(5);

  // Calculate earnings (this month)
  const monthlyEarnings = await Appointment.aggregate([
    {
      $match: {
        doctor: doctorId,
        appointmentDate: { $gte: startOfMonth, $lte: endOfMonth },
        status: 'completed',
        paymentStatus: 'paid'
      }
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$consultationFee' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        today: {
          appointments: todayAppointments,
          upcoming: upcomingToday
        },
        week: {
          appointments: weekAppointments
        },
        month: {
          appointments: monthAppointments,
          earnings: monthlyEarnings[0]?.totalEarnings || 0
        },
        overall: {
          totalPatients: totalPatients.length,
          pendingAppointments,
          completedAppointments,
          totalPrescriptions
        }
      }
    }
  });
});

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private (Doctor only)
const updateDoctorProfile = asyncHandler(async (req, res, next) => {
  console.log('🔄 Doctor profile update request received')
  
  // Helper function to parse JSON fields from FormData
  const parseJSONField = (field) => {
    try {
      return field ? JSON.parse(field) : null
    } catch (error) {
      console.error(`❌ Error parsing ${field}:`, error)
      return null
    }
  }
  
  const {
    firstName,
    lastName,
    phone,
    gender,
    dateOfBirth,
    specialization,
    licenseNumber,
    medicalRegistrationNumber,
    experience,
    professionalBio,
    languages,
    servicesProvided,
    onlineConsultationAvailable,
    offlineConsultationAvailable,
    workplaces,
    emergencyContact,
    address,
    qualifications
  } = req.body

  // Parse JSON fields
  const parsedLanguages = parseJSONField(languages)
  const parsedServicesProvided = parseJSONField(servicesProvided)
  const parsedWorkplaces = parseJSONField(workplaces)
  const parsedEmergencyContact = parseJSONField(emergencyContact)
  const parsedAddress = parseJSONField(address)
  const parsedQualifications = parseJSONField(qualifications)

  console.log('🔍 Profile update request received:', {
    userId: req.user._id,
    firstName,
    lastName,
    specialization,
    workplacesCount: parsedWorkplaces?.length || 0,
    servicesCount: parsedServicesProvided?.length || 0,
    hasEmergencyContact: !!parsedEmergencyContact?.name,
    hasProfileImage: !!req.file
  })

  console.log('📋 Raw request body fields:', {
    medicalRegistrationNumber,
    professionalBio,
    servicesProvided: typeof servicesProvided,
    workplaces: typeof workplaces,
    parsedServicesProvided,
    parsedWorkplaces
  })

  // Debug availability slots in detail
  console.log('🕒 DETAILED AVAILABILITY SLOTS DEBUG:')
  if (parsedWorkplaces && Array.isArray(parsedWorkplaces)) {
    parsedWorkplaces.forEach((workplace, index) => {
      console.log(`Workplace ${index + 1} (${workplace.hospital}):`)
      console.log(`  availableSlots:`, JSON.stringify(workplace.availableSlots, null, 2))
      console.log(`  availableSlots count:`, workplace.availableSlots?.length || 0)
      if (workplace.availableSlots && workplace.availableSlots.length > 0) {
        workplace.availableSlots.forEach((slot, slotIndex) => {
          console.log(`    Slot ${slotIndex + 1}: ${slot.day} - Available: ${slot.isAvailable} (${slot.startTime}-${slot.endTime})`)
        })
      }
    })
  }

  // Find the doctor
  const doctor = await User.findById(req.user._id)
  if (!doctor) {
    return res.status(404).json({
      status: 'error',
      message: 'Doctor not found'
    })
  }

  console.log('👤 Doctor found for update:', {
    email: doctor.email,
    profileSetupCompleted: doctor.profileSetupCompleted,
    status: doctor.status
  })

  // Handle profile image upload
  let profileImagePath = doctor.profileImage || ''
  if (req.file) {
    profileImagePath = `/uploads/profiles/${req.file.filename}`
  }

  // Prepare update data
  const updateData = {
    firstName: firstName?.trim(),
    lastName: lastName?.trim(),
    phone: phone?.trim(),
    gender,
    dateOfBirth,
    specialization,
    licenseNumber: licenseNumber?.trim(),
    medicalRegistrationNumber: medicalRegistrationNumber?.trim(),
    experience: experience ? parseInt(experience) : undefined,
    professionalBio: professionalBio?.trim(),
    languages: parsedLanguages,
    servicesProvided: parsedServicesProvided,
    onlineConsultationAvailable: onlineConsultationAvailable !== undefined ? onlineConsultationAvailable : true,
    offlineConsultationAvailable: offlineConsultationAvailable !== undefined ? offlineConsultationAvailable : true,
    profileImage: profileImagePath,
    emergencyContact: parsedEmergencyContact,
    address: parsedAddress,
    qualifications: parsedQualifications,
    workplaces: []
  }

  // Process workplaces with availability slots
  if (parsedWorkplaces && Array.isArray(parsedWorkplaces)) {
    updateData.workplaces = await Promise.all(parsedWorkplaces.map(async (workplace) => {
      let hospitalId = workplace.hospital;
      
      // If hospital is a string, try to find or create the corresponding Hospital
      if (typeof workplace.hospital === 'string' && !mongoose.Types.ObjectId.isValid(workplace.hospital)) {
        console.log(`🔧 Converting string hospital reference: "${workplace.hospital}"`);
        
        // Try to find existing hospital with this name
        let hospital = await Hospital.findOne({ 
          name: { $regex: new RegExp(workplace.hospital, 'i') } 
        });
        
        if (hospital) {
          hospitalId = hospital._id;
          console.log(`✅ Found existing hospital: ${hospital.name} -> ${hospital._id}`);
        } else {
          // Auto-create hospital if it doesn't exist
          console.log(`🏥 Creating new hospital: ${workplace.hospital}`);
          try {
            hospital = await Hospital.create({
              name: workplace.hospital,
              type: workplace.type || 'hospital', // Use workplace type from frontend
              licenseNumber: `LIC-${workplace.hospital.toUpperCase().replace(/\s+/g, '')}-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
              address: workplace.address ? {
                street: workplace.address.street || 'Address to be updated',
                city: workplace.address.city || 'City to be updated',
                state: workplace.address.state || 'State to be updated',
                zipCode: workplace.address.zipCode || '000000',
                country: workplace.address.country || 'India'
              } : {
                street: 'Address to be updated',
                city: 'City to be updated',
                state: 'State to be updated',
                zipCode: '000000',
                country: 'India'
              },
              phone: '+919999999999',
              email: `info@${workplace.hospital.toLowerCase().replace(/\s+/g, '')}.com`,
              description: `${workplace.hospital} - ${workplace.type || 'Healthcare'} facility`,
              specialties: ['General Medicine'],
              services: ['General Consultation'],
              operatingHours: [
                { day: 'monday', openTime: '09:00', closeTime: '18:00', is24Hours: false },
                { day: 'tuesday', openTime: '09:00', closeTime: '18:00', is24Hours: false },
                { day: 'wednesday', openTime: '09:00', closeTime: '18:00', is24Hours: false },
                { day: 'thursday', openTime: '09:00', closeTime: '18:00', is24Hours: false },
                { day: 'friday', openTime: '09:00', closeTime: '18:00', is24Hours: false },
                { day: 'saturday', openTime: '09:00', closeTime: '17:00', is24Hours: false },
                { day: 'sunday', openTime: '10:00', closeTime: '16:00', is24Hours: false }
              ],
              rating: { average: 0, count: 0 },
              status: 'active',
              isEmergencyAvailable: false
            });
            hospitalId = hospital._id;
            console.log(`✅ Created new hospital: ${hospital.name} -> ${hospital._id}`);
          } catch (createError) {
            console.error(`❌ Failed to create hospital ${workplace.hospital}:`, createError.message);
            // Use the hospital name as string if creation fails
            hospitalId = workplace.hospital;
          }
        }
      }
      
      return {
        type: workplace.type || 'hospital',
        hospital: hospitalId,
        phone: workplace.phone || '',
        address: workplace.address ? {
          street: workplace.address.street || '',
          city: workplace.address.city || '',
          state: workplace.address.state || '',
          zipCode: workplace.address.zipCode || '',
          country: workplace.address.country || 'India'
        } : {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India'
        },
        consultationFee: workplace.consultationFee ? parseFloat(workplace.consultationFee) : 0,
        availableSlots: (workplace.availableSlots || []).map(slot => ({
          ...slot,
          // Fix: If slot has startTime and endTime, it should be available by default
          // Only set to false if explicitly set to false
          isAvailable: slot.isAvailable !== undefined ? Boolean(slot.isAvailable) : 
                      (slot.startTime && slot.endTime ? true : false)
        })),
        isPrimary: workplace.isPrimary || false
      };
    }));
    
    // Filter out null workplaces (hospitals that weren't found)
    updateData.workplaces = updateData.workplaces.filter(workplace => workplace !== null);
  }

  console.log('📝 Final update data prepared:', {
    workplacesCount: updateData.workplaces.length,
    hasProfileImage: !!updateData.profileImage,
    servicesCount: updateData.servicesProvided?.length || 0
  })

  console.log('🔍 Complete updateData object:', {
    medicalRegistrationNumber: updateData.medicalRegistrationNumber,
    professionalBio: updateData.professionalBio,
    servicesProvided: updateData.servicesProvided,
    workplaces: updateData.workplaces,
    hasAllFields: {
      medicalRegistrationNumber: !!updateData.medicalRegistrationNumber,
      professionalBio: !!updateData.professionalBio,
      servicesProvided: !!updateData.servicesProvided?.length,
      workplaces: !!updateData.workplaces?.length
    }
  })

  // Debug availability slots in detail after processing
  console.log('🕒 DETAILED AVAILABILITY SLOTS DEBUG (AFTER PROCESSING):')
  if (updateData.workplaces && Array.isArray(updateData.workplaces)) {
    updateData.workplaces.forEach((workplace, index) => {
      console.log(`Workplace ${index + 1} (${workplace.hospital}):`)
      console.log(`  availableSlots:`, JSON.stringify(workplace.availableSlots, null, 2))
      console.log(`  availableSlots count:`, workplace.availableSlots?.length || 0)
      if (workplace.availableSlots && workplace.availableSlots.length > 0) {
        workplace.availableSlots.forEach((slot, slotIndex) => {
          console.log(`    Slot ${slotIndex + 1}: ${slot.day} - Available: ${slot.isAvailable} (${slot.startTime}-${slot.endTime})`)
        })
      }
    })
  }

  try {
    console.log('💾 Attempting database update with data:', {
      userId: req.user._id,
      updateDataKeys: Object.keys(updateData),
      medicalRegistrationNumber: updateData.medicalRegistrationNumber,
      professionalBio: updateData.professionalBio,
      servicesProvidedLength: updateData.servicesProvided?.length
    })

    const updatedDoctor = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password')

    console.log('💾 Database update result:', {
      success: !!updatedDoctor,
      doctorId: updatedDoctor?._id,
      medicalRegistrationNumber: updatedDoctor?.medicalRegistrationNumber,
      professionalBio: updatedDoctor?.professionalBio,
      servicesProvidedLength: updatedDoctor?.servicesProvided?.length,
      workplacesLength: updatedDoctor?.workplaces?.length
    })

    console.log('✅ Doctor profile updated successfully')

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        doctor: updatedDoctor
      }
    })
  } catch (error) {
    console.error('❌ Error updating doctor profile:', error)
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validationErrors
      })
    }

    return res.status(500).json({
      status: 'error',
      message: 'Failed to update profile'
    })
  }
});

// @desc    Get doctor's patients
// @route   GET /api/doctors/patients
// @access  Private (Doctor only)
const getDoctorPatients = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Get unique patients who have had appointments with this doctor
  const patientIds = await Appointment.distinct('patient', {
    doctor: req.user._id,
    status: { $in: ['completed', 'confirmed'] }
  });

  let query = { _id: { $in: patientIds } };

  // Search by name
  if (req.query.search) {
    query.$or = [
      { firstName: { $regex: req.query.search, $options: 'i' } },
      { lastName: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const patients = await User.find(query)
    .select('firstName lastName email phone dateOfBirth bloodGroup')
    .sort({ firstName: 1 })
    .limit(limit * 1)
    .skip(startIndex);

  const total = await User.countDocuments(query);

  // Get last appointment for each patient
  const patientsWithLastAppointment = await Promise.all(
    patients.map(async (patient) => {
      const lastAppointment = await Appointment.findOne({
        patient: patient._id,
        doctor: req.user._id
      }).sort({ appointmentDate: -1 });

      return {
        ...patient.toObject(),
        lastAppointment: lastAppointment ? {
          date: lastAppointment.appointmentDate,
          reason: lastAppointment.reason,
          status: lastAppointment.status
        } : null
      };
    })
  );

  res.status(200).json({
    status: 'success',
    count: patients.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      patients: patientsWithLastAppointment
    }
  });
});

// @desc    Get patient history for doctor
// @route   GET /api/doctors/patients/:patientId/history
// @access  Private (Doctor only)
const getPatientHistory = asyncHandler(async (req, res, next) => {
  const { patientId } = req.params;

  // Verify that the doctor has treated this patient
  const hasAppointment = await Appointment.findOne({
    patient: patientId,
    doctor: req.user._id,
    status: { $in: ['completed', 'confirmed'] }
  });

  if (!hasAppointment) {
    return res.status(403).json({
      status: 'error',
      message: 'You are not authorized to view this patient\'s history'
    });
  }

  // Get patient details
  const patient = await User.findById(patientId)
    .select('firstName lastName email phone dateOfBirth bloodGroup allergies medicalHistory emergencyContact');

  if (!patient) {
    return res.status(404).json({
      status: 'error',
      message: 'Patient not found'
    });
  }

  // Get appointments history
  const appointments = await Appointment.find({
    patient: patientId,
    doctor: req.user._id
  }).sort({ appointmentDate: -1 });

  // Get prescriptions
  const prescriptions = await Prescription.find({
    patient: patientId,
    doctor: req.user._id
  }).sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    data: {
      patient,
      appointments,
      prescriptions
    }
  });
});

// @desc    Get doctor's schedule
// @route   GET /api/doctors/schedule
// @access  Private (Doctor only)
const getDoctorSchedule = asyncHandler(async (req, res, next) => {
  const { date } = req.query;
  
  if (!date) {
    return res.status(400).json({
      status: 'error',
      message: 'Date is required'
    });
  }

  const requestedDate = new Date(date);
  const startOfDay = new Date(requestedDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(requestedDate.setHours(23, 59, 59, 999));

  const appointments = await Appointment.find({
    doctor: req.user._id,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay }
  })
  .populate('patient', 'firstName lastName phone')
  .sort({ appointmentTime: 1 });

  res.status(200).json({
    status: 'success',
    data: {
      date,
      appointments
    }
  });
});

// @desc    Complete doctor profile setup (onboarding)
// @route   POST /api/doctors/profile-setup
// @access  Private (Doctor only)
const completeProfileSetup = asyncHandler(async (req, res, next) => {
  console.log('🔄 Starting profile setup completion...')
  
  try {
    // First, mark profile as completed BEFORE processing the update
    console.log('📝 Setting profile setup completion status...')
    await User.findByIdAndUpdate(
      req.user._id,
      { 
        $set: { 
          profileSetupCompleted: true,
          profileSetupCompletedAt: new Date()
        }
      }
    )
    console.log('✅ Profile setup completion status set to true')
    
    // Now call the existing updateDoctorProfile function to handle the actual profile update
    // This will process all the form data and update the doctor's profile
    console.log('🔄 Processing profile data update...')
    await updateDoctorProfile(req, res, next)
    
    console.log('✅ Profile setup completion process finished')
  } catch (error) {
    console.error('❌ Error in profile setup completion:', error)
    
    // If there was an error, revert the completion status
    try {
      await User.findByIdAndUpdate(
        req.user._id,
        { 
          $set: { 
            profileSetupCompleted: false,
            profileSetupCompletedAt: null
          }
        }
      )
      console.log('🔄 Reverted profile setup completion status due to error')
    } catch (revertError) {
      console.error('❌ Error reverting profile completion status:', revertError)
    }
    
    // Re-throw the error to be handled by the error middleware
    throw error
  }
});

// @desc    Check if doctor profile setup is required
// @route   GET /api/doctors/profile-setup/required
// @access  Private (Doctor only)
const checkProfileSetupRequired = asyncHandler(async (req, res, next) => {
  const doctor = await User.findById(req.user._id).select('profileSetupCompleted role status');
  
  if (!doctor || doctor.role !== 'doctor') {
    return res.status(404).json({
      status: 'error',
      message: 'Doctor not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      profileSetupRequired: !doctor.profileSetupCompleted,
      profileSetupCompleted: doctor.profileSetupCompleted
    }
  });
});

module.exports = {
  getDoctors,
  getDoctor,
  getDoctorStats,
  updateDoctorProfile,
  getDoctorPatients,
  getPatientHistory,
  getDoctorSchedule,
  completeProfileSetup,
  checkProfileSetupRequired
};
