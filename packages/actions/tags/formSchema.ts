import { z } from "zod"
import { slugify, isValidSlug } from "@ui/lib/slug"

export const tagFormSchema = z.object({
  name: z.string().min(1, "نام برچسب الزامی است"),
  slug: z
    .string()
    .min(1, "اسلاگ الزامی است")
    .transform((val) => slugify(val))
    .refine(isValidSlug, { message: "اسلاگ معتبر نیست (فقط حروف فارسی/انگلیسی، عدد و خط تیره)" }),
})

export type TagFormInput = z.input<typeof tagFormSchema>
export type TagFormParsed = z.infer<typeof tagFormSchema>

export const updateTagSchema = tagFormSchema.extend({
  id: z.string().uuid("شناسه نامعتبر است"),
})

export type UpdateTagInput = z.input<typeof updateTagSchema>
export type UpdateTagParsed = z.infer<typeof updateTagSchema>
