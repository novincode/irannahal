// Main auth actions
export { requestOtp, verifyOtp, resendOtp, completeProfile } from './actions'

// Types and schemas
export type { 
  RequestOtpData, 
  VerifyOtpData, 
  AuthState, 
  AuthStep, 
  OtpSession,
  AuthError 
} from './types'
export { 
  phoneNumberSchema, 
  otpSchema, 
  requestOtpSchema, 
  verifyOtpSchema,
  AUTH_CONSTANTS,
  AUTH_ERROR_MESSAGES 
} from './types'

// Utility functions
export { 
  generateOtp,
  getOtpExpiryTime,
  isOtpExpired,
  formatPhoneNumber,
  maskPhoneNumber,
  isValidIranianPhone,
  sendSms,
  generateOtpMessage,
  createOtpCacheKey,
  checkRateLimit
} from './utils'
