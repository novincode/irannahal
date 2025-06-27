'use client'
import React from 'react'
import { Button } from '@shadcn/button'
import { Input } from '@shadcn/input'
import { Label } from '@shadcn/label'
import { Smartphone, ArrowRight } from 'lucide-react'
import { useAuth } from './AuthContext'
import { requestOtp } from '@actions/auth/actions'
import { usePhoneInput } from '@ui/hooks/use-phone-input'
import { toast } from 'sonner'

export function PhoneStep() {
  const { state, setStep, setPhone, setLoading, setError } = useAuth()
  const phoneInput = usePhoneInput(state.phoneNumber || '')

  const handlePhoneChange = (value: string) => {
    phoneInput.handleChange(value)
    setError(undefined)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phoneInput.isValid) {
      setError('شماره تلفن معتبر وارد کنید')
      return
    }

    setLoading(true)
    
    try {
      const formattedPhone = phoneInput.getFormattedValue()
      const result = await requestOtp({ phoneNumber: formattedPhone })
      
      if (result.success) {
        setPhone(formattedPhone)
        setStep('otp')
        toast.success(result.message || 'کد تایید ارسال شد')
      } else {
        setError(result.message || 'خطا در ارسال کد تایید')
        toast.error(result.message || 'خطا در ارسال کد تایید')
      }
    } catch (error) {
      setError('خطای غیرمنتظره‌ای رخ داد')
      toast.error('خطای غیرمنتظره‌ای رخ داد')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2">ورود با شماره موبایل</h2>
        <p className="text-sm text-muted-foreground">
          برای ورود یا ثبت نام، شماره موبایل خود را وارد کنید
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">شماره موبایل</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="09123456789"
          value={phoneInput.value}
          onChange={(e) => handlePhoneChange(e.target.value)}
          className={`text-left ${!phoneInput.isValid && phoneInput.value ? 'border-destructive' : ''}`}
          dir="ltr"
        />
        {!phoneInput.isValid && phoneInput.value && (
          <p className="text-sm text-destructive">شماره موبایل معتبر وارد کنید</p>
        )}
      </div>

      {state.error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{state.error}</p>
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={!phoneInput.isValid || state.isLoading}
      >
        {state.isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            در حال ارسال...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            ارسال کد تایید
            <ArrowRight className="w-4 h-4" />
          </div>
        )}
      </Button>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          با ادامه، شما با{' '}
          <a href="/terms" className="text-primary hover:underline">
            قوانین و مقررات
          </a>{' '}
          موافقت می‌کنید
        </p>
      </div>
    </form>
  )
}
