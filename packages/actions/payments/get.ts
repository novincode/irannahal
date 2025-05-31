'use server'
import { db } from "@packages/db"
import { payments, orders, orderItems, products } from "@packages/db/schema"
import { eq, desc, and, isNull } from "drizzle-orm"
import { withAuth } from "../utils"
import type { PaymentWithOrder } from "./types"

export async function getUserPayments(): Promise<PaymentWithOrder[]> {
  return withAuth(async (user) => {
    const userPayments = await db
      .select({
        payment: payments,
        order: orders,
      })
      .from(payments)
      .leftJoin(orders, eq(payments.orderId, orders.id))
      .where(
        and(
          eq(orders.userId, user.id),
          isNull(orders.deletedAt)
        )
      )
      .orderBy(desc(payments.createdAt))
      .limit(50)

    // Get order items for each order
    const paymentsWithDetails: PaymentWithOrder[] = []
    
    for (const row of userPayments) {
      const payment = row.payment
      const order = row.order

      let orderDetails = null
      if (order) {
        // Get order items with products
        const items = await db
          .select({
            item: orderItems,
            product: {
              id: products.id,
              name: products.name,
              slug: products.slug,
            }
          })
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id))

        orderDetails = {
          ...order,
          items: items.map(item => ({
            ...item.item,
            product: item.product
          }))
        }
      }

      paymentsWithDetails.push({
        ...payment,
        order: orderDetails
      })
    }

    return paymentsWithDetails
  })
}

export async function getPaymentById(paymentId: string): Promise<PaymentWithOrder | null> {
  return withAuth(async (user) => {
    const result = await db
      .select({
        payment: payments,
        order: orders,
      })
      .from(payments)
      .leftJoin(orders, eq(payments.orderId, orders.id))
      .where(
        and(
          eq(payments.id, paymentId),
          eq(orders.userId, user.id),
          isNull(orders.deletedAt)
        )
      )
      .limit(1)

    if (!result[0]) {
      return null
    }

    const { payment, order } = result[0]
    
    let orderDetails = null
    if (order) {
      // Get order items with products
      const items = await db
        .select({
          item: orderItems,
          product: {
            id: products.id,
            name: products.name,
            slug: products.slug,
          }
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id))

      orderDetails = {
        ...order,
        items: items.map(item => ({
          ...item.item,
          product: item.product
        }))
      }
    }

    return {
      ...payment,
      order: orderDetails
    }
  })
}
