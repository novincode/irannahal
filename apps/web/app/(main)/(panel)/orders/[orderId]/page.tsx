import React from 'react'
import { getOrder } from '@actions/orders/get'
import { auth } from '@packages/auth'
import { redirect, notFound } from 'next/navigation'
import OrderDetailsClient from './OrderDetailsClient'
import type { Session } from 'next-auth'
import type { UserRole } from '@db/schema'

interface OrderDetailsPageProps {
  params: Promise<{ orderId: string }>
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { orderId } = await params
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth')
  }

  // Fetch order with all relations
  const order = await getOrder(
    orderId,
    { 
      items: { product: true },
      discount: true,
      payments: true,
      address: true,
      user: true
    }
  )

  if (!order) {
    notFound()
  }

  // Check if user has access to this order
  const userRole = (session.user as { role: UserRole })?.role
  if (userRole !== 'admin' && order.userId !== session.user.id) {
    redirect('/orders')
  }

  return (
    <OrderDetailsClient 
      order={order}
      isAdmin={userRole === 'admin'}
    />
  )
}
