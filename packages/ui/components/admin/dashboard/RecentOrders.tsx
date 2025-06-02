'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/card'
import { Badge } from '@shadcn/badge'
import { Button } from '@shadcn/button'
import { Clock, Package, Eye, User } from 'lucide-react'
import { formatPrice } from '@ui/lib/utils'
import Link from 'next/link'

interface RecentOrder {
  id: string
  customerName: string
  status: string
  total: number
  itemsCount: number
  createdAt: Date
}

interface RecentOrdersProps {
  orders: RecentOrder[]
  showCustomer?: boolean
  title?: string
}

const statusConfig = {
  pending: {
    label: 'در انتظار پرداخت',
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  },
  paid: {
    label: 'پرداخت شده',
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  },
  shipped: {
    label: 'ارسال شده',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800 hover:bg-green-200',
  },
  cancelled: {
    label: 'لغو شده',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 hover:bg-red-200',
  },
}

export function RecentOrders({ 
  orders, 
  showCustomer = false, 
  title = "آخرین سفارش‌ها" 
}: RecentOrdersProps) {
  const formatDate = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `${diffMins} دقیقه پیش`
    } else if (diffHours < 24) {
      return `${diffHours} ساعت پیش`
    } else if (diffDays < 7) {
      return `${diffDays} روز پیش`
    } else {
      return date.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {title}
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/panel/orders">مشاهده همه</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>هیچ سفارشی ثبت نشده</p>
              <Button size="sm" className="mt-2" asChild>
                <Link href="/products">شروع خرید</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending

              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">
                          سفارش #{order.id.slice(-8)}
                        </h4>
                        <Badge 
                          variant={status.variant}
                          className={status.className}
                        >
                          {status.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {showCustomer && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {order.customerName}
                          </div>
                        )}
                        <div>{order.itemsCount} کالا</div>
                        <div>{formatDate(order.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <div className="font-bold text-sm">
                        {formatPrice(order.total)}
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/panel/orders/${order.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
