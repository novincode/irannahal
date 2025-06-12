export function getProductPageUrl(slug: string | number): string {
    return `/products/${slug}`;
}

/**
 * Calculate the discounted price for a product based on quantity and discount conditions
 */
export function calculateDiscountedPrice(
  basePrice: number, 
  quantity: number, 
  discountConditions?: Array<{
    minQuantity: number;
    type: "percentage" | "fixed";
    value: number;
  }>
): {
  finalPrice: number;
  totalDiscount: number;
  appliedDiscount?: {
    minQuantity: number;
    type: "percentage" | "fixed";
    value: number;
  };
} {
  if (!discountConditions || discountConditions.length === 0) {
    return {
      finalPrice: basePrice,
      totalDiscount: 0,
    };
  }

  // Find the applicable discount (highest minQuantity that the current quantity meets)
  const applicableDiscounts = discountConditions
    .filter(condition => quantity >= condition.minQuantity)
    .sort((a, b) => b.minQuantity - a.minQuantity); // Sort by minQuantity desc

  if (applicableDiscounts.length === 0) {
    return {
      finalPrice: basePrice,
      totalDiscount: 0,
    };
  }

  const appliedDiscount = applicableDiscounts[0];
  let discountAmount = 0;

  if (appliedDiscount.type === "percentage") {
    discountAmount = (basePrice * appliedDiscount.value) / 100;
  } else {
    discountAmount = appliedDiscount.value;
  }

  // Ensure discount doesn't make price negative
  discountAmount = Math.min(discountAmount, basePrice);

  return {
    finalPrice: basePrice - discountAmount,
    totalDiscount: discountAmount,
    appliedDiscount,
  };
}

/**
 * Get discount preview text for display
 */
export function getDiscountPreviewText(
  basePrice: number, 
  quantity: number, 
  discountConditions?: Array<{
    minQuantity: number;
    type: "percentage" | "fixed";
    value: number;
  }>
): string | null {
  const result = calculateDiscountedPrice(basePrice, quantity, discountConditions);
  
  if (!result.appliedDiscount || result.totalDiscount === 0) {
    return null;
  }

  const { appliedDiscount, totalDiscount } = result;
  
  if (appliedDiscount.type === "percentage") {
    return `${appliedDiscount.value}% تخفیف (${totalDiscount.toLocaleString()} تومان کاهش)`;
  } else {
    return `${appliedDiscount.value.toLocaleString()} تومان تخفیف`;
  }
}