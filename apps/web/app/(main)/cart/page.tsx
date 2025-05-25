import React from 'react'
import { Cart } from '@ui/components/products/Cart'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'سبد خرید | نهالتو',
  description: 'مشاهده محصولات انتخاب شده برای خرید',
}

export default function CartPage() {
  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">سبد خرید</h1>
        <Cart />
      </div>
    </div>
  )
}