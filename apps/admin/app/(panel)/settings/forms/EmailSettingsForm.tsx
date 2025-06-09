"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@shadcn/button"
import { Input } from "@shadcn/input"
import { Switch } from "@shadcn/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shadcn/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@shadcn/form"
import { Loader2, Mail, Send } from "lucide-react"
import { toast } from "sonner"
import { updateEmailSettings } from "@actions/settings"
import { emailSettingsFormSchema, type EmailSettingsFormInput } from "@actions/settings/formSchema"
import { useSettingsStore } from "@data/useSettingsStore"
import { getDefaultSetting, SETTING_KEYS } from "@actions/settings/types"

export function EmailSettingsForm() {
  const [loading, setLoading] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)

  const { 
    settings, 
    getSetting, 
    getSettingWithDefault, 
    initialized, 
    isLoading: settingsLoading,
    fetchSettings,
    invalidateCache
  } = useSettingsStore()

  const form = useForm<EmailSettingsFormInput>({
    resolver: zodResolver(emailSettingsFormSchema),
    defaultValues: {
      fromName: getDefaultSetting(SETTING_KEYS.EMAIL_FROM_NAME),
      fromAddress: getDefaultSetting(SETTING_KEYS.EMAIL_FROM_ADDRESS),
      smtpHost: getDefaultSetting(SETTING_KEYS.EMAIL_SMTP_HOST),
      smtpPort: parseInt(getDefaultSetting(SETTING_KEYS.EMAIL_SMTP_PORT) || "587"),
      smtpUser: getDefaultSetting(SETTING_KEYS.EMAIL_SMTP_USER),
      smtpPassword: getDefaultSetting(SETTING_KEYS.EMAIL_SMTP_PASSWORD),
      smtpSecure: getDefaultSetting(SETTING_KEYS.EMAIL_SMTP_SECURE) === "true"
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
        fromName: getSettingWithDefault(SETTING_KEYS.EMAIL_FROM_NAME),
        fromAddress: getSettingWithDefault(SETTING_KEYS.EMAIL_FROM_ADDRESS),
        smtpHost: getSettingWithDefault(SETTING_KEYS.EMAIL_SMTP_HOST),
        smtpPort: parseInt(getSettingWithDefault(SETTING_KEYS.EMAIL_SMTP_PORT) || "587"),
        smtpUser: getSettingWithDefault(SETTING_KEYS.EMAIL_SMTP_USER),
        smtpPassword: getSettingWithDefault(SETTING_KEYS.EMAIL_SMTP_PASSWORD),
        smtpSecure: getSettingWithDefault(SETTING_KEYS.EMAIL_SMTP_SECURE) === "true"
      })
    }
  }, [initialized, settings, getSettingWithDefault, form])

  const onSubmit = async (data: EmailSettingsFormInput) => {
    setLoading(true)
    try {
      await updateEmailSettings(data)
      invalidateCache() // Invalidate cache to refresh settings
      toast.success("تنظیمات ایمیل با موفقیت ذخیره شد")
    } catch (error) {
      console.error("خطا در ذخیره تنظیمات:", error)
      toast.error("خطا در ذخیره تنظیمات")
    } finally {
      setLoading(false)
    }
  }

  const testEmailConnection = async () => {
    setTestingEmail(true)
    try {
      // This would be a separate API endpoint to test email connection
      // For now, just show a placeholder message
      toast.info("قابلیت تست اتصال ایمیل به زودی اضافه خواهد شد")
    } catch (error) {
      console.error("خطا در تست اتصال:", error)
      toast.error("خطا در تست اتصال")
    } finally {
      setTestingEmail(false)
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
          <Mail className="h-5 w-5" />
          تنظیمات ایمیل
        </CardTitle>
        <CardDescription>
          تنظیمات سرور SMTP برای ارسال ایمیل‌های سیستم
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Sender Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">اطلاعات فرستنده</h4>
              
              <FormField
                control={form.control}
                name="fromName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام فرستنده</FormLabel>
                    <FormControl>
                      <Input placeholder="فروشگاه آنلاین" {...field} />
                    </FormControl>
                    <FormDescription>
                      نام نمایش داده شده در ایمیل‌های ارسالی
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fromAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>آدرس ایمیل فرستنده</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="noreply@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      آدرس ایمیل استفاده شده برای ارسال
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* SMTP Configuration */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">تنظیمات SMTP</h4>
              
              <FormField
                control={form.control}
                name="smtpHost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>سرور SMTP</FormLabel>
                    <FormControl>
                      <Input placeholder="smtp.gmail.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      آدرس سرور SMTP
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smtpPort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>پورت SMTP</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="587" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      پورت سرور SMTP (معمولاً 587 یا 465)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smtpUser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام کاربری SMTP</FormLabel>
                    <FormControl>
                      <Input placeholder="username@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      نام کاربری برای احراز هویت SMTP
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smtpPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز عبور SMTP</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormDescription>
                      رمز عبور برای احراز هویت SMTP
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smtpSecure"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">اتصال امن (SSL/TLS)</FormLabel>
                      <FormDescription>
                        استفاده از اتصال رمزنگاری شده برای SMTP
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

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                ذخیره تنظیمات
              </Button>

              <Button 
                type="button" 
                variant="outline"
                onClick={testEmailConnection}
                disabled={testingEmail}
              >
                {testingEmail && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {!testingEmail && <Send className="ml-2 h-4 w-4" />}
                تست اتصال
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
