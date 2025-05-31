import { z } from "zod"

export const createOrderSchema = z.object({
  addressId: z.string().uuid("آدرس تحویل الزامی است"),
  discountCode: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().uuid("شناسه محصول نامعتبر است"),
    quantity: z.number().min(1, "تعداد باید حداقل ۱ باشد"),
    price: z.number().min(0, "قیمت نمی‌تواند منفی باشد"),
  })).min(1, "سفارش باید حداقل یک محصول داشته باشد"),
})

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid("شناسه سفارش نامعتبر است"),
  status: z.enum(["pending", "paid", "shipped", "cancelled"], {
    errorMap: () => ({ message: "وضعیت سفارش نامعتبر است" })
  }),
})

export const orderFiltersSchema = z.object({
  userId: z.string().optional(),
  status: z.enum(["pending", "paid", "shipped", "cancelled"]).optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type OrderFiltersInput = z.infer<typeof orderFiltersSchema>
