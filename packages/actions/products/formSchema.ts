import { z } from "zod"
import { productStatusEnum } from "@db/schema"
import { slugify, isValidSlug } from "@ui/lib/slug"

// --- Product Meta Schema ---
export const productFormMetaSchema = z.object({
  brand: z.string().optional(), // Brand name
  model: z.string().optional(), // Model code/number
  sku: z.string().optional(), // SKU code
  barcode: z.string().optional(), // Barcode (EAN/UPC)
  warranty: z.string().optional(), // e.g., "12 ماه گارانتی تعویض"
  shippingTime: z.string().optional(), // e.g., "ارسال 3 روزه"
  weight: z.number().min(0).optional(), // in grams
  dimensions: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    depth: z.number().optional(),
  }).optional(),
  isLimited: z.boolean().default(false).optional(), // true if limited edition
  customBadge: z.string().optional(), // e.g., "پرفروش", "محبوب", etc.
  flags: z.array(z.enum(["new", "exclusive", "eco", "bestseller"])).optional(),

  /**
   * Loop-style key/value table like "مشخصات فنی" or "اطلاعات بیشتر"
   * Key = label, value = description or spec
   */
  infoTable: z.array(z.object({
    label: z.string().min(1),
    value: z.string().min(1),
  })).optional(),

  /**
   * Additional downloadable files (e.g., manuals, guides)
   */
  attachments: z.array(z.object({
    label: z.string(),
    url: z.string().url("آدرس فایل نامعتبر است"),
  })).optional(),

  /**
   * Custom JSON blob if you want ultimate flexibility
   */
  customJson: z.record(z.string(), z.any()).optional(),
})

export type ProductFormMetaInput = z.input<typeof productFormMetaSchema>

export const productStatusEnumValues = ["draft", "active", "inactive"] as const

export const productFormSchema = z.object({
  name: z.string().min(1, "نام محصول الزامی است"),
  slug: z
    .string()
    .min(1, "اسلاگ الزامی است")
    .transform((val) => slugify(val))
    .refine(isValidSlug, { message: "اسلاگ معتبر نیست (فقط حروف فارسی/انگلیسی، عدد و خط تیره)" }),
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
  thumbnailId: z.string().uuid().optional(), // <-- Add thumbnailId to schema
  downloads: z.array(z.object({
    type: z.enum(["file", "link"], { errorMap: () => ({ message: "نوع دانلود نامعتبر است" }) }),
    url: z.string().url("آدرس دانلود نامعتبر است"),
    maxDownloads: z.coerce.number().int().min(0, "حداقل تعداد دانلود ۰ است").default(0),
  })).optional(),
  content: z.string().optional(),
  meta: productFormMetaSchema.optional(),
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

// --- Extended Product Form Schema with Meta ---
export const productFormWithMetaSchema = productFormSchema.extend({
  meta: productFormMetaSchema.optional(),
})
export type ProductFormWithMetaInput = z.input<typeof productFormWithMetaSchema>
