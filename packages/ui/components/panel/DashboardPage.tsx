'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { UserStatsCard } from './UserStatsCard'
import { UserRecentOrders } from './UserRecentOrders'
import { UserQuickActions } from './UserQuickActions'
import { formatPrice } from '@ui/lib/utils'
import type { OrderStats } from '@actions/orders/types'
import type { OrderWithDynamicRelations } from '@actions/orders/types'

interface UserDashboardPageProps {
  stats: OrderStats
  recentOrders: OrderWithDynamicRelations<{
    items: { product: true }
    discount: true
  }>[]
  onViewOrderDetails?: (orderId: string) => void
}

export function UserDashboardPage({ 
  stats, 
  recentOrders, 
  onViewOrderDetails 
}: UserDashboardPageProps) {
  const { data: session } = useSession()

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">داشبورد کاربری</h1>
        <p className="text-muted-foreground mt-2">
          خوش آمدید، {session?.user?.name || 'کاربر گرامی'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <UserStatsCard
          title="کل سفارش‌ها"
          value={stats.totalOrders}
          icon="ShoppingBag"
          description="از ابتدای عضویت"
        />
        
        <UserStatsCard
          title="سفارش‌های در انتظار"
          value={stats.pendingOrders}
          icon="Clock"
          description="نیاز به پرداخت"
        />
        
        <UserStatsCard
          title="سفارش‌های ارسال شده"
          value={stats.shippedOrders}
          icon="Package"
          description="تحویل موفق"
        />
        
        <UserStatsCard
          title="مجموع خرید"
          value={stats.totalSpent}
          icon="TrendingUp"
          isRevenue
          description="کل مبلغ خریدها"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - Takes 2 columns */}
        <div className="lg:col-span-2">
          <UserRecentOrders 
            orders={recentOrders}
            onViewDetails={onViewOrderDetails}
          />
        </div>
        
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <UserQuickActions />
        </div>
      </div>

      {/* Additional User Info */}
      {stats.averageOrderValue > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UserStatsCard
            title="میانگین ارزش سفارش"
            value={stats.averageOrderValue}
            icon="TrendingUp"
            isRevenue
            description="بر اساس سفارش‌های شما"
          />
          
          <UserStatsCard
            title="درصد سفارش‌های موفق"
            value={`${stats.totalOrders > 0 ? ((stats.shippedOrders / stats.totalOrders) * 100).toFixed(1) : 0}%`}
            icon="Package"
            description="نرخ تکمیل سفارش‌ها"
          />
        </div>
      )}
    </div>
  )
}

export default UserDashboardPage