'use server'

import { db } from "@db"
import { orders, orderItems, payments, users, products, discounts, addresses } from "@db/schema"
import { eq, and, desc, gte, lte, count, sum, avg, isNull, inArray } from "drizzle-orm"
import { withAuth, withRole } from "../utils"
import type { OrderWithDynamicRelations, OrderFilters, OrderStats } from "./types"

export async function getOrders<TRelations extends Record<string, any> = {}>(
  filters?: OrderFilters,
  relations?: TRelations
): Promise<OrderWithDynamicRelations<TRelations>[]> {
  return withAuth(async (user) => {
    // Build conditions
    const conditions = []
    
    // User filter (for admin or specific user orders)
    if (filters?.userId) {
      // Only admins can filter by specific userId
      if (user.role !== 'admin') {
        throw new Error("Unauthorized: Admin access required")
      }
      conditions.push(eq(orders.userId, filters.userId))
    } else if (user.role !== 'admin') {
      // Non-admin users can only see their own orders
      conditions.push(eq(orders.userId, user.id))
    }

  if (filters?.status) {
    conditions.push(eq(orders.status, filters.status))
  }

  if (filters?.dateFrom) {
    conditions.push(gte(orders.createdAt, filters.dateFrom))
  }

  if (filters?.dateTo) {
    conditions.push(lte(orders.createdAt, filters.dateTo))
  }

  // Add null check for deletedAt
  conditions.push(isNull(orders.deletedAt))

  // Build base query
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined
  
  const baseQuery = db
    .select({
      id: orders.id,
      userId: orders.userId,
      discountId: orders.discountId,
      discountAmount: orders.discountAmount,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      deletedAt: orders.deletedAt,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .$dynamic()

  let query = baseQuery

  if (whereClause) {
    query = query.where(whereClause)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.offset(filters.offset)
  }

  const result = await query

  // Handle relations separately to avoid complex joins
  const ordersWithRelations = await Promise.all(
    result.map(async (order) => {
      const orderWithRelations: any = { ...order }

      // Add user relation
      if (relations?.user && order.userId) {
        const user = await db.query.users.findFirst({
          where: eq(users.id, order.userId),
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            deletedAt: true,
          }
        })
        orderWithRelations.user = user
      }

      // Add items relation
      if (relations?.items) {
        const items = await db
          .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            productId: orderItems.productId,
            quantity: orderItems.quantity,
            price: orderItems.price,
          })
          .from(orderItems)
          .where(
            and(
              eq(orderItems.orderId, order.id),
              isNull(orderItems.deletedAt)
            )
          )

        // Add product data if requested
        const itemsWithProducts = await Promise.all(
          items.map(async (item) => {
            const itemWithProduct: any = { ...item }
            if (relations.items?.product) {
              const product = await db.query.products.findFirst({
                where: eq(products.id, item.productId),
                columns: {
                  id: true,
                  name: true,
                  slug: true,
                  description: true,
                  price: true,
                }
              })
              itemWithProduct.product = product
            }
            return itemWithProduct
          })
        )
        
        orderWithRelations.items = itemsWithProducts
      }

      // Add discount relation
      if (relations?.discount && order.discountId) {
        const discount = await db.query.discounts.findFirst({
          where: eq(discounts.id, order.discountId),
          columns: {
            id: true,
            code: true,
            type: true,
            value: true,
          }
        })
        orderWithRelations.discount = discount
      }

      // Add payments relation
      if (relations?.payments) {
        const paymentsData = await db
          .select()
          .from(payments)
          .where(eq(payments.orderId, order.id))
        orderWithRelations.payments = paymentsData
      }

      // Add address relation
      if (relations?.address) {
        // For now, we'll add this when address is connected to orders
        orderWithRelations.address = null
      }

      return orderWithRelations
    })
  )

    return ordersWithRelations as OrderWithDynamicRelations<TRelations>[]
  })
}

export async function getOrder<TRelations extends Record<string, any> = {}>(
  orderId: string,
  relations?: TRelations
): Promise<OrderWithDynamicRelations<TRelations> | null> {
  return withAuth(async (user) => {
    const orders = await getOrders({ 
      userId: user.role === 'admin' ? undefined : user.id 
    }, relations)
    
    return orders.find(order => order.id === orderId) || null
  })
}

export async function getOrderStats(userId?: string): Promise<OrderStats> {
  return withAuth(async (user) => {
    // Non-admin users can only see their own stats
    const targetUserId = user.role === 'admin' ? userId : user.id

    const conditions = [isNull(orders.deletedAt)]
    if (targetUserId) {
      conditions.push(eq(orders.userId, targetUserId))
    }

    // Get total orders count
    const [totalOrdersResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(and(...conditions))

    // Get orders by status
    const [pendingResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(and(...conditions, eq(orders.status, 'pending')))

    const [paidResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(and(...conditions, eq(orders.status, 'paid')))

    const [shippedResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(and(...conditions, eq(orders.status, 'shipped')))

    const [cancelledResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(and(...conditions, eq(orders.status, 'cancelled')))

    // Get total spent (sum of paid orders)
    const [totalSpentResult] = await db
      .select({ total: sum(orders.total) })
      .from(orders)
      .where(and(...conditions, eq(orders.status, 'paid')))

    // Get average order value
    const [avgOrderResult] = await db
      .select({ average: avg(orders.total) })
      .from(orders)
      .where(and(...conditions))

    return {
      totalOrders: totalOrdersResult.count || 0,
      pendingOrders: pendingResult.count || 0,
      paidOrders: paidResult.count || 0,
      shippedOrders: shippedResult.count || 0,
      cancelledOrders: cancelledResult.count || 0,
      totalSpent: Number(totalSpentResult.total) || 0,
      averageOrderValue: Number(avgOrderResult.average) || 0,
    }
  })
}