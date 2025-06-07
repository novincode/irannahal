'use client'

import React from 'react'
import Link from 'next/link'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@shadcn/navigation-menu"
import { Button } from '@shadcn/button'
import { cn } from '@ui/lib/utils'
import type { MenuItemWithChildren } from '@actions/menu/types'

interface MenuDisplayProps {
  items: MenuItemWithChildren[]
  className?: string
}

interface MenuItemDisplayProps {
  item: MenuItemWithChildren
}

// Component for rendering individual menu items
const MenuItemDisplay: React.FC<MenuItemDisplayProps> = ({ item }) => {
  // Don't render if not visible
  if (!item.isVisible) return null

  const hasChildren = item.children && item.children.length > 0
  const visibleChildren = item.children?.filter(child => child.isVisible) || []

  // If item has visible children, render as dropdown
  if (hasChildren && visibleChildren.length > 0) {
    return (
      <NavigationMenuItem>
        <Button variant="ghost" asChild>
          <NavigationMenuTrigger>
            {item.label}
          </NavigationMenuTrigger>
        </Button>
        <NavigationMenuContent>
          <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-1">
            {visibleChildren.map((child) => (
              <MenuSubItem key={child.id} item={child} level={0} />
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    )
  }

  // Regular menu item without children
  return (
    <NavigationMenuItem>
      <NavigationMenuLink 
        href={item.url || '#'} 
        className={navigationMenuTriggerStyle()}
        target={item.target || '_self'}
        rel={item.rel || undefined}
      >
        {item.label}
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}

// Component for rendering sub-menu items in dropdowns with infinite nesting support
const MenuSubItem = React.forwardRef<
  HTMLAnchorElement,
  { item: MenuItemWithChildren; level?: number }
>(({ item, level = 0 }, ref) => {
  if (!item.isVisible) return null

  const hasChildren = item.children && item.children.length > 0
  const visibleChildren = item.children?.filter(child => child.isVisible) || []

  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          href={item.url || '#'}
          target={item.target || '_self'}
          rel={item.rel || undefined}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            level > 0 && "ml-4 border-l border-border pl-3" // Indent nested items
          )}
        >
          <div className="text-sm font-medium leading-none">{item.label}</div>
        </Link>
      </NavigationMenuLink>
      {/* Render nested children as separate list items to avoid nested <a> tags */}
      {hasChildren && visibleChildren.length > 0 && (
        <ul className="mt-2 space-y-1">
          {visibleChildren.map((nestedChild) => (
            <MenuSubItem 
              key={nestedChild.id} 
              item={nestedChild} 
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
})
MenuSubItem.displayName = 'MenuSubItem'

// Main Menu Display Component
const MenuDisplay: React.FC<MenuDisplayProps> = ({ items, className }) => {
  // Filter out invisible items and get only root-level items
  const visibleRootItems = items.filter(item => item.isVisible && !item.parentId)

  if (!visibleRootItems.length) {
    return null
  }

  return (
    <NavigationMenu dir="rtl" className={className}>
      <NavigationMenuList>
        {visibleRootItems.map((item) => (
          <MenuItemDisplay key={item.id} item={item} />
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export default MenuDisplay
