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

import { 
  seoSettingsFormSchema, 
  type SEOSettingsFormInput 
} from "@actions/settings/formSchema"
import { getFreshSettings, updateSEOSettings } from "@actions/settings"
import { getDefaultSetting, SEO_SETTING_KEYS } from "@actions/settings/types"
import { useSettingsStore } from "@data/useSettingsStore"

export function SEOSettingsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const { invalidateCache } = useSettingsStore()

  const form = useForm<SEOSettingsFormInput>({
    resolver: zodResolver(seoSettingsFormSchema),
    defaultValues: {
      title: getDefaultSetting(SEO_SETTING_KEYS.SEO_TITLE),
      description: getDefaultSetting(SEO_SETTING_KEYS.SEO_DESCRIPTION),
      keywords: getDefaultSetting(SEO_SETTING_KEYS.SEO_KEYWORDS),
      robots: getDefaultSetting(SEO_SETTING_KEYS.SEO_ROBOTS),
      googleAnalytics: getDefaultSetting(SEO_SETTING_KEYS.SEO_GOOGLE_ANALYTICS),
      googleTagManager: getDefaultSetting(SEO_SETTING_KEYS.SEO_GOOGLE_TAG_MANAGER),
      productsTitle: getDefaultSetting(SEO_SETTING_KEYS.SEO_PRODUCTS_TITLE_FORMAT),
      productsDescription: getDefaultSetting(SEO_SETTING_KEYS.SEO_PRODUCTS_DESCRIPTION_FORMAT),
      categoriesTitle: getDefaultSetting(SEO_SETTING_KEYS.SEO_CATEGORIES_TITLE_FORMAT),
      categoriesDescription: getDefaultSetting(SEO_SETTING_KEYS.SEO_CATEGORIES_DESCRIPTION_FORMAT)
    }
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getFreshSettings(Object.values(SEO_SETTING_KEYS))
        
        form.reset({
          title: settings[SEO_SETTING_KEYS.SEO_TITLE] || getDefaultSetting(SEO_SETTING_KEYS.SEO_TITLE),
          description: settings[SEO_SETTING_KEYS.SEO_DESCRIPTION] || getDefaultSetting(SEO_SETTING_KEYS.SEO_DESCRIPTION),
          keywords: settings[SEO_SETTING_KEYS.SEO_KEYWORDS] || getDefaultSetting(SEO_SETTING_KEYS.SEO_KEYWORDS),
          robots: settings[SEO_SETTING_KEYS.SEO_ROBOTS] || getDefaultSetting(SEO_SETTING_KEYS.SEO_ROBOTS),
          googleAnalytics: settings[SEO_SETTING_KEYS.SEO_GOOGLE_ANALYTICS] || getDefaultSetting(SEO_SETTING_KEYS.SEO_GOOGLE_ANALYTICS),
          googleTagManager: settings[SEO_SETTING_KEYS.SEO_GOOGLE_TAG_MANAGER] || getDefaultSetting(SEO_SETTING_KEYS.SEO_GOOGLE_TAG_MANAGER),
          productsTitle: settings[SEO_SETTING_KEYS.SEO_PRODUCTS_TITLE_FORMAT] || getDefaultSetting(SEO_SETTING_KEYS.SEO_PRODUCTS_TITLE_FORMAT),
          productsDescription: settings[SEO_SETTING_KEYS.SEO_PRODUCTS_DESCRIPTION_FORMAT] || getDefaultSetting(SEO_SETTING_KEYS.SEO_PRODUCTS_DESCRIPTION_FORMAT),
          categoriesTitle: settings[SEO_SETTING_KEYS.SEO_CATEGORIES_TITLE_FORMAT] || getDefaultSetting(SEO_SETTING_KEYS.SEO_CATEGORIES_TITLE_FORMAT),
          categoriesDescription: settings[SEO_SETTING_KEYS.SEO_CATEGORIES_DESCRIPTION_FORMAT] || getDefaultSetting(SEO_SETTING_KEYS.SEO_CATEGORIES_DESCRIPTION_FORMAT)
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

  async function onSubmit(data: SEOSettingsFormInput) {
    setIsLoading(true)
    try {
      await updateSEOSettings(data, SEO_SETTING_KEYS)
      toast.success("تنظیمات سئو با موفقیت ذخیره شد")
      
      // Invalidate both server and client caches to get fresh data
      await invalidateCache()
      
      // Fetch fresh data after cache invalidation
      const freshSettings = await getFreshSettings(Object.values(SEO_SETTING_KEYS))
      form.reset({
        title: freshSettings[SEO_SETTING_KEYS.SEO_TITLE] || getDefaultSetting(SEO_SETTING_KEYS.SEO_TITLE),
        description: freshSettings[SEO_SETTING_KEYS.SEO_DESCRIPTION] || getDefaultSetting(SEO_SETTING_KEYS.SEO_DESCRIPTION),
        keywords: freshSettings[SEO_SETTING_KEYS.SEO_KEYWORDS] || getDefaultSetting(SEO_SETTING_KEYS.SEO_KEYWORDS),
        robots: freshSettings[SEO_SETTING_KEYS.SEO_ROBOTS] || getDefaultSetting(SEO_SETTING_KEYS.SEO_ROBOTS),
        googleAnalytics: freshSettings[SEO_SETTING_KEYS.SEO_GOOGLE_ANALYTICS] || getDefaultSetting(SEO_SETTING_KEYS.SEO_GOOGLE_ANALYTICS),
        googleTagManager: freshSettings[SEO_SETTING_KEYS.SEO_GOOGLE_TAG_MANAGER] || getDefaultSetting(SEO_SETTING_KEYS.SEO_GOOGLE_TAG_MANAGER),
        productsTitle: freshSettings[SEO_SETTING_KEYS.SEO_PRODUCTS_TITLE_FORMAT] || getDefaultSetting(SEO_SETTING_KEYS.SEO_PRODUCTS_TITLE_FORMAT),
        productsDescription: freshSettings[SEO_SETTING_KEYS.SEO_PRODUCTS_DESCRIPTION_FORMAT] || getDefaultSetting(SEO_SETTING_KEYS.SEO_PRODUCTS_DESCRIPTION_FORMAT),
        categoriesTitle: freshSettings[SEO_SETTING_KEYS.SEO_CATEGORIES_TITLE_FORMAT] || getDefaultSetting(SEO_SETTING_KEYS.SEO_CATEGORIES_TITLE_FORMAT),
        categoriesDescription: freshSettings[SEO_SETTING_KEYS.SEO_CATEGORIES_DESCRIPTION_FORMAT] || getDefaultSetting(SEO_SETTING_KEYS.SEO_CATEGORIES_DESCRIPTION_FORMAT)
      })
    } catch (error) {
      console.error("Error updating SEO settings:", error)
      toast.error("خطا در ذخیره تنظیمات سئو")
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
              <FormLabel>عنوان SEO</FormLabel>
              <FormControl>
                <Input placeholder="عنوان برای موتورهای جستجو" {...field} />
              </FormControl>
              <FormDescription>
                عنوان اصلی که در نتایج گوگل نمایش داده می‌شود
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
              <FormLabel>توضیحات SEO</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="توضیحات برای موتورهای جستجو"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                توضیحات که در نتایج گوگل زیر عنوان نمایش داده می‌شود
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>کلمات کلیدی</FormLabel>
              <FormControl>
                <Input placeholder="کلمات کلیدی با کاما جدا شده" {...field} />
              </FormControl>
              <FormDescription>
                کلمات کلیدی مرتبط با سایت شما (با کاما جدا کنید)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="robots"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تنظیمات Robots</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب تنظیمات" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="index,follow">Index, Follow</SelectItem>
                  <SelectItem value="index,nofollow">Index, NoFollow</SelectItem>
                  <SelectItem value="noindex,follow">NoIndex, Follow</SelectItem>
                  <SelectItem value="noindex,nofollow">NoIndex, NoFollow</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                نحوه رفتار موتورهای جستجو با صفحات سایت
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="googleAnalytics"
            render={({ field }) => (
              <FormItem>
                <FormLabel>کد Google Analytics</FormLabel>
                <FormControl>
                  <Input placeholder="GA-XXXXXXXXX-X" {...field} />
                </FormControl>
                <FormDescription>
                  کد رهگیری Google Analytics
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="googleTagManager"
            render={({ field }) => (
              <FormItem>
                <FormLabel>کد Google Tag Manager</FormLabel>
                <FormControl>
                  <Input placeholder="GTM-XXXXXXX" {...field} />
                </FormControl>
                <FormDescription>
                  کد Google Tag Manager
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">قالب‌های خودکار SEO</h3>
          
          <FormField
            control={form.control}
            name="productsTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>قالب عنوان محصولات</FormLabel>
                <FormControl>
                  <Input placeholder="{{product_name}} | {{site_title}}" {...field} />
                </FormControl>
                <FormDescription>
                  متغیرها: {`{{product_name}}, {{site_title}}, {{category_name}}`}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="productsDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>قالب توضیحات محصولات</FormLabel>
                <FormControl>
                  <Input placeholder="{{product_description}}" {...field} />
                </FormControl>
                <FormDescription>
                  متغیرها: {`{{product_description}}, {{product_name}}, {{category_name}}`}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoriesTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>قالب عنوان دسته‌بندی‌ها</FormLabel>
                <FormControl>
                  <Input placeholder="{{category_name}} | {{site_title}}" {...field} />
                </FormControl>
                <FormDescription>
                  متغیرها: {`{{category_name}}, {{site_title}}`}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoriesDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>قالب توضیحات دسته‌بندی‌ها</FormLabel>
                <FormControl>
                  <Input placeholder="محصولات دسته‌بندی {{category_name}}" {...field} />
                </FormControl>
                <FormDescription>
                  متغیرها: {`{{category_name}}, {{category_description}}`}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          ذخیره تنظیمات SEO
        </Button>
      </form>
    </Form>
  )
}
