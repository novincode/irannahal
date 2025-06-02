'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/card'
import { Badge } from '@shadcn/badge'
import { Button } from '@shadcn/button'
import { Separator } from '@shadcn/separator'
import { 
  Package, 
  MapPin, 
  Calendar,
  CreditCard,
  User,
  Phone,
  Truck,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import { format } from 'date-fns-jalali'
import { formatPrice } from '@ui/lib/utils'
import { faIR } from 'date-fns-jalali/locale'
import type { OrderWithDynamicRelations } from '@actions/orders/types'

interface OrderDetailsProps {
  order: {
    id: string
    status: "pending" | "paid" | "shipped" | "cancelled"
    total: number
    discountAmount?: number | null
    createdAt: Date | null
    updatedAt: Date | null
    items?: Array<{
      id: string
      quantity: number
      price: number
      product?: {
        id: string
        name: string
        description?: string | null
        image?: string | null
      } | null
    }>
    discount?: {
      id: string
      code: string
      value: number
    } | null
    payments?: Array<{
      id: string
      amount: number
      status: "pending" | "completed" | "failed"
      method: string
      createdAt: Date | null
    }>
  }
  onUpdateStatus?: (orderId: string, status: "pending" | "paid" | "shipped" | "cancelled") => void
  isAdmin?: boolean
}

const statusConfig = {
  pending: {
    label: 'در انتظار پرداخت',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    icon: Clock,
  },
  paid: {
    label: 'پرداخت شده',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    icon: CreditCard,
  },
  shipped: {
    label: 'ارسال شده',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    icon: Truck,
  },
  cancelled: {
    label: 'لغو شده',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    icon: XCircle,
  },
}

export function OrderDetails({ order, onUpdateStatus, isAdmin = false }: OrderDetailsProps) {
  const status = statusConfig[order.status as keyof typeof statusConfig]
  const StatusIcon = status.icon

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">سفارش #{order.id.slice(-8)}</CardTitle>
                <p className="text-muted-foreground">
                  {order.createdAt && (
                    <>ثبت شده در {format(new Date(order.createdAt), 'dd MMMM yyyy - HH:mm', { locale: faIR })}</>
                  )}
                </p>
              </div>
            </div>
            
            <Badge 
              variant="outline" 
              className={`${status.bgColor} ${status.textColor} border-current text-base px-3 py-2`}
            >
              <StatusIcon className="h-4 w-4 ml-2" />
              {status.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {/* Admin Status Update */}
          {isAdmin && (
            <div className="flex gap-2 mb-4">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onUpdateStatus?.(order.id, 'paid')}
                disabled={order.status !== 'pending'}
              >
                علامت‌گذاری پرداخت شده
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onUpdateStatus?.(order.id, 'shipped')}
                disabled={order.status !== 'paid'}
              >
                علامت‌گذاری ارسال شده
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onUpdateStatus?.(order.id, 'cancelled')}
                disabled={order.status === 'cancelled'}
              >
                لغو سفارش
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            محصولات سفارش
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-lg border">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium">{item.product?.name || 'محصول'}</h4>
                  <p className="text-sm text-muted-foreground">
                    قیمت واحد: {formatPrice(item.price)}
                  </p>
                </div>
                
                <div className="text-left">
                  <p className="font-medium">تعداد: {item.quantity}</p>
                  <p className="text-lg font-bold">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            خلاصه سفارش
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>جمع محصولات:</span>
              <span>{formatPrice(order.total + (order.discountAmount || 0))}</span>
            </div>
            
            {order.discountAmount && order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>تخفیف:</span>
                <span>-{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between text-lg font-bold">
              <span>مبلغ نهایی:</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Payment History */}
      {order.payments && order.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              تاریخچه پرداخت
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.payments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      payment.status === 'completed' ? 'bg-green-500' : 
                      payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium">
                        {payment.method === 'bank_transfer' ? 'انتقال بانکی' :
                         payment.method === 'card' ? 'کارت بانکی' :
                         payment.method === 'wallet' ? 'کیف پول' :
                         payment.method === 'cash_on_delivery' ? 'پرداخت در محل' :
                         payment.method}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.createdAt && format(new Date(payment.createdAt), 'dd MMMM yyyy - HH:mm', { locale: faIR })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <p className="font-bold">{formatPrice(payment.amount)}</p>
                    <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                      {payment.status === 'completed' ? 'موفق' : 
                       payment.status === 'pending' ? 'در انتظار' : 'ناموفق'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default OrderDetails
