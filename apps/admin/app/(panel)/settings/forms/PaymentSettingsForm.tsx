"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@shadcn/button"
import { Input } from "@shadcn/input"
import { Checkbox } from "@shadcn/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shadcn/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shadcn/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@shadcn/form"
import { Loader2, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { getPaymentSettings, updatePaymentSettings } from "@actions/settings"
import { paymentSettingsFormSchema, type PaymentSettingsFormInput } from "@actions/settings/formSchema"

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
      currency: "IRR",
      taxRate: 0,
      enabledMethods: ["bank_transfer"]
    }
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getPaymentSettings()
        
        const enabledMethods = settings["payment.enabled_methods"] 
          ? JSON.parse(settings["payment.enabled_methods"]) 
          : ["bank_transfer"]
        
        form.reset({
          currency: (settings["payment.currency"] as "IRR" | "USD" | "EUR") || "IRR",
          taxRate: parseFloat(settings["payment.tax_rate"] || "0"),
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
      await updatePaymentSettings(data)
      toast.success("تنظیمات پرداخت با موفقیت ذخیره شد")
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
          <CreditCard className="h-5 w-5" />
          تنظیمات پرداخت
        </CardTitle>
        <CardDescription>
          تنظیمات واحد پول، مالیات و روش‌های پرداخت
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
