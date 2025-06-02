import { 
  User, 
  MapPin, 
  ShoppingBag, 
  CreditCard, 
  Settings,
  LayoutDashboard,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface MenuItem {
  title: string
  href: string
  icon: LucideIcon
}

export const panelMenuItems: MenuItem[] = [
  {
    title: 'داشبورد',
    href: '/panel/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'آدرس‌ها',
    href: '/panel/addresses',
    icon: MapPin,
  },
  {
    title: 'سفارش‌ها',
    href: '/panel/orders',
    icon: ShoppingBag,
  },
  {
    title: 'پرداخت‌ها',
    href: '/panel/payments',
    icon: CreditCard,
  },
  {
    title: 'تنظیمات',
    href: '/panel/settings',
    icon: Settings,
  },
]
