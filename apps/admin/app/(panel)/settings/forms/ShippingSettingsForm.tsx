"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@shadcn/button"
import { Input } from "@shadcn/input"
import { Switch } from "@shadcn/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shadcn/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@shadcn/form"
import { Loader2, Truck } from "lucide-react"
import { toast } from "sonner"
import { getFreshSettings, updateShippingSettings } from "@actions/settings"
import { shippingSettingsFormSchema, type ShippingSettingsFormInput } from "@actions/settings/formSchema"
import { getDefaultSetting, SHIPPING_SETTING_KEYS } from "@actions/settings/types"

export default function ShippingSettingsForm() {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const form = useForm<ShippingSettingsFormInput>({
    resolver: zodResolver(shippingSettingsFormSchema),
    defaultValues: {
      enabled: getDefaultSetting(SHIPPING_SETTING_KEYS.SHIPPING_ENABLED) === "true",
      freeThreshold: parseFloat(getDefaultSetting(SHIPPING_SETTING_KEYS.SHIPPING_FREE_THRESHOLD) || "0"),
      defaultCost: parseFloat(getDefaultSetting(SHIPPING_SETTING_KEYS.SHIPPING_DEFAULT_COST) || "0")
    }
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getFreshSettings(Object.values(SHIPPING_SETTING_KEYS))
        
        form.reset({
          enabled: (settings[SHIPPING_SETTING_KEYS.SHIPPING_ENABLED] || getDefaultSetting(SHIPPING_SETTING_KEYS.SHIPPING_ENABLED)) === "true",
          freeThreshold: parseFloat(settings[SHIPPING_SETTING_KEYS.SHIPPING_FREE_THRESHOLD] || getDefaultSetting(SHIPPING_SETTING_KEYS.SHIPPING_FREE_THRESHOLD) || "0"),
          defaultCost: parseFloat(settings[SHIPPING_SETTING_KEYS.SHIPPING_DEFAULT_COST] || getDefaultSetting(SHIPPING_SETTING_KEYS.SHIPPING_DEFAULT_COST) || "0")
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

  const onSubmit = async (data: ShippingSettingsFormInput) => {
    setLoading(true)
    try {
      await updateShippingSettings(data, SHIPPING_SETTING_KEYS)
      toast.success("تنظیمات ارسال با موفقیت ذخیره شد")
      
      // Fetch fresh data after update
      const freshSettings = await getFreshSettings(Object.values(SHIPPING_SETTING_KEYS))
      form.reset({
        enabled: (freshSettings[SHIPPING_SETTING_KEYS.SHIPPING_ENABLED] || getDefaultSetting(SHIPPING_SETTING_KEYS.SHIPPING_ENABLED)) === "true",
        freeThreshold: parseFloat(freshSettings[SHIPPING_SETTING_KEYS.SHIPPING_FREE_THRESHOLD] || getDefaultSetting(SHIPPING_SETTING_KEYS.SHIPPING_FREE_THRESHOLD) || "0"),
        defaultCost: parseFloat(freshSettings[SHIPPING_SETTING_KEYS.SHIPPING_DEFAULT_COST] || getDefaultSetting(SHIPPING_SETTING_KEYS.SHIPPING_DEFAULT_COST) || "0")
      })
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
          <Truck className="h-5 w-5" />
          تنظیمات ارسال
        </CardTitle>
        <CardDescription>
          تنظیمات هزینه و شرایط ارسال محصولات
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Shipping Status */}
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">فعال بودن ارسال</FormLabel>
                    <FormDescription>
                      آیا امکان ارسال محصولات فعال باشد؟
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

            {/* Free Shipping Threshold */}
            <FormField
              control={form.control}
              name="freeThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>حد آستانه ارسال رایگان</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      step="1000"
                      min="0"
                      {...field} 
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    حداقل مبلغ خرید برای ارسال رایگان (صفر = بدون ارسال رایگان)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Default Shipping Cost */}
            <FormField
              control={form.control}
              name="defaultCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>هزینه پیش‌فرض ارسال</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      step="1000"
                      min="0"
                      {...field} 
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    هزینه پیش‌فرض ارسال برای سفارشات زیر حد آستانه رایگان
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Information Box */}
            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
              <h4 className="font-medium mb-2">نکات مهم:</h4>
              <ul className="space-y-1 text-xs">
                <li>• اگر حد آستانه ارسال رایگان صفر باشد، هیچ سفارشی ارسال رایگان نخواهد بود</li>
                <li>• هزینه ارسال برای سفارشات بالای حد آستانه صفر خواهد بود</li>
                <li>• می‌توانید هزینه‌های مختلف بر اساس منطقه جغرافیایی تعریف کنید</li>
              </ul>
            </div>

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
