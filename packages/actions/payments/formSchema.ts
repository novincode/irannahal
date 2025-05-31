import { z } from "zod"
import { paymentStatusEnum } from "@packages/db/schema"

// Define payment method values that are supported by your gateways
const paymentMethodEnum = ["bank_transfer", "card", "wallet", "cash_on_delivery"] as const
export type PaymentMethod = typeof paymentMethodEnum[number]

export const createPaymentSchema = z.object({
  orderId: z.string().uuid("شناسه سفارش نامعتبر است"),
  method: z.enum(paymentMethodEnum, {
    errorMap: () => ({ message: "روش پرداخت نامعتبر است" })
  }),
  amount: z.number().min(0, "مبلغ پرداخت نمی‌تواند منفی باشد"),
  payload: z.any().optional(),
})

export const paymentFiltersSchema = z.object({
  userId: z.string().optional(),
  orderId: z.string().uuid().optional(),
  status: z.enum(paymentStatusEnum.enumValues, {
    errorMap: () => ({ message: "وضعیت پرداخت نامعتبر است" })
  }).optional(),
  method: z.enum(paymentMethodEnum, {
    errorMap: () => ({ message: "روش پرداخت نامعتبر است" })
  }).optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
})

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
export type PaymentFiltersInput = z.infer<typeof paymentFiltersSchema>
