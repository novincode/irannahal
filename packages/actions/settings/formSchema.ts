import { z } from 'zod'

// ==========================================
// SITE SETTINGS FORM SCHEMA
// ==========================================

export const siteSettingsFormSchema = z.object({
  title: z.string().min(1, 'عنوان سایت الزامی است').max(255, 'عنوان سایت خیلی طولانی است'),
  description: z.string().max(500, 'توضیحات سایت خیلی طولانی است').optional(),
  language: z.enum(['fa', 'en'], {
    errorMap: () => ({ message: 'زبان انتخابی نامعتبر است' })
  }).default('fa'),
  timezone: z.string().default('Asia/Tehran'),
  currency: z.enum(['IRR', 'USD', 'EUR'], {
    errorMap: () => ({ message: 'واحد پول انتخابی نامعتبر است' })
  }).default('IRR'),
  logoId: z.string().uuid('شناسه لوگو نامعتبر است').optional(),
  faviconId: z.string().uuid('شناسه فاویکون نامعتبر است').optional()
})

// ==========================================
// SEO SETTINGS FORM SCHEMA
// ==========================================

export const seoSettingsFormSchema = z.object({
  title: z.string().max(255, 'عنوان SEO خیلی طولانی است').optional(),
  description: z.string().max(500, 'توضیحات SEO خیلی طولانی است').optional(),
  keywords: z.string().max(255, 'کلمات کلیدی خیلی طولانی است').optional(),
  robots: z.string().default('index,follow'),
  googleAnalytics: z.string().optional(),
  googleTagManager: z.string().optional(),
  
  // Product SEO templates
  productsTitle: z.string().default('{product_name} | {site_title}'),
  productsDescription: z.string().default('{product_description}'),
  
  // Category SEO templates
  categoriesTitle: z.string().default('{category_name} | {site_title}'),
  categoriesDescription: z.string().default('محصولات {category_name} در {site_title}')
})

// ==========================================
// UI SETTINGS FORM SCHEMA
// ==========================================

export const uiSettingsFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto'], {
    errorMap: () => ({ message: 'تم انتخابی نامعتبر است' })
  }).default('light'),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'رنگ اصلی نامعتبر است').default('#3b82f6'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'رنگ ثانویه نامعتبر است').optional(),
  headerStyle: z.enum(['minimal', 'classic', 'modern'], {
    errorMap: () => ({ message: 'استایل هدر نامعتبر است' })
  }).default('modern'),
  footerStyle: z.enum(['minimal', 'detailed', 'extended'], {
    errorMap: () => ({ message: 'استایل فوتر نامعتبر است' })
  }).default('detailed'),
  homepageLayout: z.enum(['grid', 'list', 'masonry'], {
    errorMap: () => ({ message: 'چیدمان صفحه اصلی نامعتبر است' })
  }).default('grid')
})

// ==========================================
// EMAIL SETTINGS FORM SCHEMA
// ==========================================

export const emailSettingsFormSchema = z.object({
  fromName: z.string().min(1, 'نام فرستنده الزامی است').max(255, 'نام فرستنده خیلی طولانی است'),
  fromAddress: z.string().email('آدرس ایمیل نامعتبر است'),
  smtpHost: z.string().min(1, 'آدرس سرور SMTP الزامی است'),
  smtpPort: z.coerce.number().int().min(1).max(65535, 'پورت SMTP نامعتبر است').default(587),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpSecure: z.boolean().default(true)
})

// ==========================================
// PAYMENT SETTINGS FORM SCHEMA
// ==========================================

export const paymentSettingsFormSchema = z.object({
  currency: z.enum(['IRR', 'USD', 'EUR'], {
    errorMap: () => ({ message: 'واحد پول نامعتبر است' })
  }).default('IRR'),
  taxRate: z.coerce.number().min(0).max(100, 'نرخ مالیات باید بین ۰ تا ۱۰۰ باشد').default(0),
  enabledMethods: z.array(z.enum(['card', 'bank_transfer', 'wallet', 'cash_on_delivery'])).default(['card'])
})

// ==========================================
// SHIPPING SETTINGS FORM SCHEMA
// ==========================================

export const shippingSettingsFormSchema = z.object({
  enabled: z.boolean().default(true),
  freeThreshold: z.coerce.number().min(0, 'آستانه ارسال رایگان نمی‌تواند منفی باشد').default(0),
  defaultCost: z.coerce.number().min(0, 'هزینه ارسال نمی‌تواند منفی باشد').default(0)
})

// ==========================================
// GENERAL SETTINGS FORM SCHEMA
// ==========================================

export const generalSettingsFormSchema = z.object({
  maintenanceMode: z.boolean().default(false),
  registrationEnabled: z.boolean().default(true),
  guestCheckout: z.boolean().default(true),
  inventoryTracking: z.boolean().default(false)
})

// ==========================================
// SETTING UPDATE SCHEMAS
// ==========================================

// Single setting update
export const updateSettingSchema = z.object({
  key: z.string().min(1, 'کلید تنظیمات الزامی است'),
  value: z.string().nullable()
})

// Bulk settings update
export const updateSettingsSchema = z.object({
  settings: z.array(updateSettingSchema).min(1, 'حداقل یک تنظیمات باید ارسال شود')
})

// ==========================================
// SETTING RETRIEVAL SCHEMAS
// ==========================================

export const getSettingsSchema = z.object({
  keys: z.array(z.string()).optional(),
  category: z.string().optional()
})

// ==========================================
// TYPE EXPORTS
// ==========================================

export type SiteSettingsFormData = z.infer<typeof siteSettingsFormSchema>
export type SiteSettingsFormInput = z.input<typeof siteSettingsFormSchema>

export type SEOSettingsFormData = z.infer<typeof seoSettingsFormSchema>
export type SEOSettingsFormInput = z.input<typeof seoSettingsFormSchema>

export type UISettingsFormData = z.infer<typeof uiSettingsFormSchema>
export type UISettingsFormInput = z.input<typeof uiSettingsFormSchema>

export type EmailSettingsFormData = z.infer<typeof emailSettingsFormSchema>
export type EmailSettingsFormInput = z.input<typeof emailSettingsFormSchema>

export type PaymentSettingsFormData = z.infer<typeof paymentSettingsFormSchema>
export type PaymentSettingsFormInput = z.input<typeof paymentSettingsFormSchema>

export type ShippingSettingsFormData = z.infer<typeof shippingSettingsFormSchema>
export type ShippingSettingsFormInput = z.input<typeof shippingSettingsFormSchema>

export type GeneralSettingsFormData = z.infer<typeof generalSettingsFormSchema>
export type GeneralSettingsFormInput = z.input<typeof generalSettingsFormSchema>

export type UpdateSettingData = z.infer<typeof updateSettingSchema>
export type UpdateSettingsData = z.infer<typeof updateSettingsSchema>
export type GetSettingsData = z.infer<typeof getSettingsSchema>

// ==========================================
// VALIDATION HELPERS
// ==========================================

// Validate color hex code
export const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color)
}

// Validate email format
export const isValidEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success
}

// Validate URL format
export const isValidUrl = (url: string): boolean => {
  return z.string().url().safeParse(url).success
}
