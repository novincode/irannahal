'use client'

import React, { useState } from 'react'
import { Button } from '@ui/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@ui/components/ui/radio-group'
import { Label } from '@ui/components/ui/label'
import { Badge } from '@ui/components/ui/badge'
import { useCheckout } from '../CheckoutContext'
import { useCartStore } from '@data/useCartStore'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  MdCreditCard, 
  MdAccountBalance, 
  MdPayment,
  MdSecurity,
  MdArrowBack,
  MdArrowForward
} from 'react-icons/md'
import { formatPrice } from '@ui/lib/utils'

type PaymentGateway = {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  fee: number
  isAvailable: boolean
  badge?: string
}

const PAYMENT_GATEWAYS: PaymentGateway[] = [
  {
    id: 'zarinpal',
    name: 'زرین‌پال',
    description: 'پرداخت امن با کارت‌های بانکی',
    icon: <MdCreditCard className="h-6 w-6" />,
    fee: 0,
    isAvailable: true,
    badge: 'پرطرفدار'
  },
  {
    id: 'mellat',
    name: 'بانک ملت',
    description: 'درگاه پرداخت بانک ملت',
    icon: <MdAccountBalance className="h-6 w-6" />,
    fee: 0,
    isAvailable: true
  },
  {
    id: 'parsian',
    name: 'بانک پارسیان',
    description: 'درگاه پرداخت بانک پارسیان',
    icon: <MdPayment className="h-6 w-6" />,
    fee: 0,
    isAvailable: true
  }
]

export function PaymentStep() {
  const { state, setStep } = useCheckout()
  const [selectedGateway, setSelectedGateway] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const clearCart = useCartStore((s) => s.clearCart)
  const router = useRouter()

  const items = useCartStore((s) => s.items)
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0)
  const shippingCost = state.selectedShippingMethod?.price || 0
  const total = subtotal + shippingCost

  const handlePayment = async () => {
    if (!selectedGateway) {
      toast.error('لطفاً درگاه پرداخت را انتخاب کنید')
      return
    }

    if (!state.orderId) {
      toast.error('خطا در ایجاد سفارش')
      return
    }

    setIsProcessing(true)

    try {
      // Navigate to payment page with order ID and selected gateway
      router.push(`/panel/orders/${state.orderId}/payment?gateway=${selectedGateway}`)
      
      toast.success('در حال انتقال به درگاه پرداخت...')
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('خطا در انتقال به درگاه پرداخت')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBack = () => {
    setStep('review')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdSecurity className="h-5 w-5" />
            انتخاب روش پرداخت
          </CardTitle>
          <CardDescription>
            درگاه پرداخت مورد نظر خود را انتخاب کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedGateway} onValueChange={setSelectedGateway}>
            <div className="space-y-3">
              {PAYMENT_GATEWAYS.map((gateway) => (
                <div
                  key={gateway.id}
                  className={`relative rounded-lg border p-4 cursor-pointer transition-colors ${
                    selectedGateway === gateway.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  } ${!gateway.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem
                      value={gateway.id}
                      id={gateway.id}
                      disabled={!gateway.isAvailable}
                    />
                    <Label
                      htmlFor={gateway.id}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between flex-1">
                        <div className="flex items-center gap-3">
                          <div className="text-primary">
                            {gateway.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{gateway.name}</span>
                              {gateway.badge && (
                                <Badge variant="secondary" className="text-xs">
                                  {gateway.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {gateway.description}
                            </p>
                          </div>
                        </div>
                        <div className="">
                          {gateway.fee > 0 ? (
                            <span className="text-sm text-muted-foreground">
                              کارمزد: {formatPrice(gateway.fee)}
                            </span>
                          ) : (
                            <span className="text-sm text-green-600">
                              بدون کارمزد
                            </span>
                          )}
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>خلاصه پرداخت</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>جمع کالاها:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>هزینه ارسال:</span>
              <span>{formatPrice(shippingCost)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>مبلغ قابل پرداخت:</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <MdArrowBack className="h-4 w-4" />
          بازگشت
        </Button>
        
        <Button
          onClick={handlePayment}
          disabled={!selectedGateway || isProcessing}
          className="flex items-center gap-2"
        >
          {isProcessing ? (
            'در حال پردازش...'
          ) : (
            <>
              پرداخت
              <MdArrowForward className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
