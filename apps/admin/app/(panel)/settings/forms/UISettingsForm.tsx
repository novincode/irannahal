"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@shadcn/button"
import { Input } from "@shadcn/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shadcn/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shadcn/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@shadcn/form"
import { Loader2, Palette } from "lucide-react"
import { toast } from "sonner"
import { updateUISettings } from "@actions/settings"
import { uiSettingsFormSchema, type UISettingsFormInput } from "@actions/settings/formSchema"
import { useSettingsStore } from "@data/useSettingsStore"
import { getDefaultSetting, SETTING_KEYS } from "@actions/settings/types"

export function UISettingsForm() {
  const [loading, setLoading] = useState(false)
  
  const { 
    settings, 
    getSetting, 
    getSettingWithDefault, 
    initialized, 
    isLoading: settingsLoading,
    fetchSettings,
    invalidateCache
  } = useSettingsStore()

  const form = useForm<UISettingsFormInput>({
    resolver: zodResolver(uiSettingsFormSchema),
    defaultValues: {
      theme: getDefaultSetting(SETTING_KEYS.UI_THEME) as "light" | "dark" | "auto",
      primaryColor: getDefaultSetting(SETTING_KEYS.UI_PRIMARY_COLOR),
      secondaryColor: getDefaultSetting(SETTING_KEYS.UI_SECONDARY_COLOR),
      headerStyle: getDefaultSetting(SETTING_KEYS.UI_HEADER_STYLE) as "minimal" | "classic" | "modern",
      footerStyle: getDefaultSetting(SETTING_KEYS.UI_FOOTER_STYLE) as "minimal" | "detailed" | "extended", 
      homepageLayout: getDefaultSetting(SETTING_KEYS.UI_HOMEPAGE_LAYOUT) as "grid" | "list" | "masonry"
    }
  })

  // Initialize settings
  useEffect(() => {
    if (!initialized && !settingsLoading) {
      fetchSettings()
    }
  }, [initialized, settingsLoading, fetchSettings])

  // Load settings into form when settings are loaded
  useEffect(() => {
    if (initialized && Object.keys(settings).length > 0) {
      form.reset({
        theme: (getSettingWithDefault(SETTING_KEYS.UI_THEME) as "light" | "dark" | "auto"),
        primaryColor: getSettingWithDefault(SETTING_KEYS.UI_PRIMARY_COLOR),
        secondaryColor: getSettingWithDefault(SETTING_KEYS.UI_SECONDARY_COLOR),
        headerStyle: (getSettingWithDefault(SETTING_KEYS.UI_HEADER_STYLE) as "minimal" | "classic" | "modern"),
        footerStyle: (getSettingWithDefault(SETTING_KEYS.UI_FOOTER_STYLE) as "minimal" | "detailed" | "extended"),
        homepageLayout: (getSettingWithDefault(SETTING_KEYS.UI_HOMEPAGE_LAYOUT) as "grid" | "list" | "masonry")
      })
    }
  }, [initialized, settings, getSettingWithDefault, form])

  const onSubmit = async (data: UISettingsFormInput) => {
    setLoading(true)
    try {
      await updateUISettings(data)
      invalidateCache() // Invalidate cache to refresh settings
      toast.success("تنظیمات رابط کاربری با موفقیت ذخیره شد")
    } catch (error) {
      console.error("خطا در ذخیره تنظیمات:", error)
      toast.error("خطا در ذخیره تنظیمات")
    } finally {
      setLoading(false)
    }
  }

  if (!initialized) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">در حال بارگذاری...</span>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          تنظیمات رابط کاربری
        </CardTitle>
        <CardDescription>
          تم، رنگ‌ها و طراحی کلی فروشگاه را مدیریت کنید
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Theme Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">تنظیمات تم</h4>
              
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تم پیش‌فرض</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب تم" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="light">روشن</SelectItem>
                        <SelectItem value="dark">تیره</SelectItem>
                        <SelectItem value="auto">خودکار (براساس سیستم)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      تم پیش‌فرض برای کاربران جدید
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Color Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">تنظیمات رنگ</h4>
              
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رنگ اصلی</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input type="color" className="w-20 h-10" {...field} />
                      </FormControl>
                      <FormControl>
                        <Input placeholder="#3b82f6" {...field} />
                      </FormControl>
                    </div>
                    <FormDescription>
                      رنگ اصلی برای دکمه‌ها، لینک‌ها و عناصر برجسته
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secondaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رنگ ثانویه (اختیاری)</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input type="color" className="w-20 h-10" {...field} />
                      </FormControl>
                      <FormControl>
                        <Input placeholder="#6b7280" {...field} />
                      </FormControl>
                    </div>
                    <FormDescription>
                      رنگ ثانویه برای عناصر کمتر اهمیت
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Layout Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">تنظیمات طراحی</h4>
              
              <FormField
                control={form.control}
                name="headerStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>سبک هدر</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب سبک هدر" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="minimal">کمینه</SelectItem>
                        <SelectItem value="classic">کلاسیک</SelectItem>
                        <SelectItem value="modern">مدرن</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      نحوه نمایش هدر سایت
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="footerStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>سبک فوتر</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب سبک فوتر" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="minimal">کمینه</SelectItem>
                        <SelectItem value="detailed">تفصیلی</SelectItem>
                        <SelectItem value="extended">گسترده</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      نحوه نمایش فوتر سایت
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="homepageLayout"
                render={({ field }) => (
                  <FormItem>  
                    <FormLabel>طراحی صفحه اصلی</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب طراحی صفحه اصلی" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="grid">شبکه‌ای</SelectItem>
                        <SelectItem value="list">لیستی</SelectItem>
                        <SelectItem value="masonry">آجری</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      نحوه نمایش محصولات در صفحه اصلی
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
