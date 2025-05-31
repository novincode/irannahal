'use client'

import React from 'react'
import { CheckoutProvider } from '@ui/components/checkout/CheckoutContext'
import { CheckoutSteps } from '@ui/components/checkout/CheckoutSteps'
import { AuthStep } from '@ui/components/checkout/steps/AuthStep'
import { AddressStep } from '@ui/components/checkout/steps/AddressStep'
import { ShippingStep } from '@ui/components/checkout/steps/ShippingStep'
import { ReviewStep } from '@ui/components/checkout/steps/ReviewStep'
import { PaymentStep } from '@ui/components/checkout/steps/PaymentStep'
import { useCheckout } from '@ui/components/checkout/CheckoutContext'
import { Container } from '@ui/components/ui/container'

function CheckoutContent() {
  const { state } = useCheckout()

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 'auth':
        return <AuthStep />
      case 'address':
        return <AddressStep />
      case 'shipping':
        return <ShippingStep />
      case 'review':
        return <ReviewStep />
      case 'payment':
        return <PaymentStep />
      default:
        return <AuthStep />
    }
  }

  return (
    <Container className="py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">تکمیل خرید</h1>
          <p className="text-muted-foreground">
            برای تکمیل خرید خود مراحل زیر را طی کنید
          </p>
        </div>
        
        <CheckoutSteps />
        
        <div className="mt-8">
          {renderCurrentStep()}
        </div>
      </div>
    </Container>
  )
}

export default function CheckoutPage() {
  return (
    <CheckoutProvider>
      <CheckoutContent />
    </CheckoutProvider>
  )
}