// Utility to calculate effective price for cart items with discounts

import { calculateDiscountedPrice, extractProductMeta, parseDiscountConditions } from '@actions/products/utils'
import type { ProductWithDynamicRelations } from '@actions/products/types'

/**
 * Calculate the effective price for a cart item considering discounts
 * This ensures discount calculations are consistent whether items are added from 
 * ProductCard, ProductSingle, or calculated in cart
 */
export function calculateItemPrice(
  product: ProductWithDynamicRelations,
  quantity: number = 1
): {
  originalPrice: number
  effectivePrice: number
  discountAmount: number
  hasDiscount: boolean
  pricePerUnit: number
} {
  const basePrice = product.price || 0
  const meta = extractProductMeta(product)
  const discountConditions = parseDiscountConditions(meta)
  
  if (discountConditions.length === 0) {
    return {
      originalPrice: basePrice,
      effectivePrice: basePrice,
      discountAmount: 0,
      hasDiscount: false,
      pricePerUnit: basePrice
    }
  }

  const discountResult = calculateDiscountedPrice(basePrice, quantity, discountConditions)
  
  return {
    originalPrice: basePrice,
    effectivePrice: discountResult.finalPrice,
    discountAmount: discountResult.totalDiscount,
    hasDiscount: discountResult.totalDiscount > 0,
    pricePerUnit: discountResult.finalPrice / quantity
  }
}

/**
 * Get display price info for product cards and single product pages
 */
export function getProductDisplayPrice(
  product: ProductWithDynamicRelations,
  previewQuantity: number = 1
) {
  const calculation = calculateItemPrice(product, previewQuantity)
  
  return {
    ...calculation,
    showDiscount: calculation.hasDiscount,
    savingsText: calculation.hasDiscount 
      ? `${Math.round(((calculation.discountAmount / (calculation.originalPrice * previewQuantity)) * 100))}% تخفیف`
      : null
  }
}

export default { calculateItemPrice, getProductDisplayPrice }
