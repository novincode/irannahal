import React from 'react'
import { auth } from '@auth'
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/card'
import { Button } from '@shadcn/button'
import { Badge } from '@shadcn/badge'
import { 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  Clock,
  User,
  Package
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()

  // Mock data - you'll replace this with real data from your database
  const stats = {
    totalOrders: 12,
    pendingOrders: 2,
    totalSpent: 1250000,
    savedAddresses: 3,
  }

  const recentOrders = [
    {
      id: '1',
      status: 'shipped',
      total: 125000,
      itemsCount: 2,
      createdAt: new Date('2024-12-01'),
    },
    {
      id: '2', 
      status: 'pending',
      total: 89000,
      itemsCount: 1,
      createdAt: new Date('2024-11-28'),
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">در انتظار پرداخت</Badge>
      case 'paid':
        return <Badge variant="default">پرداخت شده</Badge>
      case 'shipped':
        return <Badge variant="default" className="bg-green-500">ارسال شده</Badge>
      case 'cancelled':
        return <Badge variant="destructive">لغو شده</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">داشبورد</h1>
        <p className="text-muted-foreground mt-2">
          خوش آمدید، {session?.user?.name || 'کاربر گرامی'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">کل سفارش‌ها</CardTitle>
            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">سفارش‌های در انتظار</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">کل خرید</CardTitle>
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalSpent.toLocaleString()} ت
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">آدرس‌های ذخیره شده</CardTitle>
            <MapPin className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.savedAddresses}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>آخرین سفارش‌ها</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/panel/orders">مشاهده همه</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">هنوز سفارشی ثبت نکرده‌اید</p>
              <Button className="mt-4" asChild>
                <Link href="/products">شروع خرید</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div>
                      <p className="font-medium">سفارش #{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.itemsCount} کالا • {order.total.toLocaleString()} تومان
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.createdAt.toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    {getStatusBadge(order.status)}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/panel/orders/${order.id}`}>جزئیات</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>دسترسی سریع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/panel/addresses">
                <MapPin className="h-6 w-6" />
                مدیریت آدرس‌ها
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/panel/orders">
                <ShoppingBag className="h-6 w-6" />
                پیگیری سفارش‌ها
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/panel/payments">
                <CreditCard className="h-6 w-6" />
                تاریخچه پرداخت‌ها
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}