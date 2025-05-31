'use client'

import React from 'react'
import { Button } from '@ui/components/ui/button'
import { MdOutlineShoppingCart, MdOutlineDelete } from 'react-icons/md'
import { ScrollArea } from '@ui/components/ui/scroll-area'
import Link from 'next/link'
import { cn } from '@ui/lib/utils'
import { useCartStore } from '@data/useCartStore'
import { CartSingle } from './CartSingle'

// Format price function
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
}

export function Cart() {
  // Zustand selectors
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)

  const isEmpty = items.length === 0
  const totalItems = items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0)

  const handleClear = () => {
    clearCart()
  }

  const handleCheckout = () => {
    // Navigate to checkout page
    window.location.href = '/checkout'
  }

  return (
    <div className={cn("w-full flex-1 flex flex-col")}> {/* className prop removed, always full width */}
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
            <div className="divide-y">
              {items.map((item) => (
                <CartSingle
                  key={item.product.id}
                  product={item.product}
                  quantity={item.quantity}
                  price={item.price}
                />
              ))}
            </div>
          </ScrollArea>
          {/* Footer Summary */}
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg border mt-auto">
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