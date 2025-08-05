import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { doctorsAPI } from '../../services/api'
import { toast } from 'react-hot-toast'
import { Stethoscope, Clock, MapPin, FileText, Save, ArrowRight, CheckCircle, GraduationCap } from 'lucide-react'

const DoctorProfileSetup = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const [formData, setFormData] = useState({
    specialization: '',
    licenseNumber: '',
    medicalRegistrationNumber: '',
    experience: '',
    professionalBio: '',
    languages: ['English'],
    consultationFee: '',
    onlineConsultationAvailable: false,
    offlineConsultationAvailable: true,
    qualifications: [{ degree: '', institution: '', year: '' }],
    availableSlots: [{ day: 'monday', startTime: '09:00', endTime: '17:00' }],
    workplaces: [],
    address: { street: '', city: '', state: '', zipCode: '', country: 'India' }
  })

  const [errors, setErrors] = useState({})

  const specializations = [
    'General Medicine', 'Cardiology', 'Dermatology', 'Pediatrics', 'Orthopedics',
    'Neurology', 'Psychiatry', 'Gynecology', 'ENT', 'Ophthalmology'
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validateStep = (step) => {
    const newErrors = {}
    
    if (step === 1) {
      // Step 1: Professional Information
      if (!formData.consultationFee || formData.consultationFee <= 0) {
        newErrors.consultationFee = 'Valid consultation fee is required'
      }
    } else if (step === 2) {
      // Step 2: Qualifications
      if (!formData.qualifications || formData.qualifications.length === 0) {
        newErrors.qualifications = 'At least one qualification is required'
      } else {
        // Check if all qualifications are complete
        for (let i = 0; i < formData.qualifications.length; i++) {
          const qual = formData.qualifications[i]
          if (!qual.degree || !qual.institution || !qual.year) {
            newErrors.qualifications = 'All qualification fields must be completed'
            break
          }
        }
      }
    } else if (step === 3) {
      // Step 3: Available Time Slots
      if (!formData.availableSlots || formData.availableSlots.length === 0) {
        newErrors.availableSlots = 'At least one time slot is required'
      } else {
        // Check if all time slots are complete
        for (let i = 0; i < formData.availableSlots.length; i++) {
          const slot = formData.availableSlots[i]
          if (!slot.day || !slot.startTime || !slot.endTime) {
            newErrors.availableSlots = 'All time slot fields must be completed'
            break
          }
        }
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return
    setLoading(true)
    try {
      await doctorsAPI.completeProfileSetup(formData)
      toast.success('Profile setup completed!')
      await updateUser()
      navigate('/doctor/dashboard')
    } catch (error) {
      toast.error('Failed to complete setup')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Stethoscope className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Professional Information</h2>
              <p className="text-gray-600">Complete your professional details</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Consultation Fee (₹) *</label>
                <input
                  type="number"
                  value={formData.consultationFee}
                  onChange={(e) => handleInputChange('consultationFee', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.consultationFee ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., 500"
                />
                {errors.consultationFee && <p className="text-red-500 text-sm mt-1">{errors.consultationFee}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Professional Bio</label>
                <textarea
                  value={formData.professionalBio}
                  onChange={(e) => handleInputChange('professionalBio', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg border-gray-300"
                  rows="3"
                  placeholder="Brief description of your expertise and approach..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Languages Spoken</label>
                <input
                  type="text"
                  value={formData.languages?.join(', ') || ''}
                  onChange={(e) => handleInputChange('languages', e.target.value.split(',').map(lang => lang.trim()))}
                  className="w-full px-4 py-3 border rounded-lg border-gray-300"
                  placeholder="e.g., English, Hindi, Tamil"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Online Consultation Available</label>
                <select
                  value={formData.onlineConsultationAvailable}
                  onChange={(e) => handleInputChange('onlineConsultationAvailable', e.target.value === 'true')}
                  className="w-full px-4 py-3 border rounded-lg border-gray-300"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <GraduationCap className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Qualifications</h2>
              <p className="text-gray-600">Add your educational qualifications</p>
            </div>
            <div className="space-y-4">
              {formData.qualifications.map((qual, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Degree *</label>
                      <input
                        type="text"
                        value={qual.degree}
                        onChange={(e) => {
                          const newQuals = [...formData.qualifications]
                          newQuals[index].degree = e.target.value
                          handleInputChange('qualifications', newQuals)
                        }}
                        className="w-full px-3 py-2 border rounded-lg border-gray-300"
                        placeholder="e.g., MBBS, MD"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Institution *</label>
                      <input
                        type="text"
                        value={qual.institution}
                        onChange={(e) => {
                          const newQuals = [...formData.qualifications]
                          newQuals[index].institution = e.target.value
                          handleInputChange('qualifications', newQuals)
                        }}
                        className="w-full px-3 py-2 border rounded-lg border-gray-300"
                        placeholder="University/College name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Year *</label>
                      <input
                        type="number"
                        value={qual.year}
                        onChange={(e) => {
                          const newQuals = [...formData.qualifications]
                          newQuals[index].year = e.target.value
                          handleInputChange('qualifications', newQuals)
                        }}
                        className="w-full px-3 py-2 border rounded-lg border-gray-300"
                        placeholder="2020"
                      />
                    </div>
                  </div>
                  {formData.qualifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newQuals = formData.qualifications.filter((_, i) => i !== index)
                        handleInputChange('qualifications', newQuals)
                      }}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newQuals = [...formData.qualifications, { degree: '', institution: '', year: '' }]
                  handleInputChange('qualifications', newQuals)
                }}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600"
              >
                + Add Another Qualification
              </button>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Clock className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Available Time Slots</h2>
              <p className="text-gray-600">Set your availability for appointments</p>
            </div>
            <div className="space-y-4">
              {formData.availableSlots.map((slot, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Day *</label>
                      <select
                        value={slot.day}
                        onChange={(e) => {
                          const newSlots = [...formData.availableSlots]
                          newSlots[index].day = e.target.value
                          handleInputChange('availableSlots', newSlots)
                        }}
                        className="w-full px-3 py-2 border rounded-lg border-gray-300"
                      >
                        <option value="">Select Day</option>
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                        <option value="sunday">Sunday</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Time *</label>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => {
                          const newSlots = [...formData.availableSlots]
                          newSlots[index].startTime = e.target.value
                          handleInputChange('availableSlots', newSlots)
                        }}
                        className="w-full px-3 py-2 border rounded-lg border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">End Time *</label>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => {
                          const newSlots = [...formData.availableSlots]
                          newSlots[index].endTime = e.target.value
                          handleInputChange('availableSlots', newSlots)
                        }}
                        className="w-full px-3 py-2 border rounded-lg border-gray-300"
                      />
                    </div>
                  </div>
                  {formData.availableSlots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newSlots = formData.availableSlots.filter((_, i) => i !== index)
                        handleInputChange('availableSlots', newSlots)
                      }}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newSlots = [...formData.availableSlots, { day: '', startTime: '', endTime: '' }]
                  handleInputChange('availableSlots', newSlots)
                }}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600"
              >
                + Add Another Time Slot
              </button>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Ready to Complete</h2>
              <p className="text-gray-600">Review and complete your profile setup</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Profile Summary</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Consultation Fee:</strong> ₹{formData.consultationFee}</p>
                <p><strong>Online Consultation:</strong> {formData.onlineConsultationAvailable ? 'Available' : 'Not Available'}</p>
                <p><strong>Qualifications:</strong> {formData.qualifications.length} added</p>
                <p><strong>Available Slots:</strong> {formData.availableSlots.length} time slots</p>
                {formData.professionalBio && <p><strong>Bio:</strong> {formData.professionalBio.substring(0, 100)}...</p>}
              </div>
            </div>
          </div>
        )
      default:
        return <div>Step {currentStep} content</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Welcome, Dr. {user?.firstName}! Set up your profile for patient bookings.</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {renderStepContent()}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg ${currentStep === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Previous
          </button>

          {currentStep < totalSteps ? (
            <button onClick={handleNext} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
            >
              {loading ? 'Completing...' : 'Complete Setup'}
              <Save className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorProfileSetup
