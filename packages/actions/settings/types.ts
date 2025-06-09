import type { SettingSchema } from '@db/types'

// ==========================================
// BASE ENTITY TYPES
// ==========================================

export type Setting = SettingSchema

// ==========================================
// GROUPED SETTINGS TYPES
// ==========================================

// Settings grouped by category/section
export interface GroupedSettings {
  [category: string]: {
    [key: string]: string | null
  }
}

// Flat settings for easy access
export interface FlatSettings {
  [key: string]: string | null
}

// ==========================================
// SETTING CATEGORIES & KEYS
// ==========================================

// Define setting categories for organized access
export const SETTING_CATEGORIES = {
  SITE: 'site',
  SEO: 'seo', 
  UI: 'ui',
  EMAIL: 'email',
  PAYMENT: 'payment',
  SHIPPING: 'shipping',
  GENERAL: 'general'
} as const

export type SettingCategory = typeof SETTING_CATEGORIES[keyof typeof SETTING_CATEGORIES]

// Predefined setting keys for type safety
export const SETTING_KEYS = {
  // Site settings
  SITE_TITLE: 'site.title',
  SITE_DESCRIPTION: 'site.description',
  SITE_LOGO: 'site.logo',
  SITE_FAVICON: 'site.favicon',
  SITE_LANGUAGE: 'site.language',
  SITE_TIMEZONE: 'site.timezone',
  SITE_CURRENCY: 'site.currency',
  
  // SEO settings
  SEO_TITLE: 'seo.title',
  SEO_DESCRIPTION: 'seo.description',
  SEO_KEYWORDS: 'seo.keywords',
  SEO_ROBOTS: 'seo.robots',
  SEO_GOOGLE_ANALYTICS: 'seo.google_analytics',
  SEO_GOOGLE_TAG_MANAGER: 'seo.google_tag_manager',
  
  // Product SEO
  SEO_PRODUCTS_TITLE_FORMAT: 'seo.products.title_format',
  SEO_PRODUCTS_DESCRIPTION_FORMAT: 'seo.products.description_format',
  
  // Category SEO
  SEO_CATEGORIES_TITLE_FORMAT: 'seo.categories.title_format',
  SEO_CATEGORIES_DESCRIPTION_FORMAT: 'seo.categories.description_format',
  
  // UI settings
  UI_THEME: 'ui.theme',
  UI_PRIMARY_COLOR: 'ui.primary_color',
  UI_SECONDARY_COLOR: 'ui.secondary_color',
  UI_HEADER_STYLE: 'ui.header_style',
  UI_FOOTER_STYLE: 'ui.footer_style',
  UI_HOMEPAGE_LAYOUT: 'ui.homepage_layout',
  
  // Email settings
  EMAIL_FROM_NAME: 'email.from_name',
  EMAIL_FROM_ADDRESS: 'email.from_address',
  EMAIL_SMTP_HOST: 'email.smtp_host',
  EMAIL_SMTP_PORT: 'email.smtp_port',
  EMAIL_SMTP_USER: 'email.smtp_user',
  EMAIL_SMTP_PASSWORD: 'email.smtp_password',
  EMAIL_SMTP_SECURE: 'email.smtp_secure',
  
  // Payment settings
  PAYMENT_CURRENCY: 'payment.currency',
  PAYMENT_TAX_RATE: 'payment.tax_rate',
  PAYMENT_ENABLED_METHODS: 'payment.enabled_methods',
  
  // Shipping settings
  SHIPPING_ENABLED: 'shipping.enabled',
  SHIPPING_FREE_THRESHOLD: 'shipping.free_threshold',
  SHIPPING_DEFAULT_COST: 'shipping.default_cost',
  
  // General settings
  GENERAL_MAINTENANCE_MODE: 'general.maintenance_mode',
  GENERAL_REGISTRATION_ENABLED: 'general.registration_enabled',
  GENERAL_GUEST_CHECKOUT: 'general.guest_checkout',
  GENERAL_INVENTORY_TRACKING: 'general.inventory_tracking'
} as const

export type SettingKey = typeof SETTING_KEYS[keyof typeof SETTING_KEYS]

// ==========================================
// OPERATION TYPES
// ==========================================

// Setting update operation
export interface SettingUpdate {
  readonly key: string
  readonly value: string | null
}

// Bulk setting updates
export interface BulkSettingUpdate {
  readonly settings: SettingUpdate[]
}

// Setting validation result
export interface SettingValidation {
  readonly isValid: boolean
  readonly error?: string
  readonly sanitizedValue?: string
}

// ==========================================
// FORM SCHEMA TYPES
// ==========================================

// General site settings form
export interface SiteSettingsForm {
  title: string
  description: string
  language: string
  timezone: string
  currency: string
  logoId?: string
  faviconId?: string
}

// SEO settings form
export interface SEOSettingsForm {
  title: string
  description: string
  keywords: string
  robots: string
  googleAnalytics?: string
  googleTagManager?: string
  productsTitle: string
  productsDescription: string
  categoriesTitle: string
  categoriesDescription: string
}

// UI settings form
export interface UISettingsForm {
  theme: string
  primaryColor: string
  secondaryColor: string
  headerStyle: string
  footerStyle: string
  homepageLayout: string
}

// Email settings form
export interface EmailSettingsForm {
  fromName: string
  fromAddress: string
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPassword: string
  smtpSecure: boolean
}

// ==========================================
// UTILITY TYPES
// ==========================================

// Type for getting settings by category
export interface SettingsByCategory {
  [SETTING_CATEGORIES.SITE]: Partial<SiteSettingsForm>
  [SETTING_CATEGORIES.SEO]: Partial<SEOSettingsForm>
  [SETTING_CATEGORIES.UI]: Partial<UISettingsForm>
  [SETTING_CATEGORIES.EMAIL]: Partial<EmailSettingsForm>
}

// Setting helper functions type
export interface SettingsHelper {
  getSiteTitle(): Promise<string>
  getSiteDescription(): Promise<string>
  getSiteLogo(): Promise<string | null>
  getLanguage(): Promise<string>
  getCurrency(): Promise<string>
  isMaintenance(): Promise<boolean>
  isRegistrationEnabled(): Promise<boolean>
}

// ==========================================
// DEFAULT VALUES
// ==========================================

export const DEFAULT_SETTINGS: Partial<Record<SettingKey, string>> = {
  [SETTING_KEYS.SITE_TITLE]: 'نکست کالا',
  [SETTING_KEYS.SITE_DESCRIPTION]: 'فروشگاه آنلاین نکست کالا',
  [SETTING_KEYS.SITE_LANGUAGE]: 'fa',
  [SETTING_KEYS.SITE_TIMEZONE]: 'Asia/Tehran',
  [SETTING_KEYS.SITE_CURRENCY]: 'IRR',
  [SETTING_KEYS.UI_THEME]: 'light',
  [SETTING_KEYS.UI_PRIMARY_COLOR]: '#3b82f6',
  [SETTING_KEYS.GENERAL_REGISTRATION_ENABLED]: 'true',
  [SETTING_KEYS.GENERAL_GUEST_CHECKOUT]: 'true',
  [SETTING_KEYS.GENERAL_MAINTENANCE_MODE]: 'false',
  [SETTING_KEYS.SEO_ROBOTS]: 'index,follow',
  [SETTING_KEYS.SEO_PRODUCTS_TITLE_FORMAT]: '{product_name} | {site_title}',
  [SETTING_KEYS.SEO_PRODUCTS_DESCRIPTION_FORMAT]: '{product_description}',
  [SETTING_KEYS.SEO_CATEGORIES_TITLE_FORMAT]: '{category_name} | {site_title}',
  [SETTING_KEYS.SEO_CATEGORIES_DESCRIPTION_FORMAT]: 'محصولات {category_name} در {site_title}'
}

// ==========================================
// VALIDATION TYPES
// ==========================================

export interface SettingValidationRule {
  readonly type: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'color' | 'enum'
  readonly required?: boolean
  readonly minLength?: number
  readonly maxLength?: number
  readonly min?: number
  readonly max?: number
  readonly enum?: string[]
  readonly pattern?: RegExp
}

export const SETTING_VALIDATION_RULES: Partial<Record<SettingKey, SettingValidationRule>> = {
  [SETTING_KEYS.SITE_TITLE]: { type: 'string', required: true, minLength: 1, maxLength: 255 },
  [SETTING_KEYS.SITE_DESCRIPTION]: { type: 'string', maxLength: 500 },
  [SETTING_KEYS.SITE_LANGUAGE]: { type: 'enum', enum: ['fa', 'en'], required: true },
  [SETTING_KEYS.EMAIL_FROM_ADDRESS]: { type: 'email', required: true },
  [SETTING_KEYS.EMAIL_SMTP_PORT]: { type: 'number', min: 1, max: 65535 },
  [SETTING_KEYS.UI_PRIMARY_COLOR]: { type: 'color', required: true },
  [SETTING_KEYS.GENERAL_MAINTENANCE_MODE]: { type: 'boolean' },
  [SETTING_KEYS.GENERAL_REGISTRATION_ENABLED]: { type: 'boolean' }
}
