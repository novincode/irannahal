'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@ui/lib/utils'
import { Button } from '@shadcn/button'
import { Card, CardContent } from '@shadcn/card'
import { 
  User, 
  MapPin, 
  ShoppingBag, 
  CreditCard, 
  Settings,
  LayoutDashboard,
  LogOut
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@shadcn/avatar'

interface PanelSidebarProps {
  className?: string
}

const menuItems = [
  {
    title: 'داشبورد',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'آدرس‌ها',
    href: '/addresses',
    icon: MapPin,
  },
  {
    title: 'سفارش‌ها',
    href: '/orders',
    icon: ShoppingBag,
  },
  {
    title: 'پرداخت‌ها',
    href: '/payments',
    icon: CreditCard,
  },
  {
    title: 'تنظیمات',
    href: '/settings',
    icon: Settings,
  },
]

export function PanelSidebar({ className }: PanelSidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  // Check if we're in a panel route
  const isInPanel = pathname?.startsWith('/dashboard') || pathname?.startsWith('/addresses') || 
                   pathname?.startsWith('/orders') || pathname?.startsWith('/payments') || 
                   pathname?.startsWith('/settings')

  const handleSignOut = () => {
    signOut({ redirectTo: '/' })
  }

  return (
    <aside className={cn('w-64 flex flex-col', className)}>
      {/* User Profile Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <Avatar className="h-12 w-12">
              <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {session?.user?.name || 'کاربر'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session?.user?.email || ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Menu */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const href = isInPanel ? item.href : `/panel${item.href}`
            const isActive = pathname === href || pathname?.startsWith(href + '/')
            
            return (
              <li key={item.href}>
                <Link href={href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3 h-11',
                      isActive 
                        ? 'bg-primary text-primary-foreground ' 
                        : 'hover:bg-muted'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </Button>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Sign Out Button */}
      <div className="pt-6 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          خروج از حساب
        </Button>
      </div>
    </aside>
  )
}

export default PanelSidebar
