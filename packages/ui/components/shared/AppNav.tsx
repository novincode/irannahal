'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@ui/lib/utils'
import { Button } from '@ui/components/ui/button'
import { HomeIcon, SearchIcon, MenuIcon, UserIcon } from 'lucide-react'
import AppMenu from './AppMenu'

const AppNav = () => {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    {
      href: '/',
      label: 'خانه',
      icon: HomeIcon
    },
    {
      href: '/search',
      label: 'جستجو',
      icon: SearchIcon
    },
    {
      isMenu: true,
      label: 'منو',
      icon: MenuIcon,
      onClick: () => setIsMenuOpen(true)
    },
    {
      href: '/panel/dashboard',
      label: 'پروفایل',
      icon: UserIcon
    }
  ]

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background shadow-lg md:hidden">
        <div className="container py-2">
          <div className="flex items-center justify-between">
            {navItems.map((item) => (
              <Button
                key={item.isMenu ? 'menu' : item.href}
                variant="ghost"
                className={cn(
                  'flex flex-col items-center gap-2 h-auto py-4 px-4 min-w-[90px] hover:bg-muted/80 active:scale-95 transition-all rounded-xl',
                  !item.isMenu && pathname === item.href && 'text-primary bg-primary/10'
                )}
                asChild={!item.onClick}
                onClick={item.onClick}
              >
                {item.onClick ? (
                  <div className="flex flex-col items-center gap-2">
                    <item.icon className="h-10 w-10 stroke-[1.5]" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                ) : (
                  <Link href={item.href!} className="flex flex-col items-center gap-2">
                    <item.icon className="h-10 w-10 stroke-[1.5]" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                )}
              </Button>
            ))}
          </div>
        </div>
      </nav>
      
      <AppMenu 
        isOpen={isMenuOpen}
        onOpenChange={setIsMenuOpen}
      />
    </>
  )
}

export default AppNav