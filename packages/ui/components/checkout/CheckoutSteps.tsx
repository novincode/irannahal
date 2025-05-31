
'use client'

import React from 'react'
import { cn } from '@ui/lib/utils'
import { CheckIcon, UserIcon, MapPinIcon, TruckIcon, EyeIcon, CreditCardIcon } from 'lucide-react'
import { useCheckout } from './CheckoutContext'
import type { CheckoutStep } from './types'

const stepConfig = {
  auth: { icon: UserIcon, label: 'ورود' },
  address: { icon: MapPinIcon, label: 'آدرس' },
  shipping: { icon: TruckIcon, label: 'ارسال' },
  review: { icon: EyeIcon, label: 'بررسی' },
  payment: { icon: CreditCardIcon, label: 'پرداخت' }
}

const stepOrder: CheckoutStep[] = ['auth', 'address', 'shipping', 'review', 'payment']

export function CheckoutSteps() {
  const { state } = useCheckout()
  const currentStepIndex = stepOrder.indexOf(state.currentStep)

  return (
    <div className="w-full bg-card border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        {stepOrder.map((step, index) => {
          const { icon: Icon, label } = stepConfig[step]
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const isDisabled = index > currentStepIndex

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isCurrent && "border-primary text-primary bg-primary/10",
                    isDisabled && "border-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium mt-2 transition-colors",
                    isCompleted && "text-primary",
                    isCurrent && "text-primary",
                    isDisabled && "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>
              
              {index < stepOrder.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-colors",
                    isCompleted && "bg-primary",
                    !isCompleted && "bg-muted"
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
