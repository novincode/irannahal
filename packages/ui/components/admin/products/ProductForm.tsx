"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productFormSchema, ProductFormInput } from "@actions/products/formSchema"
import { Button } from "@ui/components/ui/button"
import { Input } from "@ui/components/ui/input"
import { Checkbox } from "@ui/components/ui/checkbox"
import { Textarea } from "@ui/components/ui/textarea"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@ui/components/ui/form"

interface ProductFormProps {
  initialData?: Partial<ProductFormInput>
  onSubmit?: (data: ProductFormInput) => Promise<void> | void
  submitLabel?: string
}

export function ProductForm({
  initialData,
  onSubmit,
  submitLabel = "ثبت محصول",
}: ProductFormProps) {
  const form = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      status: "draft",
      isDownloadable: false,
      categoryIds: [],
      tagIds: [],
      mediaIds: [],
      downloads: [],
      content: "",
      ...initialData,
    },
    mode: "onChange",
  })

  const [loading, setLoading] = React.useState(false)

  const handleSubmit = form.handleSubmit(async (values) => {
    setLoading(true)
    try {
      await onSubmit?.(values)
    } finally {
      setLoading(false)
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نام محصول</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسلاگ</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>توضیحات</FormLabel>
              <FormControl><Textarea {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>قیمت</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>وضعیت</FormLabel>
              <FormControl>
                <select {...field} className="border rounded px-2 py-1">
                  <option value="draft">پیش‌نویس</option>
                  <option value="active">فعال</option>
                  <option value="inactive">غیرفعال</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isDownloadable"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="mb-0">دانلودی است؟</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>محتوا</FormLabel>
              <FormControl><Textarea rows={5} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? "در حال ثبت..." : submitLabel}
        </Button>
      </form>
    </Form>
  )
}
