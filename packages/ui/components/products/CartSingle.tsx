'use client'

import React from 'react'
import { Button } from '@ui/components/ui/button'
import { MdAdd, MdRemove, MdClose } from 'react-icons/md'
import { useCartStore } from '@data/useCartStore'
import Link from 'next/link'
import Image from 'next/image'
import type { ProductWithDynamicRelations } from '@actions/products/types'
import { formatPrice } from '@ui/lib/utils'

interface CartSingleProps {
  product: ProductWithDynamicRelations
  quantity: number
  price: number
  onQuantityChange?: (quantity: number) => void
  onRemove?: () => void
  showControls?: boolean
  className?: string
}

export function CartSingle({ 
  product, 
  quantity, 
  price, 
  onQuantityChange, 
  onRemove,
  showControls = true,
  className = ""
}: CartSingleProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return
    
    if (onQuantityChange) {
      onQuantityChange(newQuantity)
    } else {
      updateQuantity(product.id, newQuantity)
    }
  }

  const handleRemove = () => {
    if (onRemove) {
      onRemove()
    } else {
      removeItem(product.id)
    }
  }

  const thumbnailUrl = (product as any).thumbnail?.url || '/placeholder.png'
  const productUrl = `/products/${product.slug}`
  const totalPrice = price * quantity

  return (
    <div className={`group relative p-4 hover:bg-muted/20 transition-colors ${className}`}>
      <div className="flex gap-4">
        {/* Product Image */}
        <Link href={productUrl} className="flex-shrink-0">
          <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted/50">
            <Image 
              src={thumbnailUrl} 
              alt={product.name} 
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="80px"
            />
          </div>
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <Link 
            href={productUrl}
            className="block font-medium text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug"
          >
            {product.name}
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-primary">
              {formatPrice(price)}
            </span>
            <span className="text-xs text-muted-foreground">
              واحد
            </span>
          </div>
        </div>

        {/* Controls */}
        {showControls && (
          <div className="flex flex-col items-end justify-between gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity" 
              onClick={handleRemove}
            >
              <MdClose className="h-4 w-4" />
            </Button>

            {/* Quantity Controls */}
            <div className="flex items-center bg-muted rounded-lg overflow-hidden">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 rounded-none hover:bg-background/80"
                onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <MdRemove className="h-3 w-3" />
              </Button>
              <div className="min-w-[2.5rem] text-center text-sm font-medium bg-background/50 h-8 flex items-center justify-center">
                {quantity}
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 rounded-none hover:bg-background/80"
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                <MdAdd className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Item Total */}
      <div className="mt-3 flex justify-between items-center text-sm">
        <span className="text-muted-foreground">
          {quantity} × {formatPrice(price)}
        </span>
        <span className="font-semibold">
          {formatPrice(totalPrice)}
        </span>
      </div>
    </div>
  )
}

export default CartSingle
