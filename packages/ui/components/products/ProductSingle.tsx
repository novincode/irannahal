'use client'
import type { ProductWithDynamicRelations } from "@actions/products/types"
import { Button } from "@shadcn/button"
import { Card } from "@shadcn/card"
import { Separator } from "@shadcn/separator"
import { Badge } from "@shadcn/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@shadcn/dialog"
import { Label } from "@shadcn/label"
import { Input } from "@shadcn/input"
import { MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react"
import Image from "next/image"
import { useState, Fragment, useEffect } from "react"
import { useCartStore } from "@data/useCartStore"
import { calculateDiscountedPrice, getDiscountPreviewText, extractProductMeta, parseDiscountConditions, parseInfoTable, parseDimensions } from "@actions/products/utils"

interface ProductSingleProps {
  product: ProductWithDynamicRelations<{ thumbnail: true, meta: true }>
}

export function ProductSingle({ product }: ProductSingleProps) {
  const thumbnailUrl = product.thumbnail?.url || "/placeholder.png"
  
  // Cart store hooks
  const addItem = useCartStore((state) => state.addItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const openDrawer = useCartStore((state) => state.openDrawer)
  const items = useCartStore((state) => state.items)
  const [isLoading, setIsLoading] = useState(false)
  
  // Check if product is already in cart
  const existingItem = items.find(item => item.product.id === product.id)
  
  // Process meta data using utility functions
  const meta = extractProductMeta(product)
  const dimensions = parseDimensions(meta)
  const infoTable = parseInfoTable(meta)
  const discountConditions = parseDiscountConditions(meta)
  
  // Calculate price with quantity-based discounts
  const originalPrice = meta.originalPrice ? Number(meta.originalPrice) : null
  const quantity = existingItem?.quantity || 0
  const discountResult = calculateDiscountedPrice(product.price, quantity || 1, discountConditions)
  const discountPreview = getDiscountPreviewText(product.price, quantity || 1, discountConditions)
  
  const handleQuantityChange = async (newQuantity: number) => {
    setIsLoading(true)
    try {
      if (newQuantity === 0) {
        await removeItem(product.id)
      } else if (existingItem) {
        updateQuantity(product.id, newQuantity)
      } else {
        await addItem({ 
          product,
          quantity: newQuantity
        })
      }
    } catch (error) {
      console.error('Failed to update cart:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const incrementQuantity = () => handleQuantityChange(quantity + 1)
  const decrementQuantity = () => handleQuantityChange(quantity - 1)
  


  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      await addItem({ 
        product,
        quantity: 1
      })
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto py-8">
      {/* Product Header - Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 md:gap-6 mb-8">
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
          
          {/* Price & Cart Section */}
          <div className="mb-6 space-y-4">
            {/* Prices */}
            <div className="space-y-2">
              {originalPrice && originalPrice > product.price && (
                <div className="text-muted-foreground text-sm line-through">
                  قیمت اصلی: {originalPrice.toLocaleString()} تومان
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <div className="text-xl font-medium">
                  قیمت هر واحد: {discountResult.appliedDiscount 
                    ? Math.round(discountResult.finalPrice / quantity).toLocaleString()
                    : product.price.toLocaleString()
                  } تومان
                </div>
                {meta.customBadge && (
                  <Badge variant="secondary">
                    {meta.customBadge}
                  </Badge>
                )}
              </div>

              {discountResult.hasDiscount && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Badge variant="destructive">
                    {discountResult.appliedDiscount?.type === "percentage" 
                      ? `${discountResult.appliedDiscount.value}% تخفیف`
                      : `${discountResult.totalDiscount.toLocaleString()} تومان تخفیف`
                    }
                  </Badge>
                  <span className="text-sm text-green-600 font-medium">
                    شما در هر واحد {Math.round(discountResult.totalDiscount / quantity).toLocaleString()} تومان صرفه‌جویی می‌کنید!
                  </span>
                </div>
              )}

              {discountPreview && (
                <div className="text-sm text-green-600">
                  {discountPreview}
                </div>
              )}
            </div>

            {product.description && (
              <div className="text-muted-foreground">
                {product.description}
              </div>
            )}

            {/* Quantity Controls or Add to Cart */}
            {quantity > 0 ? (
              <div className="flex flex-col w-full gap-3">
                <div className="flex items-center justify-between w-full border-2 rounded-lg px-2">
                  <Button 
                    variant="ghost" 
                    size="lg"
                    className="h-16 w-16" 
                    disabled={isLoading}
                    onClick={decrementQuantity}
                  >
                    <MinusIcon className="h-8 w-8" />
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <button 
                        className="w-24 text-center text-xl font-semibold py-4 hover:bg-muted/50 transition-colors"
                        disabled={isLoading}
                      >
                        {quantity}
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>تغییر تعداد</DialogTitle>
                        <DialogDescription>
                          تعداد مورد نظر خود را وارد کنید
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="quantity" className="text-right col-span-4">
                            تعداد
                          </Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={quantity}
                            className="col-span-4 text-center text-lg"
                            min={1}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const val = parseInt(e.target.value)
                              if (!isNaN(val) && val >= 0) {
                                handleQuantityChange(val)
                              }
                            }}
                          />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant="ghost" 
                    size="lg"
                    className="h-16 w-16" 
                    disabled={isLoading}
                    onClick={incrementQuantity}
                  >
                    <PlusIcon className="h-8 w-8" />
                  </Button>
                </div>
                
                {isLoading && (
                  <span className="text-sm text-muted-foreground animate-pulse text-center">
                    در حال بروزرسانی...
                  </span>
                )}
              </div>
            ) : (
              <Button 
                size="lg"
                className="w-full gap-3 h-14 text-lg font-medium" 
                onClick={handleAddToCart}
                disabled={isLoading}
              >
                <ShoppingCartIcon className="h-6 w-6" />
                {isLoading ? 'در حال افزودن...' : 'افزودن به سبد خرید'}
              </Button>
            )}

            {/* Total Price */}
            {quantity > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 border-t">
                <div className="text-2xl font-semibold">
                  مجموع: {discountResult.finalPrice.toLocaleString()} تومان
                </div>
              </div>
            )}
          </div>
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
              {infoTable.map((item: {key: string, value: string}, idx: number) => (
                <Fragment key={idx}>
                  <dt className="font-medium text-muted-foreground">{item.key}:</dt>
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
