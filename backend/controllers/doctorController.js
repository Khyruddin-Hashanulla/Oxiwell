const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
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
    }).select('-password -__v'); // Exclude only password and version, include all other fields

    console.log('🔍 Database query result:', {
      found: !!doctor,
      doctorId: doctor?._id,
      role: doctor?.role,
      status: doctor?.status,
      firstName: doctor?.firstName,
      lastName: doctor?.lastName
    })

    if (!doctor) {
      console.log('❌ Doctor not found in database')
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
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
    updateData.workplaces = parsedWorkplaces.map(workplace => ({
      hospital: workplace.hospital,
      consultationFee: workplace.consultationFee ? parseFloat(workplace.consultationFee) : 0,
      availableSlots: workplace.availableSlots ? 
        workplace.availableSlots.filter(slot => slot.isAvailable === true) : []
    }))
  }

  console.log('📝 Final update data prepared:', {
    workplacesCount: updateData.workplaces.length,
    hasProfileImage: !!updateData.profileImage,
    servicesCount: updateData.servicesProvided?.length || 0
  })

  try {
    // Update the doctor profile
    const updatedDoctor = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password')

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
  console.log('🔍 Profile setup request started')
  console.log('🔍 Request method:', req.method)
  console.log('🔍 Request headers:', {
    'content-type': req.headers['content-type'],
    'authorization': req.headers.authorization ? 'Present' : 'Missing'
  })
  console.log('🔍 Request body keys:', Object.keys(req.body))
  console.log('🔍 Request file:', req.file ? 'Present' : 'Missing')
  console.log('🔍 User from auth:', req.user ? req.user._id : 'Missing')

  try {
    // Parse JSON fields from FormData
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
      email,
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

    console.log('🔍 Enhanced profile setup request received:', {
      userId: req.user._id,
      firstName,
      lastName,
      specialization,
      workplacesCount: parsedWorkplaces?.length || 0,
      servicesCount: parsedServicesProvided?.length || 0,
      hasEmergencyContact: !!parsedEmergencyContact?.name,
      hasProfileImage: !!req.file
    })

    // Validate required personal information
    if (!firstName?.trim() || !lastName?.trim() || !phone?.trim() || !gender) {
      return res.status(400).json({
        status: 'error',
        message: 'Personal information (first name, last name, phone, gender) is required'
      })
    }

    // Validate required professional information
    if (!specialization || !licenseNumber?.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Professional information (specialization, license number) is required'
      })
    }

    // Validate professional bio
    if (!professionalBio?.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Professional bio is required'
      })
    }

    // Validate services provided
    if (!parsedServicesProvided || !Array.isArray(parsedServicesProvided) || parsedServicesProvided.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one service must be selected'
      })
    }

    // Validate workplaces
    if (!parsedWorkplaces || !Array.isArray(parsedWorkplaces) || parsedWorkplaces.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one workplace is required'
      })
    }

    // Validate each workplace
    for (const workplace of parsedWorkplaces) {
      if (!workplace.hospital?.trim() || !workplace.consultationFee || workplace.consultationFee <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Each workplace must have a hospital name and valid consultation fee'
        })
      }

      // Filter only available slots for validation
      const availableSlots = workplace.availableSlots?.filter(slot => slot.isAvailable === true) || []
      
      // Validate that there's at least one available slot
      if (availableSlots.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Each workplace must have at least one available time slot'
        })
      }

      // Validate each available time slot
      for (const slot of availableSlots) {
        if (!slot.day || !slot.startTime || !slot.endTime) {
          return res.status(400).json({
            status: 'error',
            message: 'Each available time slot must have day, start time, and end time'
          })
        }
      }
    }

    // Validate qualifications
    if (!parsedQualifications || !Array.isArray(parsedQualifications) || parsedQualifications.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one qualification is required'
      })
    }

    // Validate each qualification
    for (const qual of parsedQualifications) {
      if (!qual.degree?.trim() || !qual.institution?.trim() || !qual.year) {
        return res.status(400).json({
          status: 'error',
          message: 'Each qualification must have degree, institution, and year'
        })
      }
    }

    // Validate address
    if (!parsedAddress || !parsedAddress.street?.trim() || !parsedAddress.city?.trim() || 
        !parsedAddress.state?.trim() || !parsedAddress.zipCode?.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Complete address information is required'
      })
    }

    // Find the doctor
    const doctor = await User.findById(req.user._id)
    
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      })
    }

    console.log('👤 Doctor found:', {
      email: doctor.email,
      profileSetupCompleted: doctor.profileSetupCompleted,
      status: doctor.status
    })

    if (doctor.profileSetupCompleted) {
      return res.status(400).json({
        status: 'error',
        message: 'Profile setup has already been completed'
      })
    }

    // Handle profile image upload
    let profileImagePath = doctor.profileImage || ''
    if (req.file) {
      profileImagePath = `/uploads/profiles/${req.file.filename}`
    }

    // Prepare update data
    const updateData = {
      // Personal Information
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : doctor.dateOfBirth,
      
      // Professional Information
      specialization,
      licenseNumber: licenseNumber.trim(),
      medicalRegistrationNumber: medicalRegistrationNumber?.trim() || doctor.medicalRegistrationNumber,
      experience,
      qualifications: parsedQualifications,
      
      // Profile & Bio
      professionalBio: professionalBio.trim(),
      profileImage: profileImagePath,
      languages: parsedLanguages || ['English'],
      
      // Services & Consultation
      servicesProvided: parsedServicesProvided,
      onlineConsultationAvailable: onlineConsultationAvailable === 'true' || onlineConsultationAvailable === true,
      offlineConsultationAvailable: offlineConsultationAvailable !== 'false' && offlineConsultationAvailable !== false,
      
      // Workplaces & Availability
      workplaces: parsedWorkplaces.map(workplace => ({
        hospital: workplace.hospital.trim(),
        consultationFee: parseFloat(workplace.consultationFee),
        availableSlots: workplace.availableSlots?.filter(slot => slot.isAvailable === true) || []
      })),
      
      // Emergency Contact
      emergencyContact: parsedEmergencyContact && parsedEmergencyContact.name ? {
        name: parsedEmergencyContact.name.trim(),
        relationship: parsedEmergencyContact.relationship,
        phone: parsedEmergencyContact.phone?.trim() || '',
        email: parsedEmergencyContact.email?.trim() || ''
      } : undefined,
      
      // Address
      address: {
        street: parsedAddress.street.trim(),
        city: parsedAddress.city.trim(),
        state: parsedAddress.state.trim(),
        zipCode: parsedAddress.zipCode.trim(),
        country: parsedAddress.country || 'India'
      },
      
      // Profile completion
      profileSetupCompleted: true,
      profileSetupCompletedAt: new Date()
    }

    console.log('💾 Updating doctor profile with data:', {
      personalFields: ['firstName', 'lastName', 'phone', 'gender'],
      professionalFields: ['specialization', 'licenseNumber'],
      workplacesCount: updateData.workplaces.length,
      servicesCount: updateData.servicesProvided.length,
      hasEmergencyContact: !!updateData.emergencyContact,
      hasProfileImage: !!updateData.profileImage
    })

    // Update the doctor profile
    const updatedDoctor = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password')

    if (!updatedDoctor) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to update doctor profile'
      })
    }

    console.log('✅ Doctor profile setup completed successfully:', {
      doctorId: updatedDoctor._id,
      email: updatedDoctor.email,
      workplacesCount: updatedDoctor.workplaces?.length || 0,
      profileSetupCompleted: updatedDoctor.profileSetupCompleted
    })

    res.status(200).json({
      status: 'success',
      message: 'Profile setup completed successfully',
      data: {
        doctor: updatedDoctor
      }
    })

  } catch (error) {
    console.error('❌ Profile setup error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during profile setup',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

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
