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

    // Build base query with relations using Drizzle's with syntax
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    
    // Use Drizzle's query builder with relations
    const ordersQuery = db.query.orders.findMany({
      where: whereClause,
      orderBy: [desc(orders.createdAt)],
      limit: filters?.limit,
      offset: filters?.offset,
      with: {
        // Add relations based on what's requested
        ...(relations?.user && {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
              deletedAt: true,
            }
          }
        }),
        ...(relations?.items && {
          items: {
            where: isNull(orderItems.deletedAt),
            with: {
              ...(relations.items?.product && {
                product: {
                  columns: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    price: true,
                  }
                }
              })
            }
          }
        }),
        ...(relations?.discount && {
          discount: {
            columns: {
              id: true,
              code: true,
              type: true,
              value: true,
            }
          }
        }),
        ...(relations?.payments && {
          payments: true
        })
      }
    })

    const result = await ordersQuery
    return result as OrderWithDynamicRelations<TRelations>[]
  })
}

export async function getOrder<TRelations extends Record<string, any> = {}>(
  orderId: string,
  relations?: TRelations
): Promise<OrderWithDynamicRelations<TRelations> | null> {
  return withAuth(async (user) => {
    // Build conditions
    const conditions = [eq(orders.id, orderId), isNull(orders.deletedAt)]
    
    // Non-admin users can only see their own orders
    if (user.role !== 'admin') {
      conditions.push(eq(orders.userId, user.id))
    }

    // Use Drizzle's query builder with relations for single order
    const order = await db.query.orders.findFirst({
      where: and(...conditions),
      with: {
        // Add relations based on what's requested
        ...(relations?.user && {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
              deletedAt: true,
            }
          }
        }),
        ...(relations?.items && {
          items: {
            where: isNull(orderItems.deletedAt),
            with: {
              ...(relations.items?.product && {
                product: {
                  columns: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    price: true,
                  }
                }
              })
            }
          }
        }),
        ...(relations?.discount && {
          discount: {
            columns: {
              id: true,
              code: true,
              type: true,
              value: true,
            }
          }
        }),
        ...(relations?.payments && {
          payments: true
        })
      }
    })

    if (!order) {
      return null
    }

    return order as OrderWithDynamicRelations<TRelations>
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

export async function getRecentOrders<TRelations extends Record<string, any> = {}>(
  userId?: string,
  limit: number = 5,
  relations?: TRelations
): Promise<OrderWithDynamicRelations<TRelations>[]> {
  return withAuth(async (user) => {
    // Non-admin users can only see their own orders
    const targetUserId = user.role === 'admin' ? userId : user.id

    const conditions = [isNull(orders.deletedAt)]
    if (targetUserId) {
      conditions.push(eq(orders.userId, targetUserId))
    }

    // Use Drizzle's query builder with relations
    const recentOrders = await db.query.orders.findMany({
      where: and(...conditions),
      orderBy: [desc(orders.createdAt)],
      limit,
      with: {
        // Add relations based on what's requested
        ...(relations?.user && {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
              deletedAt: true,
            }
          }
        }),
        ...(relations?.items && {
          items: {
            where: isNull(orderItems.deletedAt),
            with: {
              ...(relations.items?.product && {
                product: {
                  columns: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    price: true,
                  }
                }
              })
            }
          }
        }),
        ...(relations?.discount && {
          discount: {
            columns: {
              id: true,
              code: true,
              type: true,
              value: true,
            }
          }
        }),
        ...(relations?.payments && {
          payments: true
        })
      }
    })

    return recentOrders as OrderWithDynamicRelations<TRelations>[]
  })
}