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
import { getPublicSettings, updateSEOSettings } from "@actions/settings"

export function SEOSettingsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const form = useForm<SEOSettingsFormInput>({
    resolver: zodResolver(seoSettingsFormSchema),
    defaultValues: {
      title: "",
      description: "",
      keywords: "",
      robots: "index,follow",
      googleAnalytics: "",
      googleTagManager: "",
      productsTitle: "{{product_name}} | {{site_title}}",
      productsDescription: "{{product_description}}",
      categoriesTitle: "{{category_name}} | {{site_title}}",
      categoriesDescription: "محصولات دسته‌بندی {{category_name}}"
    }
  })

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getPublicSettings()
        
        form.reset({
          title: settings["seo.title"] || "",
          description: settings["seo.description"] || "",
          keywords: settings["seo.keywords"] || "",
          robots: settings["seo.robots"] || "index,follow",
          googleAnalytics: settings["seo.google_analytics"] || "",
          googleTagManager: settings["seo.google_tag_manager"] || "",
          productsTitle: settings["seo.products_title_format"] || "{{product_name}} | {{site_title}}",
          productsDescription: settings["seo.products_description_format"] || "{{product_description}}",
          categoriesTitle: settings["seo.categories_title_format"] || "{{category_name}} | {{site_title}}",
          categoriesDescription: settings["seo.categories_description_format"] || "محصولات دسته‌بندی {{category_name}}"
        })
      } catch (error) {
        console.error("خطا در بارگذاری تنظیمات SEO:", error)
        toast.error("خطا در بارگذاری تنظیمات SEO")
      } finally {
        setIsLoadingData(false)
      }
    }

    loadSettings()
  }, [form])

  async function onSubmit(data: SEOSettingsFormInput) {
    setIsLoading(true)
    try {
      await updateSEOSettings(data)
      toast.success("تنظیمات SEO با موفقیت ذخیره شد")
    } catch (error) {
      console.error("خطا در ذخیره تنظیمات SEO:", error)
      toast.error("خطا در ذخیره تنظیمات SEO")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
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
