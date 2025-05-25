'use client'

import React from 'react'
import { Button } from '@ui/components/ui/button'
import { MdOutlineShoppingCart, MdAdd, MdRemove, MdClose, MdOutlineDelete } from 'react-icons/md'
import { ScrollArea } from '@ui/components/ui/scroll-area'
import { Separator } from '@ui/components/ui/separator'
import Link from 'next/link'
import { cn } from '@ui/lib/utils'
import { useCartStore } from '@data/useCartStore' // Use correct alias or relative import if needed

// Format price function
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
}

export function Cart() {
  // Zustand selectors
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clearCart)

  const isEmpty = items.length === 0
  const totalItems = items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0)

  // Map Zustand cart items to UI shape
  const uiItems = items.map(item => ({
    id: item.product.id,
    title: item.product.name,
    price: item.price,
    quantity: item.quantity,
    imageUrl: (item.product as any).thumbnail?.url || '/placeholder.png',
    slug: item.product.slug,
  }))

  const handleQuantityChange = (id: string, newQuantity: number) => {
    updateQuantity(id, newQuantity)
  }

  const handleRemove = (id: string) => {
    removeItem(id)
  }

  const handleClear = () => {
    clearCart()
  }

  const handleCheckout = () => {
    // You can add your checkout logic here
    // For now, just log
    console.log('Checkout:', items)
  }

  return (
    <div className={cn("w-full space-y-4")}> {/* className prop removed, always full width */}
      {/* Header with stats and clear button */}
      {(!isEmpty) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MdOutlineShoppingCart className="h-4 w-4" />
            <span>{totalItems} کالا در سبد خرید</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClear}
            className="text-muted-foreground hover:text-destructive text-xs h-8"
          >
            <MdOutlineDelete className="h-4 w-4 ml-1" />
            خالی کردن سبد
          </Button>
        </div>
      )}

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted/30 p-6 mb-4">
            <MdOutlineShoppingCart className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h3 className="font-medium text-lg mb-2">سبد خرید شما خالی است</h3>
          <p className="text-muted-foreground text-sm mb-6">
            محصولات مورد علاقه خود را به سبد خرید اضافه کنید
          </p>
          <Button asChild variant="default" className="px-6">
            <Link href="/products">مشاهده محصولات</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <ScrollArea className="h-[400px] border rounded-lg">
            <div className="divide-y p-1">
              {uiItems.map((item) => (
                <div key={item.id} className="group relative p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    {item.imageUrl && (
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted/50 flex-shrink-0">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    {/* Product Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <Link 
                        href={`/products/${item.slug || item.id}`}
                        className="block font-medium text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug"
                      >
                        {item.title}
                      </Link>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-primary">
                          {formatPrice(item.price)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          واحد
                        </span>
                      </div>
                    </div>
                    {/* Controls */}
                    <div className="flex flex-col items-end justify-between gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity" 
                        onClick={() => handleRemove(item.id)}
                      >
                        <MdClose className="h-4 w-4" />
                      </Button>
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-muted rounded-lg overflow-hidden">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 rounded-none hover:bg-background/80"
                          onClick={() => handleQuantityChange(item.id, Math.max(1, items.find(i => i.product.id === item.id)?.quantity! - 1))}
                          disabled={items.find(i => i.product.id === item.id)?.quantity! <= 1}
                        >
                          <MdRemove className="h-3 w-3" />
                        </Button>
                        <div className="min-w-[2.5rem] text-center text-sm font-medium bg-background/50 h-8 flex items-center justify-center">
                          {items.find(i => i.product.id === item.id)?.quantity}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 rounded-none hover:bg-background/80"
                          onClick={() => handleQuantityChange(item.id, (items.find(i => i.product.id === item.id)?.quantity! + 1))}
                        >
                          <MdAdd className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Item Total */}
                  <div className="mt-3 flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {items.find(i => i.product.id === item.id)?.quantity} × {formatPrice(item.price)}
                    </span>
                    <span className="font-semibold">
                      {formatPrice(item.price * (items.find(i => i.product.id === item.id)?.quantity || 1))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          {/* Footer Summary */}
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg border">
            <div className="flex items-center justify-between text-lg">
              <span className="font-medium">مجموع کل:</span>
              <span className="font-bold text-xl text-primary">
                {formatPrice(subtotal)}
              </span>
            </div>
            <Button 
              className="w-full h-12 text-base font-medium"
              onClick={handleCheckout}
              size="lg"
            >
              ادامه فرآیند خرید
              <MdOutlineShoppingCart className="mr-2 h-5 w-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default Cart