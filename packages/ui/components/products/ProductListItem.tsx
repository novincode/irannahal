'use client'
import type { ProductWithDynamicRelations } from "@actions/products/types"
import { Card, CardContent } from "@shadcn/card"
import { Button } from "@shadcn/button"
import { ShoppingCartIcon } from "lucide-react"
import NextLink from "next/link"
import Image from "next/image"
import { getProductPageUrl } from "@actions/products/utils"
import { useCartStore } from "@data/useCartStore"
import { useState } from "react"

interface ProductListItemProps {
  product: ProductWithDynamicRelations<{ thumbnail: true }>
}

export function ProductListItem({ product }: ProductListItemProps) {
  const thumbnailUrl = product.thumbnail?.url || "/placeholder.png"
  const productUrl = getProductPageUrl(product.slug)
  const addItem = useCartStore((s: any) => s.addItem)
  const openDrawer = useCartStore((s: any) => s.openDrawer)
  const [isLoading, setIsLoading] = useState(false)

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      addItem({ product })
      setTimeout(() => {
        openDrawer()
        setIsLoading(false)
      }, 300)
    } catch (error) {
      setIsLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <NextLink href={productUrl} className="block group">
              <div className="relative aspect-square w-24 h-24 overflow-hidden bg-muted rounded-md">
                <Image
                  src={thumbnailUrl}
                  alt={product.name}
                  fill
                  className="object-cover transition-all duration-300 group-hover:scale-110"
                  sizes="96px"
                />
              </div>
            </NextLink>
          </div>

          {/* Product Info */}
          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0 flex-grow">
                <NextLink href={productUrl} className="group">
                  <h3 className="font-medium text-base leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </NextLink>
                
                {product.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="font-semibold text-lg">
                    {product.price?.toLocaleString()} تومان
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddToCart}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      <ShoppingCartIcon size={16} />
                      {isLoading ? 'در حال افزودن...' : 'افزودن به سبد'}
                    </Button>
                    
                    <NextLink href={productUrl}>
                      <Button variant="default" size="sm">
                        مشاهده
                      </Button>
                    </NextLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
