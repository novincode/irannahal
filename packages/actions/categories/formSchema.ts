import { z } from "zod"

export const categoryFormSchema = z.object({
  name: z.string().min(1, "نام دسته‌بندی الزامی است"),
  slug: z
    .string()
    .min(1, "اسلاگ الزامی است")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "فرمت اسلاگ معتبر نیست"),
  parentId: z.string().uuid().nullable().optional(),
})

export type CategoryFormInput = z.input<typeof categoryFormSchema>
export type CategoryFormParsed = z.infer<typeof categoryFormSchema>

export const updateCategorySchema = categoryFormSchema.extend({
  id: z.string().uuid("شناسه نامعتبر است"),
})

export type UpdateCategoryInput = z.input<typeof updateCategorySchema>
export type UpdateCategoryParsed = z.infer<typeof updateCategorySchema>
