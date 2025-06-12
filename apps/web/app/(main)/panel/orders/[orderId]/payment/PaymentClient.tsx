'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/components/ui/card'
import { Button } from '@ui/components/ui/button'
import { Badge } from '@ui/components/ui/badge'
import { Container } from '@ui/components/ui/container'
import { Separator } from '@ui/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@ui/components/ui/radio-group'
import { Label } from '@ui/components/ui/label'
import { toast } from 'sonner'
import { useCartStore } from '@data/useCartStore'
import { 
  MdPayment, 
  MdSecurity, 
  MdCheckCircle, 
  MdError,
  MdHourglassTop,
  MdArrowBack,
  MdCreditCard,
  MdAccountBalance
} from 'react-icons/md'
import { formatPrice } from '@ui/lib/utils'
import type { OrderWithDynamicRelations } from '@actions/orders/types'

type PaymentStatus = 'selecting' | 'processing' | 'success' | 'failed'

// Define payment data type
interface PaymentData {
  orderId: string
  gateway: string | null
  amount?: number
  transactionId?: string
  paymentUrl?: string
  [key: string]: unknown
}

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

interface PaymentClientProps {
  order: OrderWithDynamicRelations<{
    items: { product: true }
    discount: true
    user: true
  }>
  selectedGateway?: string
}

export default function PaymentClient({ order, selectedGateway }: PaymentClientProps) {
  const router = useRouter()
  const clearCart = useCartStore((s) => s.clearCart)
  
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('selecting')
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState<string>(selectedGateway || '')
  
  // Clear cart when arriving at payment page since order is created
  useEffect(() => {
    clearCart()
  }, [clearCart])
  
  const initiatePayment = async () => {
    if (!selectedPaymentGateway) {
      toast.error('لطفاً درگاه پرداخت را انتخاب کنید')
      return
    }

    setPaymentStatus('processing')
    
    try {
      // Simulate API call to initiate payment
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock payment data
      const mockPaymentData = {
        orderId: order.id,
        gateway: selectedPaymentGateway,
        amount: order.total,
        transactionId: `TXN${Date.now()}`,
        paymentUrl: `https://${selectedPaymentGateway}.ir/payment/${order.id}`
      }
      
      setPaymentData(mockPaymentData)
      
      // Simulate random success/failure for demo
      const isSuccess = Math.random() > 0.3 // 70% success rate
      
      if (isSuccess) {
        setPaymentStatus('success')
        toast.success('پرداخت با موفقیت انجام شد')
      } else {
        setPaymentStatus('failed')
        toast.error('پرداخت ناموفق بود')
      }
      
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentStatus('failed')
      toast.error('خطا در فرآیند پرداخت')
    }
  }

  const handleRetryPayment = () => {
    setPaymentStatus('selecting')
    setTimeout(initiatePayment, 1000)
  }

  const handleBackToOrders = () => {
    router.push('/panel/orders')
  }

  const handleBackToOrder = () => {
    router.push(`/panel/orders/${order.id}`)
  }

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'selecting':
        return <MdSecurity className="h-8 w-8 text-blue-500" />
      case 'processing':
        return <MdHourglassTop className="h-8 w-8 text-blue-500 animate-spin" />
      case 'success':
        return <MdCheckCircle className="h-8 w-8 text-green-500" />
      case 'failed':
        return <MdError className="h-8 w-8 text-red-500" />
    }
  }

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'selecting':
        return 'انتخاب روش پرداخت'
      case 'processing':
        return 'در حال پردازش پرداخت...'
      case 'success':
        return 'پرداخت موفق'
      case 'failed':
        return 'پرداخت ناموفق'
    }
  }

  const getStatusBadge = () => {
    switch (paymentStatus) {
      case 'selecting':
        return <Badge variant="secondary">انتخاب درگاه</Badge>
      case 'processing':
        return <Badge variant="secondary">در حال پردازش</Badge>
      case 'success':
        return <Badge className="bg-green-500">موفق</Badge>
      case 'failed':
        return <Badge variant="destructive">ناموفق</Badge>
    }
  }

  return (
    <Container className="py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">پرداخت سفارش</h1>
          <p className="text-muted-foreground">
            شماره سفارش: #{order.id.slice(0, 8)}
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              <MdPayment className="h-5 w-5" />
              {getStatusText()}
            </CardTitle>
            <CardDescription>
              {getStatusBadge()}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Order Summary */}
            <div>
              <h3 className="font-medium mb-3">خلاصه سفارش</h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>تعداد کالاها:</span>
                  <span>{order.items ? (order.items as any[]).length : 0} محصول</span>
                </div>
                {order.discountAmount && order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>تخفیف:</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>مبلغ قابل پرداخت:</span>
                  <span className="text-primary">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Gateway Selection */}
            {paymentStatus === 'selecting' && (
              <div>
                <h3 className="font-medium mb-3">انتخاب درگاه پرداخت</h3>
                <RadioGroup 
                  value={selectedPaymentGateway} 
                  onValueChange={setSelectedPaymentGateway}
                >
                  <div className="space-y-3">
                    {PAYMENT_GATEWAYS.map((gateway) => (
                      <div
                        key={gateway.id}
                        className={`relative rounded-lg border p-4 cursor-pointer transition-colors ${
                          selectedPaymentGateway === gateway.id
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
              </div>
            )}

            {/* Payment Processing Info */}
            {paymentStatus === 'processing' && paymentData && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">در حال انتقال به درگاه پرداخت</h3>
                <p className="text-sm text-blue-700 mb-3">
                  لطفاً منتظر بمانید تا به درگاه {paymentData.gateway} منتقل شوید
                </p>
                <div className="text-xs text-blue-600">
                  شناسه تراکنش: {paymentData.transactionId}
                </div>
              </div>
            )}

            {/* Success State */}
            {paymentStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <h3 className="font-medium text-green-900 mb-2">پرداخت با موفقیت انجام شد!</h3>
                <p className="text-sm text-green-700">
                  سفارش شما با موفقیت ثبت و پرداخت شد. به زودی آماده‌سازی و ارسال خواهد شد.
                </p>
              </div>
            )}

            {/* Failed State */}
            {paymentStatus === 'failed' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <h3 className="font-medium text-red-900 mb-2">پرداخت ناموفق بود</h3>
                <p className="text-sm text-red-700 mb-3">
                  متأسفانه پرداخت شما ناموفق بود. می‌توانید مجدداً تلاش کنید.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {paymentStatus === 'selecting' && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleBackToOrder}
                    className="flex items-center gap-2"
                  >
                    <MdArrowBack className="h-4 w-4" />
                    بازگشت به سفارش
                  </Button>
                  
                  <Button
                    onClick={initiatePayment}
                    disabled={!selectedPaymentGateway}
                    className="flex-1 flex items-center gap-2"
                  >
                    <MdPayment className="h-4 w-4" />
                    ادامه پرداخت
                  </Button>
                </>
              )}

              {paymentStatus === 'failed' && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleBackToOrders}
                    className="flex items-center gap-2"
                  >
                    <MdArrowBack className="h-4 w-4" />
                    بازگشت به سفارش‌ها
                  </Button>
                  
                  <Button
                    onClick={handleRetryPayment}
                    className="flex-1 flex items-center gap-2"
                  >
                    تلاش مجدد
                  </Button>
                </>
              )}

              {paymentStatus === 'success' && (
                <Button
                  onClick={handleBackToOrders}
                  className="w-full flex items-center gap-2"
                >
                  مشاهده سفارش‌ها
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}
