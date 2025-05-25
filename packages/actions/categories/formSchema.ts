import { z } from "zod"
import { slugify, isValidSlug } from "@ui/lib/slug"

export const categoryFormSchema = z.object({
  name: z.string().min(1, "نام دسته‌بندی الزامی است"),
  slug: z
    .string()
    .min(1, "اسلاگ الزامی است")
    .transform((val) => slugify(val))
    .refine(isValidSlug, { message: "اسلاگ معتبر نیست (فقط حروف فارسی/انگلیسی، عدد و خط تیره)" }),
  parentId: z.string().uuid().nullable().optional(),
})

export type CategoryFormInput = z.input<typeof categoryFormSchema>
export type CategoryFormParsed = z.infer<typeof categoryFormSchema>

export const updateCategorySchema = categoryFormSchema.extend({
  id: z.string().uuid("شناسه نامعتبر است"),
})

export type UpdateCategoryInput = z.input<typeof updateCategorySchema>
export type UpdateCategoryParsed = z.infer<typeof updateCategorySchema>
