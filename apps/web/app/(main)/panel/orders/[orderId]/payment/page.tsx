'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/components/ui/card'
import { Button } from '@ui/components/ui/button'
import { Badge } from '@ui/components/ui/badge'
import { Container } from '@ui/components/ui/container'
import { toast } from 'sonner'
import { 
  MdPayment, 
  MdSecurity, 
  MdCheckCircle, 
  MdError,
  MdHourglassTop,
  MdArrowBack
} from 'react-icons/md'
import { formatPrice } from '@ui/lib/utils'

type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed'

export default function PaymentPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const orderId = params.orderId as string
  const gateway = searchParams.get('gateway')
  
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending')
  const [paymentData, setPaymentData] = useState<any>(null)
  
  useEffect(() => {
    if (!orderId || !gateway) {
      toast.error('اطلاعات پرداخت ناقص است')
      router.push('/panel/orders')
      return
    }
    
    // Simulate payment processing
    initiatePayment()
  }, [orderId, gateway])

  const initiatePayment = async () => {
    setPaymentStatus('processing')
    
    try {
      // Simulate API call to initiate payment
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock payment data
      const mockPaymentData = {
        orderId,
        gateway,
        amount: 1250000, // Mock amount
        transactionId: `TXN${Date.now()}`,
        paymentUrl: `https://${gateway}.ir/payment/${orderId}`
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
    setPaymentStatus('pending')
    setTimeout(initiatePayment, 1000)
  }

  const handleBackToOrders = () => {
    router.push('/panel/orders')
  }

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'pending':
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
      case 'pending':
        return 'آماده‌سازی پرداخت...'
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
      case 'pending':
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
            شماره سفارش: #{orderId}
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
            {paymentData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">درگاه پرداخت:</span>
                    <p className="font-medium capitalize">{paymentData.gateway}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">مبلغ:</span>
                    <p className="font-medium">{formatPrice(paymentData.amount)}</p>
                  </div>
                  {paymentData.transactionId && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">شماره تراکنش:</span>
                      <p className="font-medium font-mono">{paymentData.transactionId}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {paymentStatus === 'processing' && (
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">
                  لطفاً منتظر بمانید، پرداخت در حال پردازش است...
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                  <MdSecurity className="h-4 w-4" />
                  پرداخت امن
                </div>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="text-center space-y-4">
                <p className="text-green-600 font-medium">
                  پرداخت شما با موفقیت انجام شد!
                </p>
                <p className="text-muted-foreground text-sm">
                  سفارش شما ثبت شده و به زودی ارسال خواهد شد.
                </p>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="text-center space-y-4">
                <p className="text-red-600 font-medium">
                  پرداخت ناموفق بود
                </p>
                <p className="text-muted-foreground text-sm">
                  لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.
                </p>
              </div>
            )}

            <div className="flex justify-center gap-4">
              {paymentStatus === 'failed' && (
                <Button onClick={handleRetryPayment} variant="default">
                  تلاش مجدد
                </Button>
              )}
              
              <Button 
                onClick={handleBackToOrders} 
                variant={paymentStatus === 'failed' ? 'outline' : 'default'}
                className="flex items-center gap-2"
              >
                <MdArrowBack className="h-4 w-4" />
                {paymentStatus === 'success' ? 'مشاهده سفارشات' : 'بازگشت'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}