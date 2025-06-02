'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/card'
import { Button } from '@shadcn/button'
import { ScrollArea } from '@shadcn/scroll-area'
import { Separator } from '@shadcn/separator'
import { 
  Package, 
  Plus,
  ArrowRight,
  ShoppingCart
} from 'lucide-react'
import { OrderCard } from './OrderCard'
import type { OrderWithDynamicRelations } from '@actions/orders/types'
import Link from 'next/link'

interface UserRecentOrdersProps {
  orders: OrderWithDynamicRelations<{
    items: { product: true }
    discount: true
  }>[]
  onViewDetails?: (orderId: string) => void
}

export function UserRecentOrders({ orders, onViewDetails }: UserRecentOrdersProps) {
  const isEmpty = orders.length === 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            سفارش‌های اخیر
          </CardTitle>
          {!isEmpty && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/panel/orders" className="gap-2">
                مشاهده همه
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted/30 p-6 mb-4">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h3 className="font-medium text-lg mb-2">هیچ سفارشی ثبت نشده</h3>
            <p className="text-muted-foreground text-sm mb-4">
              اولین خرید خود را شروع کنید
            </p>
            <Button asChild>
              <Link href="/products" className="gap-2">
                <Plus className="h-4 w-4" />
                مشاهده محصولات
              </Link>
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onViewDetails={onViewDetails}
                  onTrackOrder={(orderId) => {
                    // Handle tracking
                    console.log('Track order:', orderId)
                  }}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
