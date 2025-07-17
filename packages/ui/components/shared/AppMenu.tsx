'use client'

import React, { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetTrigger, SheetHeader } from '@ui/components/ui/sheet'
import { Button } from '@ui/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { MdOutlineShoppingCart } from "react-icons/md"
import Link from 'next/link'
import { cachedGetMenuBySlug } from '@actions/menu'
import { useGlobalRefresh } from '@data/globalRefresh'
import { useCartStore } from '@data/useCartStore'
import type { MenuItemWithChildren } from '@actions/menu/types'
import { cn } from '@ui/lib/utils'
import Logo from '@ui/components/shared/Logo'

interface AppMenuProps {
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    trigger?: React.ReactNode
}

interface CollapsibleMenuItemProps {
    item: MenuItemWithChildren
    level?: number
}

const CollapsibleMenuItem: React.FC<CollapsibleMenuItemProps> = ({ item, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false)
  const hasChildren = item.children && item.children.length > 0

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  return (
    <div className="space-y-1">
      <div className="flex">
        <Button
          variant="ghost"
          className={cn(
            'flex-1',
            'justify-start',
            level > 0 && 'text-sm'
          )}
          asChild
        >
          <Link href={item.url || '#'}>
            <span>{item.label}</span>
          </Link>
        </Button>
        
        {hasChildren && (
          <Button
            variant="ghost"
            size="icon"
            className="px-2"
            onClick={handleToggle}
          >
            <ChevronLeft className={cn(
              'h-4 w-4 transition-transform duration-200',
              isOpen && 'transform rotate-90'
            )} />
          </Button>
        )}
      </div>
      
      {hasChildren && isOpen && (
        <div className={cn(
          'space-y-1',
          level > 0 ? 'pr-3' : 'pr-4',
          'border-r'
        )}>
          {item.children.map((child) => (
            <CollapsibleMenuItem
              key={child.id}
              item={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const AppMenu: React.FC<AppMenuProps> = ({ isOpen, onOpenChange, trigger }) => {
    const [menu, setMenu] = useState<MenuItemWithChildren[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const items = useCartStore((state) => state.items)
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

    const fetchMenu = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const menuData = await cachedGetMenuBySlug('header')
            setMenu(menuData.items || [])
        } catch (err) {
            console.error('Failed to load mobile menu:', err)
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setIsLoading(false)
        }
    }

    // Initial load
    useEffect(() => {
        fetchMenu()
    }, [])

    // Listen for global refresh events
    useEffect(() => {
        const cleanup = useGlobalRefresh((detail) => {
            console.log('🔄 AppMenu: Received refresh event, refreshing menu...', detail)
            fetchMenu()
        }, ['menu', 'all'])

        return cleanup
    }, [])

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
            <SheetContent side="right" className="w-80 h-full p-0 flex flex-col">
                <div className="sticky top-0 z-10 bg-background border-b p-6">
                    <Logo />
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="text-sm text-muted-foreground">در حال بارگذاری منو...</div>
                    ) : error ? (
                        <div className="text-sm text-destructive">خطا در بارگذاری منو</div>
                    ) : menu.length === 0 ? (
                        <div className="text-sm text-muted-foreground">موردی یافت نشد</div>
                    ) : (
                        <nav className="space-y-2">
                            {menu.map((item) => (
                                <CollapsibleMenuItem key={item.id} item={item} />
                            ))}
                        </nav>
                    )}
                </div>

                <div className="sticky bottom-0 z-10 bg-background border-t p-4">
                    <Button 
                        className="w-full relative" 
                        asChild
                    >
                        <Link href="/cart" className="flex items-center justify-center gap-2">
                            <MdOutlineShoppingCart className="size-5" />
                            <span>سبد خرید</span>
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                                    {totalItems > 9 ? '9+' : totalItems}
                                </span>
                            )}
                        </Link>
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default AppMenu
