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

// Import settings actions and schemas
import { 
  siteSettingsFormSchema, 
  type SiteSettingsFormInput 
} from "@actions/settings/formSchema"
import { useSettingsStore } from "@data/useSettingsStore"

export function SiteSettingsForm() {
  const [isLoading, setIsLoading] = useState(false)
  
  const { settings, getSetting, updateSiteSettings: updateSettings, isLoaded } = useSettingsStore()

  const form = useForm<SiteSettingsFormInput>({
    resolver: zodResolver(siteSettingsFormSchema),
    defaultValues: {
      title: "",
      description: "",
      language: "fa",
      timezone: "Asia/Tehran",
      currency: "IRR",
      logoId: "",
      faviconId: ""
    }
  })

  // Load settings into form when settings are loaded
  useEffect(() => {
    if (isLoaded && Object.keys(settings).length > 0) {
      form.reset({
        title: getSetting("site.title", ""),
        description: getSetting("site.description", ""),
        language: (getSetting("site.language", "fa") as "fa" | "en"),
        timezone: getSetting("site.timezone", "Asia/Tehran"), 
        currency: (getSetting("site.currency", "IRR") as "IRR" | "USD" | "EUR"),
        logoId: getSetting("site.logo", ""),
        faviconId: getSetting("site.favicon", "")
      })
    }
  }, [isLoaded, settings, getSetting, form])

  async function onSubmit(data: SiteSettingsFormInput) {
    setIsLoading(true)
    try {
      await updateSettings(data)
      toast.success("تنظیمات سایت با موفقیت ذخیره شد")
    } catch (error) {
      console.error("خطا در ذخیره تنظیمات:", error)
      toast.error("خطا در ذخیره تنظیمات")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoaded) {
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
                  <Input placeholder="شناسه تصویر لوگو" {...field} />
                </FormControl>
                <FormDescription>
                  شناسه تصویر لوگو از بخش رسانه
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
                  <Input placeholder="شناسه تصویر آیکون" {...field} />
                </FormControl>
                <FormDescription>
                  شناسه تصویر آیکون از بخش رسانه
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
