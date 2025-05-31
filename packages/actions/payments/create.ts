'use server'
import { db } from "@packages/db"
import { payments } from "@packages/db/schema"
import { createPaymentSchema, type CreatePaymentInput } from "./formSchema"
import { withAuth } from "../utils"

export async function createPayment(input: CreatePaymentInput) {
  return withAuth(async (user) => {
    // Validate input
    const validatedInput = createPaymentSchema.parse(input)

    // For now, this is a fake payment system
    // In a real implementation, you would integrate with payment gateways
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create payment record
    const [payment] = await db
      .insert(payments)
      .values({
        orderId: validatedInput.orderId,
        status: 'completed', // For fake payment, always succeed
        method: validatedInput.method,
        amount: validatedInput.amount,
        payload: {
          ...validatedInput.payload,
          fake: true,
          processedAt: new Date().toISOString(),
          transactionId: `fake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
      })
      .returning()

    return payment
  })
}

// Fake payment gateway simulation
export async function processPayment(orderId: string, method: string, amount: number) {
  // Simulate different payment methods
  const paymentMethods = {
    bank_transfer: {
      success: true,
      message: "پرداخت از طریق انتقال بانکی با موفقیت انجام شد",
      transactionId: `bank_${Date.now()}`,
    },
    card: {
      success: Math.random() > 0.1, // 90% success rate
      message: Math.random() > 0.1 ? "پرداخت با کارت با موفقیت انجام شد" : "خطا در پردازش کارت",
      transactionId: `card_${Date.now()}`,
    },
    wallet: {
      success: true,
      message: "پرداخت از کیف پول با موفقیت انجام شد",
      transactionId: `wallet_${Date.now()}`,
    },
    cash_on_delivery: {
      success: true,
      message: "سفارش با پرداخت در محل ثبت شد",
      transactionId: `cod_${Date.now()}`,
    },
  }

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000))

  const result = paymentMethods[method as keyof typeof paymentMethods] || {
    success: false,
    message: "روش پرداخت نامعتبر است",
    transactionId: null,
  }

  return {
    ...result,
    orderId,
    method,
    amount,
    processedAt: new Date(),
  }
}
