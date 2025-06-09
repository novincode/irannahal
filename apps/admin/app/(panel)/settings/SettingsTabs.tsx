"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shadcn/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shadcn/card"
import { 
  Globe, 
  Search, 
  Palette, 
  Mail, 
  CreditCard, 
  Truck, 
  Settings as SettingsIcon 
} from "lucide-react"

// Import setting form components
import { SiteSettingsForm } from "./forms/SiteSettingsForm"
import { SEOSettingsForm } from "./forms/SEOSettingsForm"
import { UISettingsForm } from "./forms/UISettingsForm"
import { EmailSettingsForm } from "./forms/EmailSettingsForm"
import { PaymentSettingsForm } from "./forms/PaymentSettingsForm"
import ShippingSettingsForm from "./forms/ShippingSettingsForm"
import GeneralSettingsForm from "./forms/GeneralSettingsForm"

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState("site")

  const tabs = [
    {
      value: "site",
      label: "عمومی سایت",
      icon: Globe,
      description: "تنظیمات اصلی سایت شامل نام، توضیحات و لوگو",
      component: SiteSettingsForm
    },
    {
      value: "seo",
      label: "سئو",
      icon: Search,
      description: "تنظیمات موتورهای جستجو و متاتگ‌ها",
      component: SEOSettingsForm
    },
    {
      value: "ui",
      label: "رابط کاربری",
      icon: Palette,
      description: "تنظیمات ظاهری سایت شامل تم و رنگ‌ها",
      component: UISettingsForm
    },
    {
      value: "email",
      label: "ایمیل",
      icon: Mail,
      description: "تنظیمات سرور ایمیل و SMTP",
      component: EmailSettingsForm
    },
    {
      value: "payment",
      label: "پرداخت",
      icon: CreditCard,
      description: "تنظیمات درگاه‌های پرداخت و ارز",
      component: PaymentSettingsForm
    },
    {
      value: "shipping",
      label: "ارسال",
      icon: Truck,
      description: "تنظیمات روش‌های ارسال و هزینه‌ها",
      component: ShippingSettingsForm
    },
    {
      value: "general",
      label: "عمومی",
      icon: SettingsIcon,
      description: "سایر تنظیمات عمومی سیستم",
      component: GeneralSettingsForm
    }
  ]

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-7">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          )
        })}
      </TabsList>

      {tabs.map((tab) => {
        const Component = tab.component
        return (
          <TabsContent dir="rtl" key={tab.value} value={tab.value} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </CardTitle>
                <CardDescription>
                  {tab.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Component />
              </CardContent>
            </Card>
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
