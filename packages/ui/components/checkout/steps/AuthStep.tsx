
'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@shadcn/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@shadcn/drawer'
import { UserIcon, LogInIcon } from 'lucide-react'
import { useCheckout } from '../CheckoutContext'
import AuthPage from '@ui/components/auth/AuthPage'

export function AuthStep() {
  const { data: session, status } = useSession()
  const { state, setAuthenticated, proceedToNext } = useCheckout()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Update auth state based on session
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setAuthenticated(true)
      if (state.currentStep === 'auth') {
        proceedToNext()
      }
    } else if (status === 'unauthenticated') {
      setAuthenticated(false)
    }
  }, [session, status, setAuthenticated, proceedToNext, state.currentStep])

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="bg-card border rounded-lg p-6">
        <div className="text-center">در حال بررسی احراز هویت...</div>
      </div>
    )
  }

  // User is authenticated
  if (status === 'authenticated' && session?.user) {
    return (
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center gap-3 text-green-600">
          <UserIcon className="w-5 h-5" />
          <span className="font-medium">
            خوش آمدید {session.user.name || session.user.email}
          </span>
        </div>
      </div>
    )
  }

  // User needs to authenticate
  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
          <UserIcon className="w-8 h-8 text-muted-foreground" />
        </div>
        
        <h3 className="text-lg font-semibold">ورود به حساب کاربری</h3>
        <p className="text-muted-foreground">
          برای ادامه فرآیند خرید، لطفاً وارد حساب کاربری خود شوید
        </p>

        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button size="lg" className="gap-2">
              <LogInIcon className="w-4 h-4" />
              ورود / ثبت نام سریع
            </Button>
          </DrawerTrigger>
          
          <DrawerContent className="max-w-md mx-auto">
            <DrawerHeader>
              <DrawerTitle>ورود به حساب کاربری</DrawerTitle>
            </DrawerHeader>
            
            <div className="p-6">
              <AuthPage />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}
