import { AUTH_CONSTANTS } from './types'

/**
 * Generate a random 6-digit OTP token
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Calculate OTP expiration time
 */
export function getOtpExpiryTime(): Date {
  const now = new Date()
  return new Date(now.getTime() + AUTH_CONSTANTS.OTP_EXPIRY_MINUTES * 60 * 1000)
}

/**
 * Check if OTP is expired
 */
export function isOtpExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

/**
 * Format phone number to standard format
 * Converts various Iranian phone number formats to +989xxxxxxxxx
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')
  
  // Handle different formats
  if (digits.startsWith('98') && digits.length === 12) {
    return `+${digits}`
  } else if (digits.startsWith('0') && digits.length === 11) {
    return `+98${digits.slice(1)}`
  } else if (digits.startsWith('9') && digits.length === 10) {
    return `+98${digits}`
  }
  
  return phone // Return original if no match
}

/**
 * Mask phone number for display
 * +989123456789 -> +98912***6789
 */
export function maskPhoneNumber(phone: string): string {
  const formatted = formatPhoneNumber(phone)
  if (formatted.startsWith('+98') && formatted.length === 13) {
    return `${formatted.slice(0, 6)}***${formatted.slice(-4)}`
  }
  return phone
}

/**
 * Validate Iranian phone number
 */
export function isValidIranianPhone(phone: string): boolean {
  // Remove all non-digits and check length
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 12) {
    return false
  }
  
  // Check Iranian mobile format
  return /^(98)?9\d{9}$/.test(digits) || /^09\d{9}$/.test(phone)
}

/**
 * Calculate remaining time in seconds
 */
export function getRemainingTime(targetTime: Date): number {
  const now = new Date()
  const diff = targetTime.getTime() - now.getTime()
  return Math.max(0, Math.floor(diff / 1000))
}

/**
 * Format countdown time for display
 */
export function formatCountdownTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Generate a unique session identifier
 */
export function generateSessionId(): string {
  return `otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create cache key for OTP session
 */
export function createOtpCacheKey(phoneNumber: string): string {
  return `otp:${formatPhoneNumber(phoneNumber)}`
}

/**
 * Simple rate limiting check
 */
export function checkRateLimit(attempts: number, maxAttempts: number): boolean {
  return attempts < maxAttempts
}

/**
 * Send SMS (placeholder implementation)
 * TODO: Integrate with actual SMS provider (Kavenegar, etc.)
 */
export async function sendSms(phoneNumber: string, message: string): Promise<boolean> {
  console.log(`📱 SMS to ${phoneNumber}: ${message}`)
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // For development, always return success
  // In production, this would integrate with SMS provider
  return true
}

/**
 * Generate OTP SMS message
 */
export function generateOtpMessage(otp: string, appName: string = 'نکست کالا'): string {
  return `کد تایید ${appName}: ${otp}\n\nاین کد تا ۵ دقیقه معتبر است.\nاین کد را با کسی به اشتراک نگذارید.`
}
