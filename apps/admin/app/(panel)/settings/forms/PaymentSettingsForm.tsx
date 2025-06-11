"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@shadcn/button"
import { Input } from "@shadcn/input"
import { Checkbox } from "@shadcn/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shadcn/select"

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@shadcn/form"
import { Loader2, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { getFreshSettings, updatePaymentSettings } from "@actions/settings"
import { paymentSettingsFormSchema, type PaymentSettingsFormInput } from "@actions/settings/formSchema"
import { getDefaultSetting, PAYMENT_SETTING_KEYS, SITE_SETTING_KEYS } from "@actions/settings/types"

const PAYMENT_METHODS = [
  { id: "bank_transfer", label: "انتقال بانکی" },
  { id: "card", label: "کارت اعتباری/نقدی" },
  { id: "wallet", label: "کیف پول" },
  { id: "cash_on_delivery", label: "پرداخت در محل" },
] as const

export function PaymentSettingsForm() {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const form = useForm<PaymentSettingsFormInput>({
    resolver: zodResolver(paymentSettingsFormSchema),
    defaultValues: {
      currency: getDefaultSetting(SITE_SETTING_KEYS.SITE_CURRENCY) as "IRR" | "USD" | "EUR",
      taxRate: parseFloat(getDefaultSetting(PAYMENT_SETTING_KEYS.PAYMENT_TAX_RATE) || "0"),
      enabledMethods: JSON.parse(getDefaultSetting(PAYMENT_SETTING_KEYS.PAYMENT_ENABLED_METHODS) || '["bank_transfer"]')
    }
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Need to fetch both site currency and payment settings
        const allKeys = [...Object.values(PAYMENT_SETTING_KEYS), SITE_SETTING_KEYS.SITE_CURRENCY]
        const settings = await getFreshSettings(allKeys)
        
        const enabledMethods = settings[PAYMENT_SETTING_KEYS.PAYMENT_ENABLED_METHODS]
          ? JSON.parse(settings[PAYMENT_SETTING_KEYS.PAYMENT_ENABLED_METHODS] as string)
          : JSON.parse(getDefaultSetting(PAYMENT_SETTING_KEYS.PAYMENT_ENABLED_METHODS) || '["bank_transfer"]')
        
        form.reset({
          currency: (settings[SITE_SETTING_KEYS.SITE_CURRENCY] || getDefaultSetting(SITE_SETTING_KEYS.SITE_CURRENCY)) as "IRR" | "USD" | "EUR",
          taxRate: parseFloat(settings[PAYMENT_SETTING_KEYS.PAYMENT_TAX_RATE] || getDefaultSetting(PAYMENT_SETTING_KEYS.PAYMENT_TAX_RATE) || "0"),
          enabledMethods: enabledMethods
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

  const onSubmit = async (data: PaymentSettingsFormInput) => {
    setLoading(true)
    try {
      await updatePaymentSettings(data, PAYMENT_SETTING_KEYS)
      toast.success("تنظیمات پرداخت با موفقیت ذخیره شد")
      
      // Fetch fresh data after update
      const allKeys = [...Object.values(PAYMENT_SETTING_KEYS), SITE_SETTING_KEYS.SITE_CURRENCY]
      const freshSettings = await getFreshSettings(allKeys)
      
      const enabledMethods = freshSettings[PAYMENT_SETTING_KEYS.PAYMENT_ENABLED_METHODS]
        ? JSON.parse(freshSettings[PAYMENT_SETTING_KEYS.PAYMENT_ENABLED_METHODS] as string)
        : JSON.parse(getDefaultSetting(PAYMENT_SETTING_KEYS.PAYMENT_ENABLED_METHODS) || '["bank_transfer"]')
      
      form.reset({
        currency: (freshSettings[SITE_SETTING_KEYS.SITE_CURRENCY] || getDefaultSetting(SITE_SETTING_KEYS.SITE_CURRENCY)) as "IRR" | "USD" | "EUR",
        taxRate: parseFloat(freshSettings[PAYMENT_SETTING_KEYS.PAYMENT_TAX_RATE] || getDefaultSetting(PAYMENT_SETTING_KEYS.PAYMENT_TAX_RATE) || "0"),
        enabledMethods: enabledMethods
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
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">در حال بارگذاری...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          تنظیمات پرداخت
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          تنظیمات واحد پول، مالیات و روش‌های پرداخت
        </p>
      </div>
      
      <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Currency Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">تنظیمات واحد پول</h4>
              
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>واحد پول پیش‌فرض</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب واحد پول" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IRR">ریال ایران (IRR)</SelectItem>
                        <SelectItem value="USD">دلار آمریکا (USD)</SelectItem>
                        <SelectItem value="EUR">یورو (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      واحد پول پیش‌فرض برای نمایش قیمت‌ها
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tax Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">تنظیمات مالیات</h4>
              
              <FormField
                control={form.control}
                name="taxRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نرخ مالیات (درصد)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        step="0.1"
                        min="0"
                        max="100"
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      نرخ مالیات به صورت درصد (مثال: 9 برای 9%)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Payment Methods */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">روش‌های پرداخت فعال</h4>
              
              <FormField
                control={form.control}
                name="enabledMethods"
                render={() => (
                  <FormItem>
                    <FormLabel>روش‌های پرداخت</FormLabel>
                    <div className="space-y-3">
                      {PAYMENT_METHODS.map((method) => (
                        <FormField
                          key={method.id}
                          control={form.control}
                          name="enabledMethods"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={method.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(method.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), method.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== method.id
                                            ) || []
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {method.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormDescription>
                      روش‌های پرداخت که برای مشتریان فعال هستند
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
    </div>
  )
}
