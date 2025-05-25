'use client'
import type { ProductWithDynamicRelations } from "@actions/products/types"
import { Button } from "@shadcn/button"
import { Card } from "@shadcn/card"
import { Separator } from "@shadcn/separator"
import { Badge } from "@shadcn/badge"
import { MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react"
import Image from "next/image"
import { useState, Fragment } from "react"

interface ProductSingleProps {
  product: ProductWithDynamicRelations<{ thumbnail: true, meta: true }>
}

export function ProductSingle({ product }: ProductSingleProps) {
  const [quantity, setQuantity] = useState(1)
  const thumbnailUrl = product.thumbnail?.url || "/placeholder.png"
  
  // Process meta data to make it easier to work with
  const meta = product.meta?.reduce((acc, item) => {
    if (item.key && item.value) {
      acc[item.key] = item.value;
    }
    return acc;
  }, {} as Record<string, string>) || {};
  
  // Helper to parse complex meta fields like dimensions
  const getDimensions = () => {
    try {
      const dimensions = meta.dimensions ? JSON.parse(meta.dimensions) : null;
      return dimensions && dimensions.width 
        ? { width: dimensions.width, height: dimensions.height, depth: dimensions.depth } 
        : null;
    } catch {
      return null;
    }
  };
  
  const getInfoTable = () => {
    try {
      return meta.infoTable ? JSON.parse(meta.infoTable) : [];
    } catch {
      return [];
    }
  };
  
  const dimensions = getDimensions();
  const infoTable = getInfoTable();
  
  const incrementQuantity = () => setQuantity(prev => prev + 1)
  const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1)
  
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
          
          <div className="text-2xl font-semibold mb-6">
            {product.price?.toLocaleString()} تومان
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
          <Button size="lg" className="gap-2">
            <ShoppingCartIcon className="h-5 w-5" />
            افزودن به سبد خرید
          </Button>
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
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: product.content }} />
        </Card>
      )}
    </div>
  )
}
