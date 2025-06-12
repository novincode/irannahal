'use client'
import type { ProductWithDynamicRelations } from "@actions/products/types"
import { Card, CardContent, CardFooter } from "@shadcn/card"
import { Button } from "@shadcn/button"
import { Badge } from "@shadcn/badge"
import { ShoppingCartIcon } from "lucide-react"
import NextLink from "next/link"
import Image from "next/image"
import { getProductPageUrl } from "@actions/products/utils"
import { useCartStore } from "@data/useCartStore"
import { getProductDisplayPrice } from "@actions/cart/calculate-item-price"
import { useState } from "react"
import { formatPrice } from "@ui/lib/utils"

interface ProductCardProps {
  product: ProductWithDynamicRelations<{ thumbnail: true, meta: true }>
  featured?: boolean
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const thumbnailUrl = product.thumbnail?.url || "/placeholder.png"
  const productUrl = getProductPageUrl(product.slug)
  const addItem = useCartStore((s: any) => s.addItem)
  const openDrawer = useCartStore((s: any) => s.openDrawer)
  const [isLoading, setIsLoading] = useState(false)

  // Calculate display price with discount info
  const priceInfo = getProductDisplayPrice(product, 1)

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      // Add item - let cart store calculate the discounted price
      addItem({ 
        product,
        quantity: 1
        // Don't pass price - let cart store calculate discounts
      })
      // Small delay for user feedback, then open drawer
      setTimeout(() => {
        openDrawer()
        setIsLoading(false)
      }, 300)
    } catch (error) {
      setIsLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full transition-all duration-200 hover:shadow-lg">
      <div className="relative">
        <NextLink href={productUrl} className="block group">
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            <Image
              src={thumbnailUrl}
              alt={product.name}
              fill
              className="object-cover transition-all duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={featured}
            />
          </div>
        </NextLink>
        
        {/* Add to Cart floating button */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-3 right-3 z-10 gap-2"
          onClick={handleAddToCart}
          disabled={isLoading}
        >
          <ShoppingCartIcon size={16} />
          {isLoading ? 'در حال افزودن...' : 'افزودن به سبد'}
        </Button>
      </div>
      
      <CardContent className="flex-grow flex flex-col pt-4">
        <NextLink href={productUrl} className="group">
          <h3 className="font-medium text-base leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </NextLink>
        
        {/* Price */}
        <div className="mt-auto">
          {priceInfo.showDiscount ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="font-semibold text-lg text-primary">
                  {formatPrice(priceInfo.effectivePrice)}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {priceInfo.savingsText}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground line-through">
                {formatPrice(priceInfo.originalPrice)}
              </div>
            </div>
          ) : (
            <div className="font-semibold text-lg">
              {formatPrice(product.price || 0)}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4">
        <NextLink href={productUrl} className="w-full">
          <Button variant="outline" className="w-full" size="sm">
            مشاهده محصول
          </Button>
        </NextLink>
      </CardFooter>
    </Card>
  )
}
