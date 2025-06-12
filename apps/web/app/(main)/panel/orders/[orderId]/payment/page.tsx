import React from 'react'
import { getOrder } from '@actions/orders/get'
import { auth } from '@packages/auth'
import { redirect, notFound } from 'next/navigation'
import PaymentClient from './PaymentClient'
import type { UserRole } from '@db/schema'

interface PaymentPageProps {
  params: Promise<{ orderId: string }>
  searchParams: Promise<{ gateway?: string }>
}

export default async function PaymentPage({ params, searchParams }: PaymentPageProps) {
  const { orderId } = await params
  const { gateway } = await searchParams
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
      user: true
    }
  )

  if (!order) {
    notFound()
  }

  // Check if user has access to this order
  const userRole = (session.user as { role: UserRole })?.role
  if (userRole !== 'admin' && order.userId !== session.user.id) {
    redirect('/panel/orders')
  }

  // Check if order is already paid
  if (order.status === 'paid' || order.status === 'shipped') {
    redirect(`/panel/orders/${orderId}`)
  }

  return (
    <PaymentClient 
      order={order}
      selectedGateway={gateway}
    />
  )
}