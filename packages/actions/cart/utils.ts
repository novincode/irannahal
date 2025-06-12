// Cart utility functions

import type { CartItem } from '@data/useCartStore'
import { calculateDiscountedPrice, extractProductMeta, parseDiscountConditions } from '@actions/products/utils'

export interface CartCalculations {
  subtotalBeforeDiscount: number
  subtotalAfterDiscount: number
  totalDiscount: number
  hasDiscount: boolean
  items: Array<CartItem & {
    discountResult: ReturnType<typeof calculateDiscountedPrice>
    originalItemTotal: number
  }>
}

/**
 * Calculate comprehensive cart totals with discounts
 */
export function calculateCartTotals(items: CartItem[]): CartCalculations {
  let subtotalBeforeDiscount = 0
  let subtotalAfterDiscount = 0
  let totalDiscount = 0
  
  const processedItems = items.map(item => {
    const originalItemTotal = item.price * item.quantity
    subtotalBeforeDiscount += originalItemTotal
    
    // Get discount conditions from product meta using utility
    const meta = extractProductMeta(item.product)
    const discountConditions = parseDiscountConditions(meta)
    
    // Calculate discount for this item
    const discountResult = calculateDiscountedPrice(item.price, item.quantity, discountConditions)
    subtotalAfterDiscount += discountResult.finalPrice
    totalDiscount += discountResult.totalDiscount
    
    return {
      ...item,
      discountResult,
      originalItemTotal
    }
  })
  
  return {
    subtotalBeforeDiscount,
    subtotalAfterDiscount,
    totalDiscount,
    hasDiscount: totalDiscount > 0,
    items: processedItems
  }
}

/**
 * Get discount info for a single cart item
 */
export function getItemDiscountInfo(item: CartItem) {
  const meta = extractProductMeta(item.product)
  const discountConditions = parseDiscountConditions(meta)
  const discountResult = calculateDiscountedPrice(item.price, item.quantity, discountConditions)
  const originalTotal = item.price * item.quantity
  
  return {
    discountResult,
    originalTotal,
    hasDiscount: discountResult.hasDiscount
  }
}
