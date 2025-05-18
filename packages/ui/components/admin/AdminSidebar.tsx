'use client'
import React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@shadcn/sidebar"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@shadcn/collapsible"
import { LayoutDashboard, Users, Settings, ShoppingCart, Package, CreditCard, BarChart2, ChevronDown, LogOut } from "lucide-react"
import Link from "next/link"
import { signOut } from "next-auth/react"

const items = [
  {
    title: "داشبورد",
    icon: LayoutDashboard,
    url: "",
  },
  {
    title: "محصولات",
    icon: Package,
    url: "products",
    children: [
      { title: "لیست محصولات", url: "products", icon: Package },
      { title: "افزودن محصول", url: "products/new", icon: Package },
      { title: "دسته‌بندی‌ها", url: "categories", icon: BarChart2 },
    ],
  },
  {
    title: "سفارش‌ها",
    icon: ShoppingCart,
    url: "orders",
    children: [
      { title: "همه سفارش‌ها", url: "orders", icon: ShoppingCart },
      { title: "پرداخت‌ها", url: "payments", icon: CreditCard },
    ],
  },
  {
    title: "کاربران",
    icon: Users,
    url: "users",
    children: [
      { title: "لیست کاربران", url: "users", icon: Users },
    ],
  },
  {
    title: "تنظیمات",
    icon: Settings,
    url: "settings",
  },
]

const parentButtonClass = "font-semibold text-base h-auto"

const AdminSidebar = () => {
  return (
    <Sidebar className="top-[var(--topbar-height)] h-auto"  collapsible="icon">
      <SidebarContent className="">
        <SidebarGroup>
          <SidebarGroupLabel>مدیریت فروشگاه</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) =>
                item.children ? (
                  <Collapsible key={item.title} defaultOpen className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className={parentButtonClass}>
                          <item.icon className="w-4 h-4 " />
                          {item.title}
                          <ChevronDown className="w-4 h-4 mr-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((sub) => (
                            <SidebarMenuSubItem key={sub.title}>
                              <SidebarMenuButton asChild>

                                <Link href={`/${sub.url}`} className="flex items-center">
                                  <sub.icon className="w-4 h-4 " />
                                  {sub.title}
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className={parentButtonClass}>
                      <Link href={`/${item.url}`} className="flex items-center">
                        <item.icon className="w-4 h-4 " />
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-red-600 font-semibold text-base h-auto flex items-center cursor-pointer" onClick={() => signOut()}> 
                  <LogOut className="w-4 h-4 " />
                  خروج
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export default AdminSidebar