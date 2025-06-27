'use client'
import React from 'react'
import { AuthProvider, useAuth } from './AuthContext'
import { PhoneStep } from './PhoneStep'
import { OtpStep } from './OtpStep'
import { ProfileStep } from './ProfileStep'

// Main OTP Form component with step routing
function OTPFormContent() {
  const { state } = useAuth()

  const renderStep = () => {
    switch (state.currentStep) {
      case 'phone':
        return <PhoneStep />
      case 'otp':
        return <OtpStep />
      case 'profile':
        return <ProfileStep />
      case 'complete':
        // Future: Completion step
        return <div>Complete (Coming Soon)</div>
      default:
        return <PhoneStep />
    }
  }

  return (
    <div className="w-full max-w-sm">
      {renderStep()}
    </div>
  )
}

// Main export with provider
const OTPForm = () => {
  return (
    <AuthProvider>
      <OTPFormContent />
    </AuthProvider>
  )
}

export default OTPForm