import { z } from 'zod'

// Menu form schema
export const menuFormSchema = z.object({
  name: z.string().min(1, 'نام منو الزامی است').max(255, 'نام منو خیلی طولانی است'),
  slug: z.string()
    .min(1, 'نامک الزامی است')
    .max(255, 'نامک خیلی طولانی است')
    .regex(/^[a-z0-9-]+$/, 'نامک فقط می‌تواند شامل حروف کوچک انگلیسی، اعداد و خط تیره باشد'),
  description: z.string().max(500, 'توضیحات خیلی طولانی است').optional(),
  location: z.string().max(100, 'موقعیت خیلی طولانی است').optional(),
})

// Custom URL validation that allows both relative and absolute URLs
const urlSchema = z.string().refine((val) => {
  if (!val || val === '') return true; // Allow empty
  
  // Allow relative paths (starting with /)
  if (val.startsWith('/')) return true;
  
  // Allow absolute URLs
  try {
    new URL(val);
    return true;
  } catch {
    return false;
  }
}, 'آدرس نامعتبر است. باید یک URL کامل (مثل https://example.com) یا مسیر نسبی (مثل /about) باشد')

// Base menu item form schema (without validation)
const baseMenuItemFormSchema = z.object({
  label: z.string().min(1, 'برچسب الزامی است').max(255, 'برچسب خیلی طولانی است'),
  type: z.enum(['custom', 'page', 'category', 'product', 'tag', 'external']),
  url: urlSchema.optional(),
  target: z.enum(['_self', '_blank', '_parent', '_top']).optional(),
  rel: z.string().max(255, 'ویژگی rel خیلی طولانی است').optional(),
  linkedResourceId: z.string().optional(),
  cssClasses: z.string().max(255, 'کلاس‌های CSS خیلی طولانی است').optional(),
  isVisible: z.boolean().optional(),
})

// Menu item form schema with validation
export const menuItemFormSchema = baseMenuItemFormSchema.refine((data) => {
  // For page, category, product, tag types, linkedResourceId should be a valid UUID if provided
  if (['page', 'category', 'product', 'tag'].includes(data.type)) {
    if (data.linkedResourceId && data.linkedResourceId.trim() !== '') {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(data.linkedResourceId);
    }
  }
  // For custom and external types, linkedResourceId can be empty or any string
  return true;
}, {
  message: 'شناسه منبع نامعتبر است',
  path: ['linkedResourceId']
})

// Menu item creation schema (includes menuId and parentId)
export const createMenuItemSchema = baseMenuItemFormSchema.extend({
  menuId: z.string().uuid('شناسه منو نامعتبر است'),
  parentId: z.string().uuid('شناسه والد نامعتبر است').optional(),
  order: z.number().int().min(0).default(0),
}).transform((data: any) => ({
  ...data,
  target: data.target ?? '_self',
  isVisible: data.isVisible ?? true,
  // Convert empty strings to null for UUID fields
  parentId: data.parentId && data.parentId.trim() !== '' ? data.parentId : null,
  linkedResourceId: data.linkedResourceId && data.linkedResourceId.trim() !== '' ? data.linkedResourceId : null,
})).refine((data) => {
  // For page, category, product, tag types, linkedResourceId should be a valid UUID if provided
  if (['page', 'category', 'product', 'tag'].includes(data.type)) {
    if (data.linkedResourceId && data.linkedResourceId.trim() !== '') {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(data.linkedResourceId);
    }
  }
  return true;
}, {
  message: 'شناسه منبع نامعتبر است',
  path: ['linkedResourceId']
})

// Menu item update schema
export const updateMenuItemSchema = baseMenuItemFormSchema.partial().extend({
  id: z.string().uuid('شناسه آیتم منو نامعتبر است'),
}).transform((data: any) => ({
  ...data,
  // Convert empty strings to null for UUID fields
  parentId: data.parentId && data.parentId.trim() !== '' ? data.parentId : null,
  linkedResourceId: data.linkedResourceId && data.linkedResourceId.trim() !== '' ? data.linkedResourceId : null,
})).refine((data) => {
  // For page, category, product, tag types, linkedResourceId should be a valid UUID if provided
  if (data.type && ['page', 'category', 'product', 'tag'].includes(data.type)) {
    if (data.linkedResourceId && data.linkedResourceId.trim() !== '') {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(data.linkedResourceId);
    }
  }
  return true;
}, {
  message: 'شناسه منبع نامعتبر است',
  path: ['linkedResourceId']
})

// Bulk update menu items order schema
export const updateMenuItemsOrderSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid('شناسه آیتم منو نامعتبر است'),
    parentId: z.union([z.string().uuid('شناسه والد نامعتبر است'), z.null()]).optional(),
    order: z.number().int().min(0),
  })),
})

// Menu item move schema (for drag and drop)
export const moveMenuItemSchema = z.object({
  id: z.string().uuid('Invalid menu item ID'),
  targetParentId: z.string().uuid('Invalid parent ID').optional(),
  targetIndex: z.number().int().min(0),
}).transform((data) => ({
  ...data,
  // Convert empty strings to null for UUID fields
  targetParentId: data.targetParentId && data.targetParentId.trim() !== '' ? data.targetParentId : null,
}))

export type MenuFormData = z.infer<typeof menuFormSchema>
export type MenuItemFormData = z.infer<typeof menuItemFormSchema>
export type CreateMenuItemData = z.infer<typeof createMenuItemSchema>
export type UpdateMenuItemData = z.infer<typeof updateMenuItemSchema>
export type UpdateMenuItemsOrderData = z.infer<typeof updateMenuItemsOrderSchema>
export type MoveMenuItemData = z.infer<typeof moveMenuItemSchema>
