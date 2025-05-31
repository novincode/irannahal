'use client'
import React from 'react'
import Logo from '@ui/components/shared/Logo'
import { Button } from '@shadcn/button'
import CommandSearch from '@ui/components/forms/CommandSearch'
import { MdOutlineShoppingCart } from "react-icons/md";
import AvatarMenu from '@ui/components/shared/AvatarMenu';
import ThemeSwitch from '@ui/components/shared/ThemeSwitch'
import { useCartStore } from '@data/useCartStore'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "@shadcn/navigation-menu"
import Link from "next/link"
import { cn } from "@ui/lib/utils"

// --- Types ---
interface NavMenuListItem {
  title: string
  href: string
  description?: string
}

interface NavMenuGroup {
  label: string
  items: NavMenuListItem[]
}

interface NavMenuConfig {
  main: NavMenuGroup[]
  links: NavMenuListItem[]
}

// --- Data ---
const navMenuConfig: NavMenuConfig = {
  main: [
    {
      label: "دسته‌بندی‌ها",
      items: [
        { title: "محصولات ویژه", href: "/products/special", description: "منتخب نهالتو" },
        { title: "درختان میوه", href: "/products/fruit-trees", description: "انواع نهال میوه" },
        { title: "گیاهان آپارتمانی", href: "/products/indoor", description: "گیاهان مناسب فضای داخلی" },
      ],
    },
    {
      label: "راهنما",
      items: [
        { title: "راهنمای خرید", href: "/guide/buying", description: "نکات خرید نهال و گیاه" },
        { title: "سوالات متداول", href: "/faq", description: "پاسخ به سوالات رایج" },
      ],
    },
  ],
  links: [
    { title: "خانه", href: "/" },
    { title: "درباره ما", href: "/about" },
    { title: "تماس با ما", href: "/contact" },
  ],
}

// --- ListItem Component ---
const ListItem = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'> & { title: string; href: string }
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          {children && (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
          )}
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

// --- MainHeader ---
const MainHeader = () => {
  const openDrawer = useCartStore((state) => state.openDrawer)
  const items = useCartStore((state) => state.items)
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className='border-b border-border bg-card'>
      <div className=' p-2'>
        <div className="container">
          <div className='flex justify-between items-center gap-2'>
            <Logo />
            <div className='max-w-[500px] flex-1'>
              <CommandSearch />

            </div>
            <div className=' flex items-center gap-2'>
              <Button 
                className='p-2 relative' 
                variant={'ghost'} 
                size={'icon_lg'}
                onClick={openDrawer}
              >
                <MdOutlineShoppingCart className='size-full' />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Button>
              <ThemeSwitch className='size-10'  />
              <AvatarMenu />
            </div>
          </div>
        </div>
      </div>
      <nav className=' p-2'>
        <div className="container flex ">
          <NavigationMenu dir='rtl'>
            <NavigationMenuList>
              {/* Dropdowns */}
              {navMenuConfig.main.map((group) => (
                <NavigationMenuItem key={group.label}>
                  <Button variant={'ghost'} asChild>

                    <NavigationMenuTrigger>
                      {group.label}
                    </NavigationMenuTrigger>
                  </Button>

                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px]">
                      {group.items.map((item) => (
                        <ListItem key={item.title} title={item.title} href={item.href}>
                          {item.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
              {/* Direct links */}
              {navMenuConfig.links.map((item) => (
                <NavigationMenuItem key={item.title}>
                  <NavigationMenuLink href={item.href} className={navigationMenuTriggerStyle()}>
                    {item.title}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </nav>
    </header>
  )
}

export default MainHeader