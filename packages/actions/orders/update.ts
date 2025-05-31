'use server'
import { db } from "@packages/db"
import { orders } from "@packages/db/schema"
import { eq, and, isNull } from "drizzle-orm"
import { updateOrderStatusSchema, type UpdateOrderStatusInput } from "./formSchema"
import { withAuth, withRole } from "../utils"

export async function updateOrderStatus(input: UpdateOrderStatusInput): Promise<void> {
  return withAuth(async (user) => {
    // Validate input
    const validatedInput = updateOrderStatusSchema.parse(input)

    // Check if order exists and user has permission
    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, validatedInput.orderId),
        isNull(orders.deletedAt)
      )
    })

    if (!order) {
      throw new Error("سفارش یافت نشد")
    }

    // Only admin or order owner can update status
    if (user.role !== 'admin' && order.userId !== user.id) {
      throw new Error("شما مجاز به تغییر وضعیت این سفارش نیستید")
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      pending: ['paid', 'cancelled'],
      paid: ['shipped', 'cancelled'],
      shipped: ['cancelled'], // Usually shipped orders can't be cancelled, but might depend on business logic
      cancelled: [], // Cancelled orders can't be changed
    }

    if (!validTransitions[order.status]?.includes(validatedInput.status)) {
      throw new Error(`تغییر وضعیت از ${order.status} به ${validatedInput.status} مجاز نیست`)
    }

    // Update order status
    await db
      .update(orders)
      .set({
        status: validatedInput.status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, validatedInput.orderId))
  })
}

// Admin only function to update any order status
export const adminUpdateOrderStatus = withRole(['admin'])(async (user, orderId: string, status: "pending" | "paid" | "shipped" | "cancelled"): Promise<void> => {
  // Check if order exists
  const order = await db.query.orders.findFirst({
    where: and(
      eq(orders.id, orderId),
      isNull(orders.deletedAt)
    )
  })

  if (!order) {
    throw new Error("سفارش یافت نشد")
  }

  // Update order status
  await db
    .update(orders)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))
})
