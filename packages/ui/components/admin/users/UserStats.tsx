'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@shadcn/card"
import { formatPrice } from "@ui/lib/utils"
import { UserStatsCard } from '@ui/components/panel/UserStatsCard'
import { getOrderStats } from '@actions/orders/get'

interface UserStats {
  totalOrders: number
  totalSpent: number
  pendingOrders: number
  shippedOrders: number
  averageOrderValue: number
  paidOrders: number
  cancelledOrders: number
  deliveredOrders: number
}

interface UserStatsProps {
  userId: string
}

export function UserStats({ userId }: UserStatsProps) {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        // Use the server action directly
        const data = await getOrderStats(userId)
        setStats(data)
      } catch (error) {
        console.error('Error fetching user stats:', error)
        setStats(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [userId])

  if (isLoading) {
    return <div>در حال بارگذاری...</div>
  }

  if (!stats) {
    return <div>اطلاعات آماری در دسترس نیست</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      {stats.averageOrderValue > 0 && (
        <UserStatsCard
          title="میانگین ارزش سفارش"
          value={stats.averageOrderValue}
          icon="TrendingUp"
          isRevenue
          description="میانگین مبلغ هر سفارش"
        />
      )}
    </div>
  )
}