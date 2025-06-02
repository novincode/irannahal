'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/card'
import { Button } from '@shadcn/button'
import { 
  Plus,
  MapPin, 
  ShoppingCart,
  CreditCard,
  Settings,
  User,
  Package
} from 'lucide-react'
import Link from 'next/link'

interface UserQuickActionsProps {
  className?: string
}

const quickActions = [
  {
    title: 'مشاهده محصولات',
    description: 'کاوش در کاتالوگ محصولات',
    href: '/products',
    icon: Package,
    variant: 'outline' as const,
  },
  {
    title: 'مدیریت آدرس‌ها',
    description: 'افزودن یا ویرایش آدرس‌ها',
    href: '/panel/addresses',
    icon: MapPin,
    variant: 'outline' as const,
  },
  {
    title: 'مشاهده سفارش‌ها',
    description: 'پیگیری وضعیت سفارش‌ها',
    href: '/panel/orders',
    icon: ShoppingCart,
    variant: 'outline' as const,
  },
  {
    title: 'تاریخچه پرداخت',
    description: 'مشاهده پرداخت‌های قبلی',
    href: '/panel/payments',
    icon: CreditCard,
    variant: 'outline' as const,
  },
  {
    title: 'تنظیمات حساب',
    description: 'ویرایش اطلاعات شخصی',
    href: '/panel/settings',
    icon: Settings,
    variant: 'outline' as const,
  },
]

export function UserQuickActions({ className }: UserQuickActionsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          عملیات سریع
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.href}
                variant={action.variant}
                asChild
                className="h-auto p-4 justify-start"
              >
                <Link href={action.href}>
                  <div className="flex items-center gap-3 w-full">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <div className="flex-1 text-start">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </div>
                </Link>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
