'use client'
import React, { useState } from 'react'
import { Button } from '@shadcn/button'
import { Input } from '@shadcn/input'
import { Label } from '@shadcn/label'
import { User, Mail, ArrowRight, Shield } from 'lucide-react'
import { useAuth } from './AuthContext'
import { completeProfile } from '@actions/auth/actions'
import { maskPhoneNumber } from '@actions/auth/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function ProfileStep() {
  const router = useRouter()
  const { state, setLoading, setError } = useAuth()
  const [name, setName] = useState(state.profileData?.name || '')
  const [email, setEmail] = useState(state.profileData?.email || '')
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')

  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError('نام الزامی است')
      return false
    }
    if (value.trim().length < 2) {
      setNameError('نام باید حداقل ۲ کاراکتر باشد')
      return false
    }
    if (value.trim().length > 50) {
      setNameError('نام نباید بیش از ۵۰ کاراکتر باشد')
      return false
    }
    setNameError('')
    return true
  }

  const validateEmail = (value: string) => {
    if (value && value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value.trim())) {
        setEmailError('ایمیل معتبر وارد کنید')
        return false
      }
    }
    setEmailError('')
    return true
  }

  const handleNameChange = (value: string) => {
    setName(value)
    setError(undefined)
    validateName(value)
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    setError(undefined)
    validateEmail(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const isNameValid = validateName(name)
    const isEmailValid = validateEmail(email)
    
    if (!isNameValid || !isEmailValid) {
      return
    }

    if (!state.phoneNumber) {
      setError('خطا در اطلاعات تلفن')
      return
    }

    setLoading(true)
    
    try {
      const result = await completeProfile({
        phoneNumber: state.phoneNumber,
        name: name.trim(),
        email: email.trim() || undefined
      })
      
      if (result.success) {
        toast.success('پروفایل شما با موفقیت تکمیل شد')
        router.push('/panel/dashboard')
      } else {
        setError(result.message || 'خطا در تکمیل پروفایل')
        toast.error(result.message || 'خطا در تکمیل پروفایل')
      }
    } catch (error) {
      setError('خطای غیرمنتظره‌ای رخ داد')
      toast.error('خطای غیرمنتظره‌ای رخ داد')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2">تکمیل اطلاعات</h2>
        <p className="text-sm text-muted-foreground">
          برای تکمیل ثبت نام، اطلاعات زیر را وارد کنید
        </p>
        <div className="mt-3 p-2 bg-secondary/50 rounded-md">
          <p className="text-xs text-muted-foreground">
            تلفن تایید شده:{' '}
            <span className="font-medium text-foreground" dir='ltr'>
              {state.phoneNumber ? maskPhoneNumber(state.phoneNumber) : ''}
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            نام و نام خانوادگی *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="نام خود را وارد کنید"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={nameError ? 'border-destructive' : ''}
            required
          />
          {nameError && (
            <p className="text-sm text-destructive">{nameError}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            ایمیل (اختیاری)
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="example@domain.com"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            className={`text-left ${emailError ? 'border-destructive' : ''}`}
            dir="ltr"
          />
          {emailError && (
            <p className="text-sm text-destructive">{emailError}</p>
          )}
          <div className="flex items-start gap-2 p-3 bg-muted/50 border border-border rounded-md">
            <Shield className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">حریم خصوصی ایمیل</p>
              <p>ما هیچ‌گونه ایمیل تبلیغاتی ارسال نمی‌کنیم. ایمیل شما فقط برای بازیابی حساب و اطلاع‌رسانی‌های مهم استفاده می‌شود.</p>
            </div>
          </div>
        </div>
      </div>

      {state.error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{state.error}</p>
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={state.isLoading || !name.trim() || nameError !== '' || emailError !== ''}
      >
        {state.isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            در حال تکمیل...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            تکمیل ثبت نام
            <ArrowRight className="w-4 h-4" />
          </div>
        )}
      </Button>
    </form>
  )
}
