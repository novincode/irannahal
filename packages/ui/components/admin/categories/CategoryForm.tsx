"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { categoryFormSchema, CategoryFormInput } from "@actions/categories/formSchema"
import { Button } from "@ui/components/ui/button"
import { Input } from "@ui/components/ui/input"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@ui/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/components/ui/select"

interface CategoryFormProps {
  initialData?: Partial<CategoryFormInput>
  onSubmit?: (data: CategoryFormInput) => Promise<void> | void
  submitLabel?: string
  parentOptions?: { value: string; label: string }[]
}

export interface CategoryFormHandle {
  reset: () => void
}

export const CategoryForm = React.forwardRef<CategoryFormHandle, CategoryFormProps>(
  function CategoryForm({
    initialData,
    onSubmit,
    submitLabel = "ثبت دسته‌بندی",
    parentOptions = [],
  }, ref) {
    const form = useForm<CategoryFormInput>({
      resolver: zodResolver(categoryFormSchema),
      defaultValues: {
        name: "",
        slug: "",
        parentId: null,
        ...initialData,
      },
      mode: "onChange",
    })

    React.useImperativeHandle(ref, () => ({
      reset: () => form.reset({ name: "", slug: "", parentId: null })
    }), [form])

    const [loading, setLoading] = React.useState(false)

    const handleSubmit = form.handleSubmit(async (values) => {
      setLoading(true)
      try {
        await onSubmit?.(values)
        // Do not reset here; let parent handle it
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
                <FormLabel>نام دسته‌بندی</FormLabel>
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
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>دسته والد (اختیاری)</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ?? "null"}
                    onValueChange={val => field.onChange(val === "null" ? null : val)}
                    disabled={loading}
                    dir="rtl"
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="بدون والد" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">بدون والد</SelectItem>
                      {parentOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
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
)
