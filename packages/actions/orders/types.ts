import type { OrderSchema, OrderItemSchema, PaymentSchema, UserSchema, ProductSchema, DiscountSchema, AddressSchema } from "@db/types"

// Base order type with relations
export interface OrderWithDynamicRelations<TRelations = {}> extends OrderSchema {
  user?: TRelations extends { user: true } ? UserSchema : never
  items?: TRelations extends { items: true } ? OrderItemWithDynamicRelations<TRelations>[] : never
  discount?: TRelations extends { discount: true } ? DiscountSchema : never
  payments?: TRelations extends { payments: true } ? PaymentSchema[] : never
}

// Order item with relations
export interface OrderItemWithDynamicRelations<TRelations = {}> extends OrderItemSchema {
  product?: TRelations extends { items: { product: true } } ? ProductSchema : never
  order?: TRelations extends { items: { order: true } } ? OrderSchema : never
}

// Create order input
export interface CreateOrderInput {
  addressId: string
  discountCode?: string
  items: {
    productId: string
    quantity: number
    price: number
  }[]
}

// Update order status input
export interface UpdateOrderStatusInput {
  orderId: string
  status: "pending" | "paid" | "shipped" | "cancelled"
}

// Order filters for getting orders
export interface OrderFilters {
  userId?: string
  status?: "pending" | "paid" | "shipped" | "cancelled"
  limit?: number
  offset?: number
  dateFrom?: Date
  dateTo?: Date
}

// Order statistics
export interface OrderStats {
  totalOrders: number
  pendingOrders: number
  paidOrders: number
  shippedOrders: number
  cancelledOrders: number
  totalSpent: number
  averageOrderValue: number
}

// Payment methods
export type PaymentMethod = "bank_transfer" | "card" | "wallet" | "cash_on_delivery"
