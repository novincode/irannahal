'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@shadcn/button'
import { Badge } from '@shadcn/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/card'
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react'
import { OrderDetails } from '@ui/components/panel/OrderDetails'
import { updateOrderStatus } from '@actions/orders/update'
import { toast } from 'sonner'
import type { OrderWithDynamicRelations } from '@actions/orders/types'

interface OrderDetailsClientProps {
  order: OrderWithDynamicRelations<{
    items: { product: true }
    discount: true
    payments: true
    user: true
  }>
  isAdmin?: boolean
}

const trackingSteps = [
  { status: 'pending', label: 'سفارش ثبت شد', icon: Package },
  { status: 'paid', label: 'پرداخت انجام شد', icon: CheckCircle },
  { status: 'shipped', label: 'سفارش ارسال شد', icon: Truck },
  { status: 'delivered', label: 'تحویل داده شد', icon: CheckCircle },
]

export default function OrderDetailsClient({ order: initialOrder, isAdmin = false }: OrderDetailsClientProps) {
  const [order, setOrder] = useState(initialOrder)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const router = useRouter()

  const handleUpdateStatus = async (orderId: string, newStatus: "pending" | "paid" | "shipped" | "cancelled" | "delivered") => {
    if (!isAdmin) {
      toast.error('شما مجاز به انجام این عملیات نیستید')
      return
    }

    setIsUpdating(true)
    try {
      await updateOrderStatus({
        orderId,
        status: newStatus,
      })

      setOrder(prev => ({ ...prev, status: newStatus }))
      toast.success('وضعیت سفارش با موفقیت به‌روزرسانی شد')
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error(error instanceof Error ? error.message : 'خطا در به‌روزرسانی وضعیت سفارش')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleConfirmDelivery = async () => {
    setIsUpdating(true)
    try {
      await updateOrderStatus({
        orderId: order.id,
        status: 'delivered' as const,
      })

      setOrder(prev => ({ ...prev, status: 'delivered' as const }))
      toast.success('تحویل سفارش تایید شد')
    } catch (error) {
      console.error('Error confirming delivery:', error)
      toast.error('خطا در تایید تحویل')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStepStatus = (stepStatus: string) => {
    const currentStatusIndex = trackingSteps.findIndex(step => step.status === order.status)
    const stepIndex = trackingSteps.findIndex(step => step.status === stepStatus)
    
    if (order.status === 'cancelled') {
      return stepIndex === 0 ? 'completed' : 'cancelled'
    }
    
    if (stepIndex <= currentStatusIndex) {
      return 'completed'
    } else if (stepIndex === currentStatusIndex + 1) {
      return 'current'
    } else {
      return 'upcoming'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          asChild
          className="flex items-center gap-2"
        >
          <Link href="/panel/orders">
            <ArrowLeft className="h-4 w-4" />
            بازگشت
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">جزئیات سفارش</h1>
          <p className="text-muted-foreground">
            شماره سفارش: #{order.id.slice(-8)}
          </p>
        </div>
      </div>

      {/* Order Tracking */}
      {order.status !== 'cancelled' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              پیگیری سفارش
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-6 h-0.5 bg-muted w-full max-w-[calc(100%-3rem)]" />
              
              <div className="flex justify-between relative">
                {trackingSteps.map((step, index) => {
                  const stepStatus = getStepStatus(step.status)
                  const StepIcon = step.icon
                  
                  return (
                    <div key={step.status} className="flex flex-col items-center relative">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center relative z-10
                        ${stepStatus === 'completed' ? 'bg-green-500 text-white' :
                          stepStatus === 'current' ? 'bg-blue-500 text-white' :
                          stepStatus === 'cancelled' ? 'bg-red-500 text-white' :
                          'bg-muted text-muted-foreground'}
                      `}>
                        {stepStatus === 'cancelled' ? (
                          <XCircle className="h-6 w-6" />
                        ) : stepStatus === 'completed' ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : stepStatus === 'current' ? (
                          <Clock className="h-6 w-6" />
                        ) : (
                          <StepIcon className="h-6 w-6" />
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <p className={`text-sm font-medium ${
                          stepStatus === 'completed' || stepStatus === 'current' ? 
                          'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {step.label}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancelled Order Notice */}
      {order.status === 'cancelled' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-700">
              <XCircle className="h-6 w-6" />
              <div>
                <h3 className="font-medium">سفارش لغو شده</h3>
                <p className="text-sm">این سفارش توسط شما یا فروشگاه لغو شده است.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Details Component */}
      <OrderDetails 
        order={order}
        onUpdateStatus={handleUpdateStatus}
        isAdmin={isAdmin}
      />

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          variant="outline"
          asChild
        >
          <Link href="/panel/orders">
            بازگشت به لیست سفارش‌ها
          </Link>
        </Button>
        
        {order.status === 'pending' && (
          <Button
            asChild
            disabled={isNavigating}
            className="gap-2"
          >
            <Link 
              href={`/panel/orders/${order.id}/payment`}
              onClick={() => setIsNavigating(true)}
            >
              {isNavigating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  در حال انتقال...
                </>
              ) : (
                'پرداخت'
              )}
            </Link>
          </Button>
        )}
        
        {order.status === 'shipped' && (
          <Button 
            variant="outline"
            onClick={handleConfirmDelivery}
            disabled={isUpdating}
            className="gap-2"
          >
            {isUpdating ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                در حال تایید...
              </>
            ) : (
              'تایید دریافت'
            )}
          </Button>
        )}

        {order.status === 'delivered' && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">سفارش تحویل داده شده</span>
          </div>
        )}
      </div>
    </div>
  )
}
