import { z } from 'zod'

// Phone number validation for Iranian numbers
export const phoneNumberSchema = z.string()
  .min(10, 'شماره تلفن باید حداقل ۱۰ رقم باشد')
  .refine((phone) => {
    // Remove all non-digits and check length
    const digits = phone.replace(/\D/g, '')
    return digits.length >= 10 && digits.length <= 12
  }, 'شماره تلفن معتبر وارد کنید')
  .refine((phone) => {
    // Check Iranian mobile format
    const digits = phone.replace(/\D/g, '')
    return /^(98)?9\d{9}$/.test(digits) || /^09\d{9}$/.test(phone)
  }, 'شماره تلفن معتبر وارد کنید')

// OTP validation
export const otpSchema = z.string()
  .length(6, 'کد تایید باید ۶ رقم باشد')
  .regex(/^\d{6}$/, 'کد تایید فقط شامل اعداد است')

// Form schemas
export const requestOtpSchema = z.object({
  phoneNumber: phoneNumberSchema,
})

export const verifyOtpSchema = z.object({
  phoneNumber: phoneNumberSchema,
  otp: otpSchema,
})

// Profile completion schema
export const profileSchema = z.object({
  name: z.string()
    .min(2, 'نام باید حداقل ۲ کاراکتر باشد')
    .max(50, 'نام نباید بیش از ۵۰ کاراکتر باشد'),
  email: z.string()
    .email('ایمیل معتبر وارد کنید')
    .optional()
    .or(z.literal(''))
})

// Types
export type RequestOtpData = z.infer<typeof requestOtpSchema>
export type VerifyOtpData = z.infer<typeof verifyOtpSchema>
export type ProfileData = z.infer<typeof profileSchema>

// Constants
export const AUTH_CONSTANTS = {
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 5,
  MAX_ATTEMPTS: 3,
  RESEND_COOLDOWN_SECONDS: 60,
  TOKEN_EXPIRY_MINUTES: 30,
} as const

// Auth step types
export type AuthStep = 'phone' | 'otp' | 'profile' | 'complete'

// Main auth state interface
export interface AuthState {
  currentStep: AuthStep
  phoneNumber?: string
  profileData?: {
    name?: string
    email?: string
  }
  isLoading: boolean
  error?: string
  attempts: number
}

// OTP session for server-side storage
export interface OtpSession {
  phoneNumber: string
  token: string
  expiresAt: Date
  attempts: number
}

// Error types and messages
export type AuthError = 
  | 'INVALID_PHONE'
  | 'INVALID_OTP'
  | 'OTP_EXPIRED'
  | 'TOO_MANY_ATTEMPTS'
  | 'SMS_SEND_FAILED'
  | 'VERIFICATION_FAILED'
  | 'USER_NOT_FOUND'
  | 'UNKNOWN_ERROR'

export const AUTH_ERROR_MESSAGES: Record<AuthError, string> = {
  INVALID_PHONE: 'شماره تلفن معتبر نیست',
  INVALID_OTP: 'کد تایید اشتباه است',
  OTP_EXPIRED: 'کد تایید منقضی شده است',
  TOO_MANY_ATTEMPTS: 'تعداد تلاش‌های مجاز تمام شده است',
  SMS_SEND_FAILED: 'خطا در ارسال پیامک',
  VERIFICATION_FAILED: 'تایید کد ناموفق بود',
  USER_NOT_FOUND: 'کاربر یافت نشد',
  UNKNOWN_ERROR: 'خطای غیرمنتظره‌ای رخ داد',
}
