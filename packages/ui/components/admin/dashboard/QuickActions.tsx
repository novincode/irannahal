'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/card'
import { Button } from '@shadcn/button'
import { 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  Settings, 
  Plus,
  Search,
  BarChart3,
  Users
} from 'lucide-react'
import Link from 'next/link'

interface QuickAction {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  variant?: 'default' | 'outline' | 'secondary'
}

interface QuickActionsProps {
  isAdmin?: boolean
}

export function QuickActions({ isAdmin = false }: QuickActionsProps) {
  const customerActions: QuickAction[] = [
    {
      title: 'مدیریت آدرس‌ها',
      description: 'آدرس‌های تحویل خود را مدیریت کنید',
      icon: MapPin,
      href: '/panel/addresses',
      variant: 'outline',
    },
    {
      title: 'پیگیری سفارش‌ها',
      description: 'وضعیت سفارش‌های خود را ببینید',
      icon: ShoppingBag,
      href: '/panel/orders',
      variant: 'outline',
    },
    {
      title: 'تاریخچه پرداخت‌ها',
      description: 'تراکنش‌های مالی خود را مشاهده کنید',
      icon: CreditCard,
      href: '/panel/payments',
      variant: 'outline',
    },
    {
      title: 'ادامه خرید',
      description: 'محصولات جدید را کشف کنید',
      icon: Search,
      href: '/products',
      variant: 'default',
    },
  ]

  const adminActions: QuickAction[] = [
    {
      title: 'مدیریت محصولات',
      description: 'افزودن و ویرایش محصولات',
      icon: Plus,
      href: '/admin/products',
      variant: 'default',
    },
    {
      title: 'مدیریت سفارش‌ها',
      description: 'پردازش و پیگیری سفارش‌ها',
      icon: ShoppingBag,
      href: '/admin/orders',
      variant: 'outline',
    },
    {
      title: 'مدیریت کاربران',
      description: 'مشاهده و مدیریت کاربران',
      icon: Users,
      href: '/admin/users',
      variant: 'outline',
    },
    {
      title: 'گزارش‌ها و آمار',
      description: 'تحلیل فروش و عملکرد',
      icon: BarChart3,
      href: '/admin/analytics',
      variant: 'outline',
    },
    {
      title: 'تنظیمات',
      description: 'پیکربندی سیستم',
      icon: Settings,
      href: '/admin/settings',
      variant: 'secondary',
    },
  ]

  const actions = isAdmin ? adminActions : customerActions

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          دسترسی سریع
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon
            
            return (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                className="h-24 flex-col gap-2 p-4 text-center"
                asChild
              >
                <Link href={action.href}>
                  <Icon className="h-6 w-6" />
                  <div>
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {action.description}
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
