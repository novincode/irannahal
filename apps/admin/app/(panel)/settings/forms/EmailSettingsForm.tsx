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
import { getEmailSettings, updateEmailSettings } from "@actions/settings"
import { emailSettingsFormSchema, type EmailSettingsFormInput } from "@actions/settings/formSchema"

export function EmailSettingsForm() {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [testingEmail, setTestingEmail] = useState(false)

  const form = useForm<EmailSettingsFormInput>({
    resolver: zodResolver(emailSettingsFormSchema),
    defaultValues: {
      fromName: "",
      fromAddress: "",
      smtpHost: "",
      smtpPort: 587,
      smtpUser: "",
      smtpPassword: "",
      smtpSecure: false
    }
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getEmailSettings()
        
        form.reset({
          fromName: settings["email.from_name"] || "",
          fromAddress: settings["email.from_address"] || "",
          smtpHost: settings["email.smtp_host"] || "",
          smtpPort: parseInt(settings["email.smtp_port"] || "587"),
          smtpUser: settings["email.smtp_user"] || "",
          smtpPassword: settings["email.smtp_password"] || "",
          smtpSecure: settings["email.smtp_secure"] === "true"
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

  const onSubmit = async (data: EmailSettingsFormInput) => {
    setLoading(true)
    try {
      await updateEmailSettings(data)
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
