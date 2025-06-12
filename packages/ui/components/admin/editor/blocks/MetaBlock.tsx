"use client"

import * as React from "react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@ui/components/ui/form"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@ui/components/ui/tabs"
import { MetaField } from "@ui/components/admin/editor/fields/MetaField"
import type { BlockProps } from "@data/usePostEditorStore"

interface MetaBlockProps extends BlockProps {
  schema?: Record<string, any>
}

const PRODUCT_META_SCHEMA = {
  general: {
    title: 'عمومی',
    fields: {
      brand: { type: 'text', label: 'برند', placeholder: 'نام برند محصول' },
      model: { type: 'text', label: 'مدل', placeholder: 'شماره یا نام مدل' },
      sku: { type: 'text', label: 'کد محصول (SKU)', placeholder: 'کد یکتای محصول' },
      barcode: { type: 'text', label: 'بارکد', placeholder: 'کد بارکد محصول' },
      customBadge: { type: 'text', label: 'نشان سفارشی', placeholder: 'مثال: جدید، ویژه' }
    }
  },
  pricing: {
    title: 'قیمت‌گذاری',
    fields: {
      priceBeforeOffer: { type: 'number', label: 'قیمت قبل از تخفیف', placeholder: '0' },
      discountConditions: { type: 'discount-table', label: 'جدول تخفیفات', placeholder: 'شرایط تخفیف بر اساس مقدار' }
    }
  },
  dimensions: {
    title: 'ابعاد و وزن',
    fields: {
      'dimensions.width': { type: 'number', label: 'عرض (cm)', placeholder: '0' },
      'dimensions.height': { type: 'number', label: 'ارتفاع (cm)', placeholder: '0' },
      'dimensions.depth': { type: 'number', label: 'عمق (cm)', placeholder: '0' },
      weight: { type: 'number', label: 'وزن (gr)', placeholder: '0' }
    }
  },
  warranty: {
    title: 'گارانتی و ارسال',
    fields: {
      warranty: { type: 'text', label: 'گارانتی', placeholder: 'مدت و نوع گارانتی' },
      shippingTime: { type: 'text', label: 'زمان ارسال', placeholder: 'مثال: 1-3 روز کاری' },
      shippingCost: { type: 'number', label: 'هزینه ارسال', placeholder: '0' }
    }
  },
  flags: {
    title: 'سایر',
    fields: {
      isLimited: { type: 'switch', label: 'سری محدود؟' },
      isDownloadable: { type: 'switch', label: 'قابل دانلود؟' },
      requiresShipping: { type: 'switch', label: 'نیاز به ارسال؟', defaultValue: true },
      isFeatured: { type: 'switch', label: 'محصول ویژه؟' }
    }
  }
}

const POST_META_SCHEMA = {
  seo: {
    title: 'سئو',
    fields: {
      metaTitle: { type: 'text', label: 'عنوان متا', placeholder: 'عنوان برای موتورهای جستجو' },
      metaDescription: { type: 'textarea', label: 'توضیحات متا', placeholder: 'توضیحات برای موتورهای جستجو' },
      focusKeyword: { type: 'text', label: 'کلمه کلیدی اصلی' }
    }
  },
  display: {
    title: 'نمایش',
    fields: {
      isFeatured: { type: 'checkbox', label: 'پست ویژه؟' },
      allowComments: { type: 'checkbox', label: 'امکان نظردهی؟', defaultValue: true },
      isSticky: { type: 'checkbox', label: 'چسبناک؟' }
    }
  }
}

export function MetaBlock({ control, postType, blockId, onUpdate, schema }: MetaBlockProps) {
  const metaSchema = schema || (postType === 'product' ? PRODUCT_META_SCHEMA : POST_META_SCHEMA)
  const tabKeys = Object.keys(metaSchema) as string[]
  const [activeTab, setActiveTab] = React.useState(tabKeys[0])

  return (
    <div className="space-y-4">
      <Tabs dir="rtl" value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="flex flex-col md:flex-row w-full">
        <TabsList className="flex md:flex-col min-w-[140px] gap-1 bg-transparent border-none h-auto self-start items-stretch">
          {tabKeys.map((key) => {
            const tabConfig = (metaSchema as any)[key]
            return (
              <TabsTrigger key={key} value={key} className="justify-start">
                {tabConfig?.title || key}
              </TabsTrigger>
            )
          })}
        </TabsList>
        
        {tabKeys.map((tabKey) => {
          const tabConfig = (metaSchema as any)[tabKey]
          if (!tabConfig?.fields) return null
          
          return (
            <TabsContent key={tabKey} value={tabKey} className="flex-1">
              <div className="space-y-3">
                {Object.entries(tabConfig.fields as Record<string, any>).map(([fieldKey, fieldConfig]: [string, any]) => (
                  <FormField
                    key={fieldKey}
                    control={control}
                    name={`meta.${fieldKey}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <MetaField
                            name={fieldKey}
                            config={fieldConfig}
                            value={field.value}
                            onChange={(value: any) => {
                              field.onChange(value)
                              // Also trigger store update for dirty state
                              onUpdate?.(`meta.${fieldKey}`, value)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
