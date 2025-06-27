'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@shadcn/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@shadcn/input-otp'
import { ArrowLeft, RotateCcw, Edit, Shield } from 'lucide-react'
import { useAuth } from './AuthContext'
import { verifyOtp, resendOtp } from '@actions/auth/actions'
import { maskPhoneNumber } from '@actions/auth/utils'
import { AUTH_CONSTANTS } from '@actions/auth/types'
import { useCountdown } from '@ui/hooks/use-countdown'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function OtpStep() {
  const router = useRouter()
  const { state, setStep, setLoading, setError, incrementAttempts } = useAuth()
  const [otp, setOtp] = useState('')
  const [isResending, setIsResending] = useState(false)

  // Countdown timer for resend button
  const countdown = useCountdown({
    initialTime: AUTH_CONSTANTS.RESEND_COOLDOWN_SECONDS,
    onComplete: () => {
      // Timer completed, allow resend
    },
    autoStart: true
  })

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === AUTH_CONSTANTS.OTP_LENGTH) {
      handleVerifyOtp()
    }
  }, [otp])

  const handleVerifyOtp = async () => {
    if (!state.phoneNumber || otp.length !== AUTH_CONSTANTS.OTP_LENGTH) {
      return
    }

    setLoading(true)
    setError(undefined)

    try {
      const result = await verifyOtp({
        phoneNumber: state.phoneNumber,
        otp
      })

      if (result.success) {
        toast.success(result.message || 'با موفقیت وارد شدید')
        
        // Check if we need to redirect to profile step or dashboard
        if (result.redirectTo === 'profile') {
          setStep('profile')
        } else if (result.redirectTo) {
          // Redirect to the specified path (e.g., /panel/dashboard)
          router.push(result.redirectTo)
        } else {
          // Default fallback
          router.push('/panel/dashboard')
        }
      } else {
        incrementAttempts()
        setError(result.message || 'کد تایید اشتباه است')
        setOtp('') // Clear OTP input
        toast.error(result.message || 'کد تایید اشتباه است')
      }
    } catch (error) {
      setError('خطای غیرمنتظره‌ای رخ داد')
      setOtp('')
      toast.error('خطای غیرمنتظره‌ای رخ داد')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!state.phoneNumber || !countdown.isCompleted) {
      return
    }

    setIsResending(true)
    setError(undefined)

    try {
      const result = await resendOtp(state.phoneNumber)

      if (result.success) {
        toast.success('کد تایید مجدداً ارسال شد')
        countdown.start(AUTH_CONSTANTS.RESEND_COOLDOWN_SECONDS)
        setOtp('')
      } else {
        setError(result.message || 'خطا در ارسال مجدد کد')
        toast.error(result.message || 'خطا در ارسال مجدد کد')
      }
    } catch (error) {
      setError('خطای غیرمنتظره‌ای رخ داد')
      toast.error('خطای غیرمنتظره‌ای رخ داد')
    } finally {
      setIsResending(false)
    }
  }

  const handleGoBack = () => {
    setStep('phone')
    setOtp('')
    setError(undefined)
    countdown.reset()
  }

  const handleChangeNumber = () => {
    setStep('phone')
    setOtp('')
    setError(undefined)
    countdown.reset()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2">تایید شماره موبایل</h2>
        <p className="text-sm text-muted-foreground">
          کد تایید ۶ رقمی به شماره{' '}
          <span className="font-medium text-foreground bg-secondary " dir='ltr'>
            {state.phoneNumber ? maskPhoneNumber(state.phoneNumber) : ''}
          </span>{' '}
          ارسال شد
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center" dir='ltr'>
          <InputOTP
            value={otp}
            onChange={setOtp}
            maxLength={AUTH_CONSTANTS.OTP_LENGTH}
            disabled={state.isLoading}
          >
            <InputOTPGroup>
              {Array.from({ length: AUTH_CONSTANTS.OTP_LENGTH }).map((_, index) => (
                <InputOTPSlot key={index} index={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {state.error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive text-center">{state.error}</p>
          </div>
        )}

        {state.attempts > 0 && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              تلاش‌های باقی‌مانده: {AUTH_CONSTANTS.MAX_ATTEMPTS - state.attempts}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* Resend OTP */}
        <div className="text-center">
          {countdown.isCompleted ? (
            <Button
              variant="ghost"
              onClick={handleResendOtp}
              disabled={isResending}
              className="text-primary"
            >
              {isResending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  در حال ارسال...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  ارسال مجدد کد
                </div>
              )}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              ارسال مجدد کد تا {countdown.formatTime()} دیگر
            </p>
          )}
        </div>

        {/* Change Phone Number */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={handleChangeNumber}
            disabled={state.isLoading}
            className="text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              تغییر شماره موبایل
            </div>
          </Button>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={handleGoBack}
            disabled={state.isLoading}
            className="w-full"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              بازگشت
            </div>
          </Button>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          کد تایید تا ۵ دقیقه معتبر است
        </p>
      </div>
    </div>
  )
}
