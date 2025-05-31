import type { PaymentSchema, OrderSchema, OrderItemSchema } from "@packages/db/types"
import type { paymentStatusEnum } from "@packages/db/schema"

// Use database schema types for better type safety
export type PaymentStatus = typeof paymentStatusEnum.enumValues[number]

// Re-export PaymentMethod from form schema for consistency
export type { PaymentMethod } from "./formSchema"

// Payment processing result
export interface PaymentProcessResult {
  success: boolean
  message: string
  transactionId: string | null
  orderId: string
  method: string
  amount: number
  processedAt: Date
}

// Payment with order details - using proper database schema types
export type PaymentWithOrder = PaymentSchema & {
  order: (OrderSchema & {
    items: Array<OrderItemSchema & {
      product: {
        id: string
        name: string
        slug: string
      } | null
    }>
  }) | null
}
