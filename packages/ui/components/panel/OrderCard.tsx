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
  Eye,
  Truck,
  AlertCircle
} from 'lucide-react'
import { formatPrice } from '@ui/lib/utils'
import type { OrderWithDynamicRelations, OrderItemWithDynamicRelations } from '@actions/orders/types'
import { format } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'

interface OrderCardProps {
  order: OrderWithDynamicRelations<{
    items: { product: true }
    discount: true
  }>
  onViewDetails?: (orderId: string) => void
  onTrackOrder?: (orderId: string) => void
}

const statusConfig = {
  pending: {
    label: 'در انتظار پرداخت',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    icon: AlertCircle,
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
    icon: AlertCircle,
  },
}

export function OrderCard({ order, onViewDetails, onTrackOrder }: OrderCardProps) {
  const status = statusConfig[order.status as keyof typeof statusConfig]
  const StatusIcon = status.icon
  
  // Type guard for items
  const orderItems = 'items' in order && Array.isArray(order.items) ? order.items : []

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/50">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">سفارش #{order.id.slice(-8)}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {order.createdAt && format(new Date(order.createdAt), 'dd MMMM yyyy', { locale: faIR })}
              </p>
            </div>
          </div>
          
          <Badge 
            variant="outline" 
            className={`${status.bgColor} ${status.textColor} border-current`}
          >
            <StatusIcon className="h-3 w-3 ml-1" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Items Summary */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">محصولات سفارش</h4>
          <div className="space-y-1">
            {orderItems.slice(0, 2).map((item: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="flex-1 truncate">
                  {item.product?.name || 'محصول'} × {item.quantity}
                </span>
                <span className="text-muted-foreground">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
            {orderItems.length > 2 && (
              <p className="text-xs text-muted-foreground">
                و {orderItems.length - 2} محصول دیگر...
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Order Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>تعداد کل محصولات:</span>
            <span>{order.items && Array.isArray(order.items) ? (order.items as any[]).reduce((sum: number, item: any) => sum + item.quantity, 0) : 0}</span>
          </div>
          
          {order.discountAmount && order.discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>تخفیف:</span>
              <span>-{formatPrice(order.discountAmount)}</span>
            </div>
          )}
          
          <div className="flex justify-between font-medium">
            <span>مجموع:</span>
            <span className="text-lg">{formatPrice(order.total)}</span>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-2"
            onClick={() => onViewDetails?.(order.id)}
          >
            <Eye className="h-4 w-4" />
            مشاهده جزئیات
          </Button>
          
          {(order.status === 'paid' || order.status === 'shipped') && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-2"
              onClick={() => onTrackOrder?.(order.id)}
            >
              <Truck className="h-4 w-4" />
              پیگیری سفارش
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default OrderCard
