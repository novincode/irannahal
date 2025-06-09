"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@shadcn/button"
import { Switch } from "@shadcn/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shadcn/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@shadcn/form"
import { Loader2, Settings } from "lucide-react"
import { toast } from "sonner"
import { getGeneralSettings, updateGeneralSettings } from "@actions/settings"
import { generalSettingsFormSchema, type GeneralSettingsFormInput } from "@actions/settings/formSchema"

export default function GeneralSettingsForm() {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const form = useForm<GeneralSettingsFormInput>({
    resolver: zodResolver(generalSettingsFormSchema),
    defaultValues: {
      maintenanceMode: false,
      registrationEnabled: true,
      guestCheckout: true,
      inventoryTracking: true
    }
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getGeneralSettings()
        
        form.reset({
          maintenanceMode: settings["general.maintenance_mode"] === "true",
          registrationEnabled: settings["general.registration_enabled"] !== "false",
          guestCheckout: settings["general.guest_checkout"] !== "false",
          inventoryTracking: settings["general.inventory_tracking"] !== "false"
        })
      } catch (error) {
        console.error("خطا در بارگذاری تنظیمات:", error)
        toast.error("خطا در بارگذاری تنظیمات")
      } finally {
        setInitialLoading(false)
      }
    }

    loadSettings()
  }, [form])

  const onSubmit = async (data: GeneralSettingsFormInput) => {
    setLoading(true)
    try {
      await updateGeneralSettings(data)
      toast.success("تنظیمات عمومی با موفقیت ذخیره شد")
    } catch (error) {
      console.error("خطا در ذخیره تنظیمات:", error)
      toast.error("خطا در ذخیره تنظیمات")
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          تنظیمات عمومی
        </CardTitle>
        <CardDescription>
          تنظیمات کلی فروشگاه و قابلیت‌های سیستم
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Site Status */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">وضعیت سایت</h4>
              
              <FormField
                control={form.control}
                name="maintenanceMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">حالت تعمیر</FormLabel>
                      <FormDescription>
                        فعال کردن حالت تعمیر برای سایت (فقط ادمین‌ها دسترسی دارند)
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* User Registration */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">تنظیمات کاربران</h4>
              
              <FormField
                control={form.control}
                name="registrationEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">ثبت‌نام کاربران جدید</FormLabel>
                      <FormDescription>
                        آیا کاربران جدید بتوانند در سایت ثبت‌نام کنند؟
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guestCheckout"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">خرید بدون ثبت‌نام</FormLabel>
                      <FormDescription>
                        آیا کاربران بتوانند بدون ثبت‌نام خرید کنند؟
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Inventory Management */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">مدیریت موجودی</h4>
              
              <FormField
                control={form.control}
                name="inventoryTracking"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">ردیابی موجودی</FormLabel>
                      <FormDescription>
                        آیا موجودی محصولات به صورت خودکار کاهش یابد؟
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Warning for Maintenance Mode */}
            {form.watch("maintenanceMode") && (
              <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <h4 className="font-medium mb-2">⚠️ هشدار:</h4>
                <p>
                  با فعال کردن حالت تعمیر، تنها ادمین‌ها به سایت دسترسی خواهند داشت. 
                  کاربران عادی صفحه "در حال تعمیر" را خواهند دید.
                </p>
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              ذخیره تنظیمات
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
