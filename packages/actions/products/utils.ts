// Product utility functions

export interface DiscountCondition {
  minQuantity: number
  type: 'percentage' | 'fixed'
  value: number
}

export interface DiscountResult {
  originalPrice: number
  finalPrice: number
  totalDiscount: number
  appliedDiscount: DiscountCondition | null
}

/**
 * Calculate discounted price based on quantity and discount conditions
 */
export function calculateDiscountedPrice(
  basePrice: number,
  quantity: number,
  discountConditions: DiscountCondition[] = []
): DiscountResult {
  if (!discountConditions.length) {
    return {
      originalPrice: basePrice,
      finalPrice: basePrice * quantity,
      totalDiscount: 0,
      appliedDiscount: null
    }
  }

  // Find applicable discounts (quantity must meet minimum)
  const applicableDiscounts = discountConditions
    .filter(d => quantity >= d.minQuantity)
    .sort((a, b) => b.value - a.value) // Sort by value descending

  if (!applicableDiscounts.length) {
    return {
      originalPrice: basePrice,
      finalPrice: basePrice * quantity,
      totalDiscount: 0,
      appliedDiscount: null
    }
  }

  // Apply the best discount
  const bestDiscount = applicableDiscounts[0]
  const originalTotal = basePrice * quantity
  
  let discountAmount = 0
  if (bestDiscount.type === 'percentage') {
    discountAmount = originalTotal * (bestDiscount.value / 100)
  } else {
    discountAmount = bestDiscount.value * quantity
  }

  const finalPrice = Math.max(0, originalTotal - discountAmount)

  return {
    originalPrice: basePrice,
    finalPrice,
    totalDiscount: discountAmount,
    appliedDiscount: bestDiscount
  }
}

/**
 * Get preview text for next discount tier
 */
export function getDiscountPreviewText(
  basePrice: number,
  currentQuantity: number,
  discountConditions: DiscountCondition[] = []
): string | null {
  const nextTier = discountConditions
    .filter(d => d.minQuantity > currentQuantity)
    .sort((a, b) => a.minQuantity - b.minQuantity)[0]

  if (!nextTier) return null

  const additionalQuantity = nextTier.minQuantity - currentQuantity
  const discountText = nextTier.type === 'percentage' 
    ? `${nextTier.value}% تخفیف`
    : `${nextTier.value.toLocaleString()} تومان تخفیف`

  return `با خرید ${additionalQuantity} عدد بیشتر، ${discountText} دریافت کنید`
}

/**
 * Format price in Persian
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
}

/**
 * Generate product SKU
 */
export function generateSKU(productName: string, category?: string): string {
  const namePrefix = productName.substring(0, 3).toUpperCase()
  const categoryPrefix = category ? category.substring(0, 2).toUpperCase() : 'GN'
  const timestamp = Date.now().toString().slice(-6)
  
  return `${namePrefix}-${categoryPrefix}-${timestamp}`
}

/**
 * Generate product page URL
 */
export function getProductPageUrl(slug: string): string {
  return `/products/${slug}`
}
