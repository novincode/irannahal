import { z } from "zod"
import { productStatusEnum } from "@db/schema"

export const productStatusEnumValues = ["draft", "active", "inactive"] as const

export const productFormSchema = z.object({
  name: z.string().min(1, "نام محصول الزامی است"),
  slug: z
    .string()
    .min(1, "اسلاگ الزامی است")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "فرمت اسلاگ معتبر نیست"),
  description: z.string().optional(),
  price: z.coerce.number().int("قیمت باید عدد صحیح باشد").min(0, "قیمت نمی‌تواند منفی باشد"),
  status: z.enum(productStatusEnumValues, {
    errorMap: () => ({ message: "وضعیت محصول نامعتبر است" }),
  }),
  isDownloadable: z.boolean().default(false),
  categoryIds: z.array(z.string().uuid(), {
    required_error: "حداقل یک دسته‌بندی انتخاب کنید",
  }).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  mediaIds: z.array(z.string().uuid()).optional(),
  downloads: z.array(z.object({
    type: z.enum(["file", "link"], { errorMap: () => ({ message: "نوع دانلود نامعتبر است" }) }),
    url: z.string().url("آدرس دانلود نامعتبر است"),
    maxDownloads: z.coerce.number().int().min(0, "حداقل تعداد دانلود ۰ است").default(0),
  })).optional(),
  content: z.string().optional(),
})

// 👇 This is the raw input (user form values)
export type ProductFormInput = z.input<typeof productFormSchema>
// 👇 This is the parsed/validated shape (not needed unless you use `.parse`)
export type ProductFormParsed = z.infer<typeof productFormSchema>

export const updateProductSchema = productFormSchema.extend({
  id: z.string().uuid("شناسه نامعتبر است"),
})

export type UpdateProductInput = z.input<typeof updateProductSchema>
export type UpdateProductParsed = z.infer<typeof updateProductSchema>
