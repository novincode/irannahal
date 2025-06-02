import React from 'react'
import { auth } from '@auth'
import { redirect } from 'next/navigation'
import { UserDashboardClient } from '@packages/ui/components/panel/UserDashboardClient'
import { getOrderStats, getRecentOrders } from '@actions/orders/get'
import type { UserRole } from '@db/schema'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth')
  }

  // Check if user is admin and redirect to admin dashboard


  // Get user-specific data
  const [stats, recentOrders] = await Promise.all([
    getOrderStats(session.user.id),
    getRecentOrders(session.user.id, 5, {
      items: { product: true },
      discount: true
    }),
  ])

  return (
    <UserDashboardClient 
      stats={stats}
      recentOrders={recentOrders}
    />
  )
}