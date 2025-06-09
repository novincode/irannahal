"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@shadcn/button"
import { Input } from "@shadcn/input"
import { Textarea } from "@shadcn/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@shadcn/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shadcn/select"
import { Loader2 } from "lucide-react"
import { MediaPicker } from "@ui/components/admin/media/MediaPicker"

// Import settings actions and schemas
import { 
  siteSettingsFormSchema, 
  type SiteSettingsFormInput 
} from "@actions/settings/formSchema"
import { updateSiteSettings, getFreshSettings } from "@actions/settings"
import { getDefaultSetting, SITE_SETTING_KEYS } from "@actions/settings/types"
import { useSettingsStore } from "@data/useSettingsStore"

export function SiteSettingsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const { invalidateCache } = useSettingsStore()

  const form = useForm<SiteSettingsFormInput>({
    resolver: zodResolver(siteSettingsFormSchema),
    defaultValues: {
      title: getDefaultSetting(SITE_SETTING_KEYS.SITE_TITLE),
      description: getDefaultSetting(SITE_SETTING_KEYS.SITE_DESCRIPTION),
      language: getDefaultSetting(SITE_SETTING_KEYS.SITE_LANGUAGE) as "fa" | "en",
      timezone: getDefaultSetting(SITE_SETTING_KEYS.SITE_TIMEZONE),
      currency: getDefaultSetting(SITE_SETTING_KEYS.SITE_CURRENCY) as "IRR" | "USD" | "EUR",
      logoId: getDefaultSetting(SITE_SETTING_KEYS.SITE_LOGO),
      faviconId: getDefaultSetting(SITE_SETTING_KEYS.SITE_FAVICON)
    }
  })

  // Load fresh settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getFreshSettings(Object.values(SITE_SETTING_KEYS))
        
        form.reset({
          title: settings[SITE_SETTING_KEYS.SITE_TITLE] || getDefaultSetting(SITE_SETTING_KEYS.SITE_TITLE),
          description: settings[SITE_SETTING_KEYS.SITE_DESCRIPTION] || getDefaultSetting(SITE_SETTING_KEYS.SITE_DESCRIPTION),
          language: (settings[SITE_SETTING_KEYS.SITE_LANGUAGE] || getDefaultSetting(SITE_SETTING_KEYS.SITE_LANGUAGE)) as "fa" | "en",
          timezone: settings[SITE_SETTING_KEYS.SITE_TIMEZONE] || getDefaultSetting(SITE_SETTING_KEYS.SITE_TIMEZONE),
          currency: (settings[SITE_SETTING_KEYS.SITE_CURRENCY] || getDefaultSetting(SITE_SETTING_KEYS.SITE_CURRENCY)) as "IRR" | "USD" | "EUR",
          logoId: settings[SITE_SETTING_KEYS.SITE_LOGO] || getDefaultSetting(SITE_SETTING_KEYS.SITE_LOGO),
          faviconId: settings[SITE_SETTING_KEYS.SITE_FAVICON] || getDefaultSetting(SITE_SETTING_KEYS.SITE_FAVICON)
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

  async function onSubmit(data: SiteSettingsFormInput) {
    setIsLoading(true)
    try {
      await updateSiteSettings(data, SITE_SETTING_KEYS)
      
      // Invalidate both server and client caches to get fresh data
      await invalidateCache()
      
      // Reload fresh settings after cache invalidation
      const freshSettings = await getFreshSettings(Object.values(SITE_SETTING_KEYS))
      form.reset({
        title: freshSettings[SITE_SETTING_KEYS.SITE_TITLE] || getDefaultSetting(SITE_SETTING_KEYS.SITE_TITLE),
        description: freshSettings[SITE_SETTING_KEYS.SITE_DESCRIPTION] || getDefaultSetting(SITE_SETTING_KEYS.SITE_DESCRIPTION),
        language: (freshSettings[SITE_SETTING_KEYS.SITE_LANGUAGE] || getDefaultSetting(SITE_SETTING_KEYS.SITE_LANGUAGE)) as "fa" | "en",
        timezone: freshSettings[SITE_SETTING_KEYS.SITE_TIMEZONE] || getDefaultSetting(SITE_SETTING_KEYS.SITE_TIMEZONE),
        currency: (freshSettings[SITE_SETTING_KEYS.SITE_CURRENCY] || getDefaultSetting(SITE_SETTING_KEYS.SITE_CURRENCY)) as "IRR" | "USD" | "EUR",
        logoId: freshSettings[SITE_SETTING_KEYS.SITE_LOGO] || getDefaultSetting(SITE_SETTING_KEYS.SITE_LOGO),
        faviconId: freshSettings[SITE_SETTING_KEYS.SITE_FAVICON] || getDefaultSetting(SITE_SETTING_KEYS.SITE_FAVICON)
      })
      toast.success("تنظیمات سایت با موفقیت ذخیره شد")
    } catch (error) {
      console.error("خطا در ذخیره تنظیمات:", error)
      toast.error("خطا در ذخیره تنظیمات")
    } finally {
      setIsLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">در حال بارگذاری...</span>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>عنوان سایت</FormLabel>
              <FormControl>
                <Input placeholder="نام فروشگاه شما" {...field} />
              </FormControl>
              <FormDescription>
                این عنوان در تب مرورگر و موتورهای جستجو نمایش داده می‌شود
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>توضیحات سایت</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="توضیح کوتاهی از فروشگاه شما"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                این توضیحات در نتایج موتورهای جستجو نمایش داده می‌شود
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>زبان پیش‌فرض</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب زبان" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fa">فارسی</SelectItem>
                    <SelectItem value="en">انگلیسی</SelectItem>
                    <SelectItem value="ar">عربی</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>منطقه زمانی</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب منطقه زمانی" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Asia/Tehran">تهران</SelectItem>
                    <SelectItem value="Asia/Dubai">دبی</SelectItem>
                    <SelectItem value="Europe/London">لندن</SelectItem>
                    <SelectItem value="America/New_York">نیویورک</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ارز پیش‌فرض</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب ارز" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="IRR">ریال ایران (IRR)</SelectItem>
                  <SelectItem value="USD">دلار آمریکا (USD)</SelectItem>
                  <SelectItem value="EUR">یورو (EUR)</SelectItem>
                  <SelectItem value="AED">درهم امارات (AED)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="logoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>لوگوی سایت</FormLabel>
                <FormControl>
                  <MediaPicker
                    value={field.value}
                    onChange={field.onChange}
                    label="انتخاب لوگو"
                    placeholder="لوگو انتخاب نشده است"
                  />
                </FormControl>
                <FormDescription>
                  لوگوی سایت که در هدر نمایش داده می‌شود
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="faviconId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>آیکون سایت (Favicon)</FormLabel>
                <FormControl>
                  <MediaPicker
                    value={field.value}
                    onChange={field.onChange}
                    label="انتخاب آیکون"
                    placeholder="آیکون انتخاب نشده است"
                  />
                </FormControl>
                <FormDescription>
                  آیکون سایت که در تب مرورگر نمایش داده می‌شود
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          ذخیره تنظیمات
        </Button>
      </form>
    </Form>
  )
}
