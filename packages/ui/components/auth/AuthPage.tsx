'use client'
import React from 'react'
import { Button } from '@shadcn/button'
import { signIn } from 'next-auth/react'
import OTPForm from './OTPForm'
import { FcGoogle } from 'react-icons/fc'

const AuthPage = () => {
  return (
    <div className="min-h-[60vh] flex  flex-col items-center justify-center gap-8 py-12">
      <div className="w-full max-w-sm bg-card border rounded-xl shadow p-8 flex flex-col gap-6 items-center">
        <h1 className="text-2xl font-bold mb-2">ورود به حساب کاربری</h1>
        <Button
          variant="outline"
          size="lg"
          className="w-full flex items-center gap-2 justify-center"
          onClick={() => signIn('google', {callbackUrl: "http://localhost:3005"})}
        >
          <FcGoogle className="w-5 h-5" />
          ورود با گوگل
        </Button>
        <div className="w-full flex items-center gap-2 my-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">یا</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <OTPForm />
      </div>
    </div>
  )
}

export default AuthPage