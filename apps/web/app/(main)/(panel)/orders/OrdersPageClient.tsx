'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/card'
import { Button } from '@shadcn/button'
import { Badge } from '@shadcn/badge'
import { Input } from '@shadcn/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shadcn/select'
import { 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Search,
  Filter
} from 'lucide-react'
import { OrderCard } from '@ui/components/panel/OrderCard'
import type { OrderWithDynamicRelations, OrderStats } from '@actions/orders/types'
import { useRouter } from 'next/navigation'

interface OrdersPageClientProps {
  initialOrders: OrderWithDynamicRelations<{
    items: { product: true }
    discount: true
  }>[]
  initialStats: OrderStats
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
}

export default function OrdersPageClient({ initialOrders, initialStats }: OrdersPageClientProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [stats, setStats] = useState(initialStats)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const orderItems = order.items as any[] | undefined
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (orderItems && Array.isArray(orderItems) && orderItems.some((item: any) => 
        item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleViewDetails = (orderId: string) => {
    router.push(`/orders/${orderId}`)
  }

  const handleTrackOrder = (orderId: string) => {
    router.push(`/orders/${orderId}/track`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">سفارش‌ها</h1>
          <p className="text-muted-foreground mt-2">
            مشاهده و مدیریت سفارش‌های خود
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">کل سفارش‌ها</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">در انتظار پرداخت</p>
                <p className="text-2xl font-bold">{stats.pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تکمیل شده</p>
                <p className="text-2xl font-bold">{stats.shippedOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">کل خرید</p>
                <p className="text-xl font-bold">{formatPrice(stats.totalSpent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="جستجو در سفارش‌ها..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="وضعیت سفارش" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه سفارش‌ها</SelectItem>
                  <SelectItem value="pending">در انتظار پرداخت</SelectItem>
                  <SelectItem value="paid">پرداخت شده</SelectItem>
                  <SelectItem value="shipped">ارسال شده</SelectItem>
                  <SelectItem value="cancelled">لغو شده</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted/30 p-6 mb-4">
              <Package className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h3 className="font-medium text-lg mb-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'سفارشی با این معیارها یافت نشد' 
                : 'هنوز سفارشی ثبت نکرده‌اید'
              }
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              {searchTerm || statusFilter !== 'all'
                ? 'فیلترهای مختلفی را امتحان کنید یا جستجوی جدیدی انجام دهید'
                : 'محصولات مورد علاقه خود را انتخاب کرده و اولین سفارش خود را ثبت کنید'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => router.push('/products')}>
                مشاهده محصولات
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={{
                ...order,
                items: order.items || [],
                discount: order.discount ? {
                  id: order.discount.id,
                  code: order.discount.code,
                  amount: order.discountAmount || 0
                } : null
              }}
              onViewDetails={handleViewDetails}
              onTrackOrder={handleTrackOrder}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {filteredOrders.length > 0 && filteredOrders.length >= 20 && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => {/* TODO: Implement pagination */}}
            disabled={isLoading}
          >
            {isLoading ? 'در حال بارگذاری...' : 'نمایش بیشتر'}
          </Button>
        </div>
      )}
    </div>
  )
}
