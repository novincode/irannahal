import type { ProductWithDynamicRelations } from "@actions/products/types"
import { Card, CardContent, CardFooter } from "@shadcn/card"
import { Button } from "@shadcn/button"
import { ShoppingCartIcon } from "lucide-react"
import NextLink from "next/link"
import Image from "next/image"
import { getProductPageUrl } from "@actions/products/utils"
import { useCartStore } from "@data/useCartStore" // Try relative import if alias fails

interface ProductCardProps {
  product: ProductWithDynamicRelations<{ thumbnail: true }>
  featured?: boolean
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const thumbnailUrl = product.thumbnail?.url || "/placeholder.png"
  const productUrl = getProductPageUrl(product.slug)
  const addItem = useCartStore((s: any) => s.addItem)

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
          onClick={() => addItem({ product })}
        >
          <ShoppingCartIcon size={16} />
          افزودن به سبد
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
          <div className="font-semibold text-lg">
            {product.price?.toLocaleString()} تومان
          </div>
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
