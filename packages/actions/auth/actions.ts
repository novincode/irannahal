'use server'

import { ZodError } from 'zod'
import { auth, signIn } from '@auth'
import { 
  type RequestOtpData, 
  type VerifyOtpData, 
  type OtpSession,
  type AuthError,
  type ProfileData,
  requestOtpSchema, 
  verifyOtpSchema,
  profileSchema,
  AUTH_CONSTANTS,
  AUTH_ERROR_MESSAGES
} from './types'
import { 
  generateOtp, 
  getOtpExpiryTime, 
  isOtpExpired,
  formatPhoneNumber,
  sendSms,
  generateOtpMessage,
  createOtpCacheKey,
  checkRateLimit
} from './utils'
import { getUser, getUserByPhone, createUser, updateUser, type CreateUserData } from '@actions/users'
import type { users } from '@db/schema'

type User = typeof users.$inferSelect
import { redirect } from 'next/navigation'

// In-memory storage for OTP sessions (in production, use Redis or database)
const otpSessions = new Map<string, OtpSession>()

/**
 * Request OTP for phone number
 */
export async function requestOtp(data: RequestOtpData): Promise<{ 
  success: boolean 
  error?: AuthError 
  message?: string 
}> {
  try {
    // Validate input
    const validated = requestOtpSchema.parse(data)
    const phoneNumber = formatPhoneNumber(validated.phoneNumber)
    
    // Check rate limiting
    const cacheKey = createOtpCacheKey(phoneNumber)
    const existingSession = otpSessions.get(cacheKey)
    
    if (existingSession && !checkRateLimit(existingSession.attempts, AUTH_CONSTANTS.MAX_ATTEMPTS)) {
      return {
        success: false,
        error: 'TOO_MANY_ATTEMPTS',
        message: AUTH_ERROR_MESSAGES.TOO_MANY_ATTEMPTS
      }
    }
    
    // Generate OTP
    const otp = generateOtp()
    const expiresAt = getOtpExpiryTime()
    
    // Create session
    const session: OtpSession = {
      phoneNumber,
      token: otp,
      expiresAt,
      attempts: existingSession ? existingSession.attempts : 0
    }
    
    // Save session
    otpSessions.set(cacheKey, session)
    
    // Send SMS
    const message = generateOtpMessage(otp)
    const smsSent = await sendSms(phoneNumber, message)
    
    if (!smsSent) {
      return {
        success: false,
        error: 'SMS_SEND_FAILED',
        message: AUTH_ERROR_MESSAGES.SMS_SEND_FAILED
      }
    }
    
    return {
      success: true,
      message: 'کد تایید با موفقیت ارسال شد'
    }
    
  } catch (error) {
    console.error('Request OTP error:', error)
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'INVALID_PHONE',
        message: AUTH_ERROR_MESSAGES.INVALID_PHONE
      }
    }
    
    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      message: AUTH_ERROR_MESSAGES.UNKNOWN_ERROR
    }
  }
}

/**
 * Verify OTP and authenticate user
 */
export async function verifyOtp(data: VerifyOtpData): Promise<{ 
  success: boolean 
  error?: AuthError 
  message?: string 
  redirectTo?: string 
}> {
  try {
    // Validate input
    const validated = verifyOtpSchema.parse(data)
    const phoneNumber = formatPhoneNumber(validated.phoneNumber)
    
    // Get session
    const cacheKey = createOtpCacheKey(phoneNumber)
    const session = otpSessions.get(cacheKey)
    
    if (!session) {
      return {
        success: false,
        error: 'VERIFICATION_FAILED',
        message: 'جلسه تایید یافت نشد. دوباره تلاش کنید'
      }
    }
    
    // Check expiration
    if (isOtpExpired(session.expiresAt)) {
      otpSessions.delete(cacheKey)
      return {
        success: false,
        error: 'OTP_EXPIRED',
        message: AUTH_ERROR_MESSAGES.OTP_EXPIRED
      }
    }
    
    // Check attempts
    session.attempts += 1
    if (!checkRateLimit(session.attempts, AUTH_CONSTANTS.MAX_ATTEMPTS)) {
      otpSessions.delete(cacheKey)
      return {
        success: false,
        error: 'TOO_MANY_ATTEMPTS',
        message: AUTH_ERROR_MESSAGES.TOO_MANY_ATTEMPTS
      }
    }
    
    // Verify OTP
    if (session.token !== validated.otp) {
      otpSessions.set(cacheKey, session) // Update attempts
      return {
        success: false,
        error: 'INVALID_OTP',
        message: AUTH_ERROR_MESSAGES.INVALID_OTP
      }
    }
    
    // OTP is valid, clean up session
    otpSessions.delete(cacheKey)
    
    // Find or create user
    let user: User | null = await getUserByPhone(phoneNumber)
    
    if (!user) {
      // Create new user with phone only
      user = await createUser({
        phone: phoneNumber,
        role: 'user'
      })
    }
    
    // If user has no name, redirect to profile completion
    if (!user.name) {
      return {
        success: true,
        message: 'کد تایید شد',
        redirectTo: 'profile'
      }
    }
    
    // User has name, sign them in directly
    try {
      await signIn('phone', {
        phone: phoneNumber,
        userId: user.id,
        redirect: false
      })
      
      return {
        success: true,
        message: 'با موفقیت وارد شدید',
        redirectTo: '/panel/dashboard'
      }
    } catch (authError) {
      console.error('SignIn error:', authError)
      return {
        success: false,
        error: 'VERIFICATION_FAILED',
        message: 'خطا در ورود به سیستم'
      }
    }
    
  } catch (error) {
    console.error('Verify OTP error:', error)
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'INVALID_OTP',
        message: AUTH_ERROR_MESSAGES.INVALID_OTP
      }
    }
    
    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      message: AUTH_ERROR_MESSAGES.UNKNOWN_ERROR
    }
  }
}

/**
 * Resend OTP
 */
export async function resendOtp(phoneNumber: string): Promise<{ 
  success: boolean 
  error?: AuthError 
  message?: string 
}> {
  return requestOtp({ phoneNumber })
}

/**
 * Clear OTP session
 */
export async function clearOtpSession(phoneNumber: string): Promise<void> {
  const cacheKey = createOtpCacheKey(formatPhoneNumber(phoneNumber))
  otpSessions.delete(cacheKey)
}

/**
 * Complete user profile
 */
export async function completeProfile(data: {
  phoneNumber: string
  name: string
  email?: string
}): Promise<{ 
  success: boolean 
  error?: AuthError 
  message?: string 
}> {
  try {
    // Validate profile data
    const profileValidation = profileSchema.parse({
      name: data.name,
      email: data.email || ''
    })

    // Get user (should exist from OTP verification)
    const user = await getUserByPhone(data.phoneNumber)
    
    if (!user) {
      return {
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'کاربر یافت نشد'
      }
    }

    // Update user with profile data
    await updateUser(user.id, {
      name: profileValidation.name,
      email: profileValidation.email || undefined,
    })

    // Sign in the user
    try {
      await signIn('phone', {
        phone: data.phoneNumber,
        userId: user.id,
        redirect: false
      })

      return {
        success: true,
        message: 'پروفایل شما با موفقیت تکمیل شد'
      }
    } catch (authError) {
      console.error('SignIn error after profile completion:', authError)
      return {
        success: false,
        error: 'VERIFICATION_FAILED',
        message: 'خطا در ورود به سیستم'
      }
    }

  } catch (error) {
    console.error('Complete profile error:', error)
    
    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'INVALID_PHONE',
        message: 'اطلاعات وارد شده معتبر نیست'
      }
    }
    
    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      message: AUTH_ERROR_MESSAGES.UNKNOWN_ERROR
    }
  }
}