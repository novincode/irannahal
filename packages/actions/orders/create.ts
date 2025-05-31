'use server'
import { db } from "@packages/db"
import { orders, orderItems, discounts, addresses, products } from "@packages/db/schema"
import { eq, and, isNull, inArray } from "drizzle-orm"
import { createOrderSchema, type CreateOrderInput } from "./formSchema"
import type { OrderWithDynamicRelations } from "./types"
import { withAuth } from "../utils"

export async function createOrder(input: CreateOrderInput): Promise<OrderWithDynamicRelations<{ items: true; address: true; discount: true }>> {
  return withAuth(async (user) => {
    // Validate input
    const validatedInput = createOrderSchema.parse(input)

    // Verify address belongs to user
    const address = await db.query.addresses.findFirst({
      where: and(
        eq(addresses.id, validatedInput.addressId),
        eq(addresses.userId, user.id),
        isNull(addresses.deletedAt)
      )
    })

  if (!address) {
    throw new Error("آدرس انتخاب شده معتبر نیست")
  }

  // Verify all products exist and get their current prices
  const productIds = validatedInput.items.map(item => item.productId)
  const dbProducts = await db.query.products.findMany({
    where: and(
      inArray(products.id, productIds),
      eq(products.status, 'active')
    )
  })

  // Validate products exist
  for (const item of validatedInput.items) {
    const product = dbProducts.find(p => p.id === item.productId)
    if (!product) {
      throw new Error(`محصول با شناسه ${item.productId} یافت نشد`)
    }
    if (product.status !== 'active') {
      throw new Error(`محصول ${product.name} در حال حاضر قابل سفارش نیست`)
    }
  }

  // Calculate order total
  let orderTotal = validatedInput.items.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)

  let discountAmount = 0
  let discountData = null

  // Apply discount if provided
  if (validatedInput.discountCode) {
    const discount = await db.query.discounts.findFirst({
      where: and(
        eq(discounts.code, validatedInput.discountCode),
        isNull(discounts.deletedAt)
      )
    })

    if (!discount) {
      throw new Error("کد تخفیف معتبر نیست")
    }

    // Check discount validity
    const now = new Date()
    if (discount.startsAt && discount.startsAt > now) {
      throw new Error("کد تخفیف هنوز فعال نشده است")
    }
    if (discount.endsAt && discount.endsAt < now) {
      throw new Error("کد تخفیف منقضی شده است")
    }
    if (discount.minOrder && orderTotal < discount.minOrder) {
      throw new Error(`حداقل مبلغ سفارش برای این کد تخفیف ${discount.minOrder} تومان است`)
    }

    // Calculate discount amount
    if (discount.type === 'percentage') {
      discountAmount = Math.floor((orderTotal * discount.value) / 100)
      if (discount.maxAmount && discountAmount > discount.maxAmount) {
        discountAmount = discount.maxAmount
      }
    } else if (discount.type === 'fixed') {
      discountAmount = discount.value
    }

    discountData = discount
    orderTotal -= discountAmount
  }

  // Ensure total is not negative
  orderTotal = Math.max(0, orderTotal)

  // Create order first
  const [order] = await db
    .insert(orders)
    .values({
      userId: user.id,
      discountId: discountData?.id || null,
      discountAmount,
      status: 'pending',
      total: orderTotal,
    })
    .returning()

  // Create order items
  const orderItemsData = validatedInput.items.map(item => ({
    orderId: order.id,
    productId: item.productId,
    quantity: item.quantity,
    price: item.price,
  }))

  const insertedItems = await db.insert(orderItems).values(orderItemsData).returning()

  // Update discount usage count if applicable
  if (discountData) {
    // You might want to implement usage tracking here
    // await db.update(discounts).set({ usageCount: sql`${discounts.usageCount} + 1` })
  }

  // Return the created order with basic info
  return {
    ...order,
    items: insertedItems,
    address,
    discount: discountData,
  } as OrderWithDynamicRelations<{ items: true; address: true; discount: true }>
  })
}
