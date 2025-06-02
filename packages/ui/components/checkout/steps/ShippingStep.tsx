
'use client'

import React, { useState } from 'react'
import { Button } from '@shadcn/button'
import { RadioGroup, RadioGroupItem } from '@shadcn/radio-group'
import { Label } from '@shadcn/label'
import { Card, CardContent } from '@shadcn/card'
import { TruckIcon, ClockIcon, CheckIcon, ArrowLeftIcon } from 'lucide-react'
import { useCheckout } from '../CheckoutContext'
import { SHIPPING_METHODS } from '../types'
import { formatPrice } from '@ui/lib/utils'

export function ShippingStep() {
  const { state, setSelectedShipping, proceedToNext, setStep } = useCheckout()
  const [selectedMethod, setSelectedMethod] = useState<string>(state.selectedShippingMethod?.id || '')

  const handleMethodSelect = (methodId: string) => {
    const method = SHIPPING_METHODS.find(m => m.id === methodId)
    if (method) {
      setSelectedMethod(methodId)
      setSelectedShipping(method)
    }
  }

  const handleProceed = () => {
    if (selectedMethod) {
      proceedToNext()
    }
  }

  const handleBack = () => {
    setStep('address')
  }

  return (
    <div className="bg-card border rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <TruckIcon className="w-5 h-5" />
        انتخاب روش ارسال
      </h3>

      <div className="space-y-4">
        <RadioGroup value={selectedMethod} onValueChange={handleMethodSelect} className='w-full'>
          {SHIPPING_METHODS.map((method) => (
            <div key={method.id} className="relative">
              <Label
                htmlFor={method.id}
                className="cursor-pointer"
              >
                <Card className={`transition-colors flex-1 ${selectedMethod === method.id ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{method.name}</span>
                          <span className="font-semibold text-primary">
                            {formatPrice(method.price)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {method.description}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <ClockIcon className="w-4 h-4" />
                          <span>زمان ارسال: {method.estimatedDays} روز کاری</span>
                        </div>
                      </div>
                      
                      {selectedMethod === method.id && (
                        <CheckIcon className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        {selectedMethod && (
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ArrowLeftIcon className="w-4 h-4" />
              بازگشت
            </Button>
            <Button onClick={handleProceed} className="gap-2">
              ادامه
              <CheckIcon className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
