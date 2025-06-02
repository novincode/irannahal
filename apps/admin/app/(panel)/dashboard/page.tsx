import React from 'react'
import { auth } from '@auth'
import { redirect } from 'next/navigation'
import { StatsCard } from '@packages/ui/components/admin/dashboard/StatsCard'
import { RevenueChart } from '@packages/ui/components/admin/dashboard/RevenueChart'
import { TopProducts } from '@packages/ui/components/admin/dashboard/TopProducts'
import { RecentOrders } from '@packages/ui/components/admin/dashboard/RecentOrders'
import { QuickActions } from '@packages/ui/components/admin/dashboard/QuickActions'
import { 
  getDashboardStats, 
  getRevenueData, 
  getTopProducts, 
  getRecentOrders 
} from '@actions/dashboard/get'
import type { UserRole } from '@db/schema'

export default async function AdminDashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth')
  }

  const userRole = (session.user as { role: UserRole })?.role
  if (userRole !== 'admin') {
    redirect('/auth')
  }

  // Admin sees all data (userId = undefined)
  const [stats, revenueData, topProducts, recentOrders] = await Promise.all([
    getDashboardStats(undefined),
    getRevenueData(undefined, 30),
    getTopProducts(undefined, 5),
    getRecentOrders(undefined, 5),
  ])

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">داشبورد مدیریت</h1>
        <p className="text-muted-foreground mt-2">
          خوش آمدید، {session?.user?.name || 'مدیر گرامی'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="کل سفارش‌ها"
          value={stats.totalOrders}
          icon="ShoppingBag"
          growth={stats.ordersGrowth}
          description="در 30 روز گذشته"
        />
        
        <StatsCard
          title="درآمد کل"
          value={stats.totalRevenue}
          icon="DollarSign"
          growth={stats.revenueGrowth}
          isRevenue
          description="در 30 روز گذشته"
        />
        
        <StatsCard
          title="سفارش‌های در انتظار"
          value={stats.pendingOrders}
          icon="Clock"
          description="نیاز به پردازش"
        />
        
        <StatsCard
          title="کل مشتریان"
          value={stats.totalCustomers}
          icon="Users"
          description="کاربران فعال"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RevenueChart 
            data={revenueData} 
            title="نمودار فروش (30 روز گذشته)"
          />
        </div>
        
        {/* Top Products */}
        <div className="lg:col-span-1">
          <TopProducts products={topProducts} />
        </div>
      </div>

      {/* Recent Orders and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders 
          orders={recentOrders} 
          showCustomer={true}
        />
        
        <QuickActions isAdmin={true} />
      </div>

      {/* Additional Admin Stats */}
      {stats.averageOrderValue > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="میانگین ارزش سفارش"
            value={stats.averageOrderValue}
            icon="TrendingUp"
            isRevenue
            description="بر اساس کل سفارش‌ها"
          />
          
          <StatsCard
            title="نرخ تکمیل سفارش"
            value={`${stats.totalOrders > 0 ? ((stats.shippedOrders / stats.totalOrders) * 100).toFixed(1) : 0}%`}
            icon="Package"
            description="سفارش‌های تحویل شده"
          />
          
          <StatsCard
            title="سفارش‌های فعال"
            value={stats.totalOrders - stats.shippedOrders}
            icon="Clock"
            description="در حال پردازش"
          />
        </div>
      )}
    </div>
  )
}
