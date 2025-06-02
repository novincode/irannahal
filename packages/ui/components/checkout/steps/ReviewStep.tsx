'use client'

import React, { useState } from 'react'
import { Button } from '@ui/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@ui/components/ui/card'
import { Separator } from '@ui/components/ui/separator'
import { ScrollArea } from '@ui/components/ui/scroll-area'
import { MdVisibility, MdShoppingCart, MdLocationOn, MdLocalShipping, MdArrowBack, MdArrowForward } from 'react-icons/md'
import { useCheckout } from '../CheckoutContext'
import { useCartStore } from '@data/useCartStore'
import { createOrder } from '@actions/orders/create'
import { CartSingle } from '@ui/components/products/CartSingle'
import { toast } from 'sonner'
import { formatPrice } from '@ui/lib/utils'
import { useRouter } from 'next/navigation'

export function ReviewStep() {
  const { state, setOrderId, proceedToNext, setStep } = useCheckout()
  const cartItems = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  const shippingCost = state.selectedShippingMethod?.price || 0
  const total = subtotal + shippingCost

  const handleCreateOrder = async () => {
    // Prevent duplicate orders
    if (loading || state.orderId) {
      return
    }
    
    if (!state.selectedAddressId || !state.selectedShippingMethod) {
      toast.error('لطفاً آدرس و روش ارسال را انتخاب کنید')
      return
    }

    setLoading(true)
    try {
      const orderData = {
        addressId: state.selectedAddressId,
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.price
        })),
        // Add shipping cost to order somehow - you might need to modify the schema
        // For now, we'll include it in the total calculation
      }

      const order = await createOrder(orderData)
      
      if (order?.id) {
        setOrderId(order.id)
        
        // Clear cart since order is created
        clearCart()
        
        toast.success('سفارش با موفقیت ثبت شد')
        
        // Redirect to payment page
        router.push(`/panel/orders/${order.id}/payment`)
      }
    } catch (error) {
      console.error('Failed to create order:', error)
      toast.error('خطا در ثبت سفارش')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep('shipping')
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
          <MdVisibility className="w-5 h-5" />
          بررسی نهایی سفارش
        </h3>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MdShoppingCart className="w-4 h-4" />
                محصولات سفارش ({cartItems.length} محصول)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <CartSingle
                      key={item.product.id}
                      product={item.product}
                      quantity={item.quantity}
                      price={item.price}
                      showControls={false}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <div className="space-y-4">
            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MdLocationOn className="w-4 h-4" />
                  آدرس ارسال
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  آدرس انتخاب شده: {state.selectedAddressId}
                </p>
              </CardContent>
            </Card>

            {/* Shipping */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MdLocalShipping className="w-4 h-4" />
                  روش ارسال
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{state.selectedShippingMethod?.name}</span>
                    <span>{formatPrice(shippingCost)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {state.selectedShippingMethod?.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Price Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MdArrowForward className="w-4 h-4" />
                  خلاصه مبالغ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>قیمت کالاها:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>هزینه ارسال:</span>
                  <span>{formatPrice(shippingCost)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>مجموع کل:</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <MdArrowBack className="h-4 w-4" />
            بازگشت
          </Button>
          
          <Button 
            onClick={handleCreateOrder} 
            disabled={loading}
            size="lg"
            className="gap-2"
          >
            {loading ? 'در حال ثبت سفارش...' : 'ثبت سفارش و ادامه پرداخت'}
            <MdArrowForward className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
