"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { tagFormSchema, TagFormInput } from "@actions/tags/formSchema"
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
import { slugify } from "@ui/lib/slug"

interface TagFormProps {
  initialData?: Partial<TagFormInput> & { id?: string }
  onSubmit?: (data: TagFormInput) => Promise<void> | void
  onDelete?: (id: string) => Promise<void> | void
  submitLabel?: string
  isEditing?: boolean
}

export interface TagFormHandle {
  reset: () => void
}

export const TagForm = React.forwardRef<TagFormHandle, TagFormProps>(
  function TagForm({
    initialData,
    onSubmit,
    onDelete,
    submitLabel = "ثبت برچسب",
    isEditing = false,
  }, ref) {
    const form = useForm<TagFormInput>({
      resolver: zodResolver(tagFormSchema),
      defaultValues: {
        name: "",
        slug: "",
        ...initialData,
      },
      mode: "onChange",
    })

    React.useImperativeHandle(ref, () => ({
      reset: () => form.reset({ name: "", slug: "" }),
    }), [form])

    // Auto-generate slug from name
    React.useEffect(() => {
      const subscription = form.watch((value, { name }) => {
        if (name === 'name' && value.name && !isEditing) {
          const slug = slugify(value.name)
          form.setValue('slug', slug)
        }
      })
      
      return () => subscription.unsubscribe()
    }, [form, isEditing])

    const handleSubmit = form.handleSubmit(async (data) => {
      await onSubmit?.(data)
    })

    return (
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نام برچسب</FormLabel>
                <FormControl>
                  <Input {...field} autoFocus />
                </FormControl>
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
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
            {form.formState.isSubmitting ? "در حال ثبت..." : submitLabel}
          </Button>
        </form>
      </Form>
    )
  }
)
