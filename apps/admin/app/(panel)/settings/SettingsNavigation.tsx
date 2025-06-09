"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@ui/lib/utils"
import { 
  Globe, 
  Search, 
  Palette, 
  Mail, 
  CreditCard, 
  Truck, 
  Settings as SettingsIcon 
} from "lucide-react"

const settingsRoutes = [
  {
    href: "/settings",
    label: "عمومی سایت",
    icon: Globe,
    description: "تنظیمات اصلی سایت شامل نام، توضیحات و لوگو",
  },
  {
    href: "/settings/seo",
    label: "سئو",
    icon: Search,
    description: "تنظیمات موتورهای جستجو و متاتگ‌ها",
  },
  {
    href: "/settings/ui",
    label: "رابط کاربری",
    icon: Palette,
    description: "تنظیمات ظاهری سایت شامل تم و رنگ‌ها",
  },
  {
    href: "/settings/email",
    label: "ایمیل",
    icon: Mail,
    description: "تنظیمات سرور ایمیل و SMTP",
  },
  {
    href: "/settings/payment",
    label: "پرداخت",
    icon: CreditCard,
    description: "تنظیمات درگاه‌های پرداخت و ارز",
  },
  {
    href: "/settings/shipping",
    label: "ارسال",
    icon: Truck,
    description: "تنظیمات روش‌های ارسال و هزینه‌ها",
  },
  {
    href: "/settings/general",
    label: "عمومی",
    icon: SettingsIcon,
    description: "سایر تنظیمات عمومی سیستم",
  },
]

export function SettingsNavigation() {
  const pathname = usePathname()

  return (
    <nav className="flex space-x-2 space-x-reverse" dir="rtl">
      {settingsRoutes.map((route) => {
        const Icon = route.icon
        const isActive = pathname === route.href
        
        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              isActive 
                ? "bg-accent text-accent-foreground" 
                : "text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {route.label}
          </Link>
        )
      })}
    </nav>
  )
}
