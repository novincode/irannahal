'use client'
import type { ProductWithDynamicRelations } from "@actions/products/types"
import { Button } from "@shadcn/button"
import { Card } from "@shadcn/card"
import { Separator } from "@shadcn/separator"
import { Badge } from "@shadcn/badge"
import { MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react"
import Image from "next/image"
import { useState, Fragment } from "react"
import { useCartStore } from "@data/useCartStore"
import { calculateDiscountedPrice, getDiscountPreviewText, extractProductMeta, parseDiscountConditions, parseInfoTable, parseDimensions } from "@actions/products/utils"

interface ProductSingleProps {
  product: ProductWithDynamicRelations<{ thumbnail: true, meta: true }>
}

export function ProductSingle({ product }: ProductSingleProps) {
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const thumbnailUrl = product.thumbnail?.url || "/placeholder.png"
  
  // Cart store hooks
  const addItem = useCartStore((state) => state.addItem)
  const openDrawer = useCartStore((state) => state.openDrawer)
  const items = useCartStore((state) => state.items)
  
  // Check if product is already in cart
  const existingItem = items.find(item => item.product.id === product.id)
  const totalQuantityInCart = existingItem?.quantity || 0
  
  // Process meta data using utility functions
  const meta = extractProductMeta(product)
  const dimensions = parseDimensions(meta)
  const infoTable = parseInfoTable(meta)
  const discountConditions = parseDiscountConditions(meta)
  
  // Calculate price with quantity-based discounts
  const originalPrice = meta.originalPrice ? Number(meta.originalPrice) : null;
  const discountResult = calculateDiscountedPrice(product.price, quantity, discountConditions);
  const discountPreview = getDiscountPreviewText(product.price, quantity, discountConditions);
  
  const incrementQuantity = () => setQuantity(prev => prev + 1)
  const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1)
  
  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      addItem({ 
        product, 
        quantity,
        price: discountResult.finalPrice // Use the discounted price
      })
      
      // Small delay for user feedback, then open drawer
      setTimeout(() => {
        openDrawer()
        setIsLoading(false)
        // Reset quantity to 1 after adding
        setQuantity(1)
      }, 300)
    } catch (error) {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto py-8">
      {/* Product Header - Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Right Column - Thumbnail */}
        <div className="order-2 md:order-1">
          <Card className="overflow-hidden">
            <div className="relative aspect-square w-full bg-muted">
              <Image
                src={thumbnailUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </Card>
        </div>
        
        {/* Left Column - Product Info */}
        <div className="order-1 md:order-2 flex flex-col col-span-2">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          {meta.brand && (
            <div className="text-muted-foreground mb-4">برند: {meta.brand}</div>
          )}
          
          <Separator className="my-4" />
          
          {/* Price Section */}
          <div className="mb-6">
            {originalPrice && originalPrice > product.price && (
              <div className="text-lg text-muted-foreground line-through mb-1">
                قیمت اصلی: {originalPrice.toLocaleString()} تومان
              </div>
            )}
            
            {/* Show current price per unit */}
            <div className="text-sm text-muted-foreground mb-1">
              قیمت واحد: {product.price.toLocaleString()} تومان
            </div>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl font-semibold">
                مجموع: {discountResult.finalPrice.toLocaleString()} تومان
              </div>
              
              {discountResult.hasDiscount && (
                <Badge variant="destructive" className="text-sm">
                  {discountResult.appliedDiscount?.type === "percentage" 
                    ? `${discountResult.appliedDiscount.value}% تخفیف`
                    : `${discountResult.totalDiscount.toLocaleString()} تومان تخفیف`
                  }
                </Badge>
              )}
            </div>
            
            {discountResult.hasDiscount && (
              <div className="text-sm text-green-600 font-medium">
                شما {discountResult.totalDiscount.toLocaleString()} تومان صرفه‌جویی می‌کنید!
              </div>
            )}
            
            {discountPreview && (
              <div className="text-sm text-green-600 mb-2">
                {discountPreview}
              </div>
            )}
            
            {/* Show next discount tier if available */}
            {discountConditions.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {(() => {
                  const nextTier = discountConditions
                    .filter((d: any) => d.minQuantity > quantity)
                    .sort((a: any, b: any) => a.minQuantity - b.minQuantity)[0];
                  
                  if (nextTier) {
                    return `با خرید ${nextTier.minQuantity} عدد، ${
                      nextTier.type === "percentage" 
                        ? `${nextTier.value}% تخفیف` 
                        : `${nextTier.value.toLocaleString()} تومان تخفیف`
                    } دریافت کنید`;
                  }
                  return null;
                })()}
              </div>
            )}
          </div>
          
          {meta.customBadge && (
            <Badge variant="secondary" className="mb-4">
              {meta.customBadge}
            </Badge>
          )}
          
          {product.description && (
            <div className="text-muted-foreground mb-6">
              {product.description}
            </div>
          )}
          
          {/* Quantity Selector */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-muted-foreground">تعداد:</span>
            <div className="flex items-center border rounded-md">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={incrementQuantity}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Add to Cart Button */}
          <Button 
            size="lg" 
            className="gap-2" 
            onClick={handleAddToCart}
            disabled={isLoading}
          >
            <ShoppingCartIcon className="h-5 w-5" />
            {isLoading ? 'در حال افزودن...' : 'افزودن به سبد خرید'}
          </Button>
          
          {/* Show if already in cart */}
          {totalQuantityInCart > 0 && (
            <div className="text-sm text-muted-foreground">
              در حال حاضر {totalQuantityInCart} عدد از این محصول در سبد خرید شما موجود است
            </div>
          )}
        </div>
      </div>
      
      {/* Product Details */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">مشخصات محصول</h2>
        <Separator className="mb-6" />
        
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
          {meta.model && (
            <>
              <dt className="font-medium text-muted-foreground">مدل:</dt>
              <dd>{meta.model}</dd>
            </>
          )}
          
          {meta.warranty && (
            <>
              <dt className="font-medium text-muted-foreground">گارانتی:</dt>
              <dd>{meta.warranty}</dd>
            </>
          )}
          
          {meta.shippingTime && (
            <>
              <dt className="font-medium text-muted-foreground">زمان ارسال:</dt>
              <dd>{meta.shippingTime}</dd>
            </>
          )}
          
          {dimensions && dimensions.width && (
            <>
              <dt className="font-medium text-muted-foreground">ابعاد:</dt>
              <dd>
                {dimensions.width} × {dimensions.height || 0} × {dimensions.depth || 0} سانتی‌متر
              </dd>
            </>
          )}
          
          {meta.weight && (
            <>
              <dt className="font-medium text-muted-foreground">وزن:</dt>
              <dd>{meta.weight} گرم</dd>
            </>
          )}
        </dl>
        
        {infoTable.length > 0 && (
          <>
            <h3 className="text-xl font-semibold mt-8 mb-4">اطلاعات بیشتر</h3>
            <Separator className="mb-6" />
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              {infoTable.map((item: {label: string, value: string}, idx: number) => (
                <Fragment key={idx}>
                  <dt className="font-medium text-muted-foreground">{item.label}:</dt>
                  <dd>{item.value}</dd>
                </Fragment>
              ))}
            </dl>
          </>
        )}
      </Card>
      
      {product.content && (
        <Card className="p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">توضیحات تکمیلی</h2>
          <Separator className="mb-6" />
          <div 
            className="prose max-w-none" 
            dangerouslySetInnerHTML={{ __html: product.content || '' }} 
          />
        </Card>
      )}
    </div>
  )
}
