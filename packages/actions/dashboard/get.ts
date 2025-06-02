import { db } from '@db'
import { orders, orderItems, products, payments, users } from '@db/schema'
import { eq, sql, desc, and, gte, lte, count, sum } from 'drizzle-orm'

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  shippedOrders: number
  totalCustomers: number
  averageOrderValue: number
  revenueGrowth: number
  ordersGrowth: number
}

export interface RevenueData {
  date: string
  revenue: number
  orders: number
}

export interface TopProduct {
  id: string
  name: string
  totalSold: number
  revenue: number
}

export interface RecentOrder {
  id: string
  customerName: string
  status: string
  total: number
  itemsCount: number
  createdAt: Date
}

export async function getDashboardStats(userId?: string): Promise<DashboardStats> {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Build base conditions
    const baseConditions = userId ? [eq(orders.userId, userId)] : []
    const currentPeriodConditions = [...baseConditions, gte(orders.createdAt, thirtyDaysAgo)]
    const previousPeriodConditions = [...baseConditions, and(gte(orders.createdAt, sixtyDaysAgo), lte(orders.createdAt, thirtyDaysAgo))]

    // Get current period stats
    const [currentStats] = await db
      .select({
        totalOrders: count(orders.id),
        totalRevenue: sum(orders.total),
        pendingOrders: count(sql`CASE WHEN ${orders.status} = 'pending' THEN 1 END`),
        shippedOrders: count(sql`CASE WHEN ${orders.status} = 'shipped' THEN 1 END`),
      })
      .from(orders)
      .where(currentPeriodConditions.length > 0 ? and(...currentPeriodConditions) : undefined)

    // Get previous period stats for growth calculation
    const [previousStats] = await db
      .select({
        totalOrders: count(orders.id),
        totalRevenue: sum(orders.total),
      })
      .from(orders)
      .where(previousPeriodConditions.length > 0 ? and(...previousPeriodConditions) : undefined)

    // Get total customers (only for admin view)
    let totalCustomers = 0
    if (!userId) {
      const [customerStats] = await db
        .select({ count: count(users.id) })
        .from(users)
        .where(eq(users.role, 'customer'))
      totalCustomers = customerStats.count
    }

    const totalOrders = Number(currentStats.totalOrders) || 0
    const totalRevenue = Number(currentStats.totalRevenue) || 0
    const pendingOrders = Number(currentStats.pendingOrders) || 0
    const shippedOrders = Number(currentStats.shippedOrders) || 0

    const previousOrders = Number(previousStats.totalOrders) || 0
    const previousRevenue = Number(previousStats.totalRevenue) || 0

    // Calculate growth percentages
    const ordersGrowth = previousOrders > 0 ? ((totalOrders - previousOrders) / previousOrders) * 100 : 0
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      shippedOrders,
      totalCustomers,
      averageOrderValue,
      revenueGrowth,
      ordersGrowth,
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      shippedOrders: 0,
      totalCustomers: 0,
      averageOrderValue: 0,
      revenueGrowth: 0,
      ordersGrowth: 0,
    }
  }
}

export async function getRevenueData(userId?: string, days: number = 30): Promise<RevenueData[]> {
  try {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

    const conditions = userId ? [eq(orders.userId, userId)] : []
    conditions.push(gte(orders.createdAt, startDate))

    const data = await db
      .select({
        date: sql<string>`DATE(${orders.createdAt})`,
        revenue: sum(orders.total),
        orders: count(orders.id),
      })
      .from(orders)
      .where(and(...conditions))
      .groupBy(sql`DATE(${orders.createdAt})`)
      .orderBy(sql`DATE(${orders.createdAt})`)

    return data.map(item => ({
      date: item.date,
      revenue: Number(item.revenue) || 0,
      orders: Number(item.orders) || 0,
    }))
  } catch (error) {
    console.error('Error fetching revenue data:', error)
    return []
  }
}

export async function getTopProducts(userId?: string, limit: number = 5): Promise<TopProduct[]> {
  try {
    const conditions = userId ? [eq(orders.userId, userId)] : []

    const data = await db
      .select({
        id: products.id,
        name: products.name,
        totalSold: sum(orderItems.quantity),
        revenue: sum(sql<number>`${orderItems.quantity} * ${orderItems.price}`),
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(products.id, products.name)
      .orderBy(desc(sum(orderItems.quantity)))
      .limit(limit)

    return data.map(item => ({
      id: item.id,
      name: item.name,
      totalSold: Number(item.totalSold) || 0,
      revenue: Number(item.revenue) || 0,
    }))
  } catch (error) {
    console.error('Error fetching top products:', error)
    return []
  }
}

export async function getRecentOrders(userId?: string, limit: number = 5): Promise<RecentOrder[]> {
  try {
    const conditions = userId ? [eq(orders.userId, userId)] : []

    const data = await db
      .select({
        id: orders.id,
        customerName: users.name,
        status: orders.status,
        total: orders.total,
        createdAt: orders.createdAt,
        itemsCount: count(orderItems.id),
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(orders.id, users.name, orders.status, orders.total, orders.createdAt)
      .orderBy(desc(orders.createdAt))
      .limit(limit)

    return data.map(item => ({
      id: item.id,
      customerName: item.customerName || 'مهمان',
      status: item.status,
      total: item.total,
      itemsCount: Number(item.itemsCount) || 0,
      createdAt: item.createdAt || new Date(),
    }))
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    return []
  }
}
