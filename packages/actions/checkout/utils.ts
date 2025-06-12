// Checkout utility functions for secure discount calculation and validation

import type { CartItem } from '@data/useCartStore'
import { calculateCartTotals } from '@actions/cart/utils'
import { extractProductMeta, parseDiscountConditions } from '@actions/products/utils'

export interface CheckoutTotals {
  subtotal: number
  discountAmount: number
  shippingCost: number
  total: number
  items: Array<CartItem & {
    finalPrice: number
    discountAmount: number
    hasDiscount: boolean
  }>
}

/**
 * Calculate secure checkout totals with server-side validation
 * This ensures discounts can't be bypassed on the client side
 */
export function calculateCheckoutTotals(
  items: CartItem[],
  shippingCost: number = 0
): CheckoutTotals {
  const cartCalculations = calculateCartTotals(items)
  
  const processedItems = items.map(item => {
    const meta = extractProductMeta(item.product)
    const discountConditions = parseDiscountConditions(meta)
    
    // Re-calculate discount for security (don't trust client-side calculations)
    const originalTotal = item.price * item.quantity
    const discountedCalculation = cartCalculations.items.find(
      calcItem => calcItem.product.id === item.product.id
    )
    
    const finalPrice = discountedCalculation?.discountResult.finalPrice || originalTotal
    const discountAmount = originalTotal - finalPrice
    
    return {
      ...item,
      finalPrice,
      discountAmount,
      hasDiscount: discountAmount > 0
    }
  })

  return {
    subtotal: cartCalculations.subtotalBeforeDiscount,
    discountAmount: cartCalculations.totalDiscount,
    shippingCost,
    total: cartCalculations.subtotalAfterDiscount + shippingCost,
    items: processedItems
  }
}

/**
 * Validate checkout data before order creation
 */
export function validateCheckoutData(data: {
  items: CartItem[]
  addressId: string
  shippingMethod?: string
}): { isValid: boolean, errors: string[] } {
  const errors: string[] = []

  // Validate items
  if (!data.items || data.items.length === 0) {
    errors.push('سبد خرید خالی است')
  }

  // Validate address
  if (!data.addressId) {
    errors.push('آدرس انتخاب نشده است')
  }

  // Validate item quantities
  data.items.forEach((item, index) => {
    if (item.quantity <= 0) {
      errors.push(`تعداد محصول ${index + 1} نامعتبر است`)
    }
    if (!item.product.id) {
      errors.push(`محصول ${index + 1} نامعتبر است`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Payment method configurations
 */
export const PAYMENT_METHODS = {
  zarinpal: {
    id: 'zarinpal',
    name: 'زرین‌پال',
    description: 'پرداخت آنلاین با کارت‌های بانکی',
    icon: '💳',
    enabled: true
  },
  sadad: {
    id: 'sadad',
    name: 'سداد',
    description: 'پرداخت از طریق درگاه سداد',
    icon: '🏦',
    enabled: true
  },
  mellat: {
    id: 'mellat',
    name: 'بانک ملت',
    description: 'درگاه پرداخت بانک ملت',
    icon: '🏛️',
    enabled: true
  },
  cod: {
    id: 'cod',
    name: 'پرداخت در محل',
    description: 'پرداخت هنگام تحویل کالا',
    icon: '💰',
    enabled: false // Can be enabled based on shipping method
  }
} as const

export type PaymentMethodId = keyof typeof PAYMENT_METHODS
