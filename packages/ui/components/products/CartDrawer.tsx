'use client'

import React from 'react'
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerClose,
  DrawerFooter 
} from '@ui/components/ui/drawer'
import { useCartStore } from '@data/useCartStore'
import { Cart } from './Cart'
import { Button } from '@ui/components/ui/button'
import { X } from 'lucide-react'

export function CartDrawer() {
  const isDrawerOpen = useCartStore((state) => state.isDrawerOpen)
  const closeDrawer = useCartStore((state) => state.closeDrawer)
  const items = useCartStore((state) => state.items)

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Drawer 
      open={isDrawerOpen} 
      onOpenChange={(open) => {
        if (!open) closeDrawer()
      }}
      direction="right"
    >
      <DrawerContent className="w-[400px] sm:w-[450px]">
        <DrawerHeader className="flex flex-row items-center justify-between ">
          <DrawerTitle className="text-lg font-semibold">
            سبد خرید ({totalItems} کالا)
          </DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <Cart />
        </div>
 
      </DrawerContent>
    </Drawer>
  )
}

export default CartDrawer
