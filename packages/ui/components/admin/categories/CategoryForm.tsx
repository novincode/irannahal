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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@ui/components/ui/alert-dialog"
import { TrashIcon } from "lucide-react"

interface CategoryFormProps {
  initialData?: Partial<CategoryFormInput> & { id?: string }
  onSubmit?: (data: CategoryFormInput) => Promise<void> | void
  onDelete?: (id: string) => Promise<void> | void
  submitLabel?: string
  parentOptions?: { value: string; label: string }[]
  isEditing?: boolean
}

export interface CategoryFormHandle {
  reset: () => void
}

export const CategoryForm = React.forwardRef<CategoryFormHandle, CategoryFormProps>(
  function CategoryForm({
    initialData,
    onSubmit,
    onDelete,
    submitLabel = "ثبت دسته‌بندی",
    parentOptions = [],
    isEditing = false,
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

    const handleDelete = async () => {
      if (initialData?.id) {
        setLoading(true)
        try {
          await onDelete?.(initialData.id)
        } finally {
          setLoading(false)
        }
      }
    }

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

          <div className="flex gap-4 justify-between">
            <Button type="submit" disabled={loading}>
              {loading ? "در حال ثبت..." : submitLabel}
            </Button>

            {/* Always show delete button in edit mode if id exists, regardless of onDelete */}
            {isEditing && initialData?.id && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" type="button" disabled={loading}>
                    <TrashIcon className="h-4 w-4 ml-2" />
                    حذف دسته‌بندی
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>حذف دسته‌بندی</AlertDialogTitle>
                    <AlertDialogDescription>
                      آیا از حذف این دسته‌بندی اطمینان دارید؟ این عمل غیرقابل بازگشت است.
                      <br />
                      دسته‌های فرزند این دسته به دسته‌های بدون والد تبدیل می‌شوند.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>انصراف</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleDelete}
                    >
                      حذف
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </form>
      </Form>
    )
  }
)
