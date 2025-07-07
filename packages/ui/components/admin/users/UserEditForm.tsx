'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@shadcn/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@shadcn/form"
import { Input } from "@shadcn/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shadcn/select"
import { UserRole, userRoleEnum } from "@db/schema"
import { toast } from "sonner"
import { updateUser } from "@actions/users/update"

const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(userRoleEnum.enumValues),
})

interface UserEditFormProps {
  user: {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    role: UserRole
  }
}

export function UserEditForm({ user }: UserEditFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || undefined,
      email: user.email || undefined,
      phone: user.phone || undefined,
      role: user.role,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateUser(user.id, values)
      toast.success("اطلاعات کاربر با موفقیت بروزرسانی شد")
    } catch (error) {
      console.error(error)
      toast.error("خطا در بروزرسانی اطلاعات کاربر")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نام</FormLabel>
              <FormControl>
                <Input placeholder="نام کاربر" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ایمیل</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="email@example.com" 
                  {...field} 
                  value={field.value || ""} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تلفن</FormLabel>
              <FormControl>
                <Input 
                  type="tel"
                  placeholder="شماره تلفن" 
                  {...field} 
                  value={field.value || ""} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نقش</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب نقش" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {userRoleEnum.enumValues.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role === "admin" && "مدیر"}
                      {role === "user" && "کاربر"}
                      {role === "author" && "نویسنده"}
                      {role === "customer" && "مشتری"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                نقش کاربر تعیین کننده سطح دسترسی او در سیستم است
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit">
            ذخیره تغییرات
          </Button>
        </div>
      </form>
    </Form>
  )
}
