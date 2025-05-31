import React from 'react'
import { getOrders, getOrderStats } from '@actions/orders/get'
import OrdersPageClient from './OrdersPageClient'
import { auth } from '@packages/auth'
import { redirect } from 'next/navigation'

export default async function OrdersPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth')
  }

  // Fetch user orders with relations
  const orders = await getOrders(
    { 
      userId: session.user.id,
      limit: 20,
      offset: 0 
    },
    { 
      items: { product: true },
      discount: true 
    }
  )

  // Get order statistics
  const stats = await getOrderStats(session.user.id)

  return (
    <OrdersPageClient 
      initialOrders={orders} 
      initialStats={stats}
    />
  )
}
