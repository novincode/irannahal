import { z } from 'zod'

// ==========================================
// BASE SCHEMAS
// ==========================================

const metaSchema = z.record(z.any()).optional()

const downloadSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'نام فایل الزامی است'),
  url: z.string().url('آدرس معتبر وارد کنید'),
  description: z.string().optional(),
  size: z.string().optional(),
  format: z.string().optional()
})

const infoTableRowSchema = z.object({
  id: z.string(),
  key: z.string().min(1, 'عنوان الزامی است'),
  value: z.string().min(1, 'مقدار الزامی است')
})

// ==========================================
// PRODUCT SCHEMA
// ==========================================

export const productEditorSchema = z.object({
  // Core fields
  name: z.string().min(1, 'نام محصول الزامی است'),
  slug: z.string().min(1, 'نامک الزامی است'),
  description: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(['draft', 'active', 'inactive', 'out_of_stock']).default('draft'),
  
  // Price
  price: z.number().min(0, 'قیمت نمی‌تواند منفی باشد').default(0),
  
  // Relations
  categoryIds: z.array(z.string()).default([]),
  tagIds: z.array(z.string()).default([]),
  
  // Media
  thumbnailId: z.string().optional(),
  mediaIds: z.array(z.string()).default([]),
  
  // Meta data
  meta: metaSchema,
  
  // Info table
  infoTable: z.array(infoTableRowSchema).default([]),
  
  // Downloads
  downloads: z.array(downloadSchema).default([])
})

// ==========================================
// POST SCHEMA
// ==========================================

export const postEditorSchema = z.object({
  // Core fields
  name: z.string().min(1, 'عنوان پست الزامی است'),
  slug: z.string().min(1, 'نامک الزامی است'),
  description: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(['draft', 'published', 'private', 'pending']).default('draft'),
  
  // Relations
  categoryIds: z.array(z.string()).default([]),
  tagIds: z.array(z.string()).default([]),
  
  // Media
  thumbnailId: z.string().optional(),
  mediaIds: z.array(z.string()).default([]),
  
  // Meta data
  meta: metaSchema,
  
  // Downloads
  downloads: z.array(downloadSchema).default([])
})

// ==========================================
// PAGE SCHEMA
// ==========================================

export const pageEditorSchema = z.object({
  // Core fields
  name: z.string().min(1, 'عنوان صفحه الزامی است'),
  slug: z.string().min(1, 'نامک الزامی است'),
  description: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(['draft', 'published', 'private']).default('draft'),
  
  // Media
  thumbnailId: z.string().optional(),
  
  // Meta data
  meta: metaSchema
})

// ==========================================
// TYPE EXPORTS
// ==========================================

export type ProductEditorData = z.infer<typeof productEditorSchema>
export type PostEditorData = z.infer<typeof postEditorSchema>
export type PageEditorData = z.infer<typeof pageEditorSchema>
export type DownloadItem = z.infer<typeof downloadSchema>
export type InfoTableRow = z.infer<typeof infoTableRowSchema>
