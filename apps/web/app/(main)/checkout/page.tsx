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
import { useCartStore } from '@data/useCartStore'
import { Card, CardContent } from '@ui/components/ui/card'
import { Button } from '@ui/components/ui/button'
import { MdOutlineShoppingCart } from 'react-icons/md'
import Link from 'next/link'

function CheckoutContent() {
  const { state } = useCheckout()
  const items = useCartStore((s) => s.items)
  const isEmpty = items.length === 0

  // Show empty cart message if no items
  if (isEmpty) {
    return (
      <Container className="py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">تکمیل خرید</h1>
            <p className="text-muted-foreground">
              برای تکمیل خرید خود مراحل زیر را طی کنید
            </p>
          </div>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted/30 p-6 mb-6">
                <MdOutlineShoppingCart className="h-16 w-16 text-muted-foreground/50" />
              </div>
              <h3 className="font-semibold text-xl mb-3">سبد خرید شما خالی است</h3>
              <p className="text-muted-foreground text-base mb-8 max-w-md">
                هیچ محصولی در سبد خرید شما وجود ندارد. لطفاً ابتدا محصولات مورد نظر خود را به سبد خرید اضافه کنید.
              </p>
              <Button asChild size="lg" className="px-8">
                <Link href="/products">
                  مشاهده محصولات
                  <MdOutlineShoppingCart className="mr-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Container>
    )
  }

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