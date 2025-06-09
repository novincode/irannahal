import { commonCaches } from "../cache"

// Settings-specific cache keys
export const settingsCacheKeys = {
  all: "all-settings",
  grouped: "grouped-settings",
  public: "public-settings",
  bySingleKey: (key: string) => `setting-${key}`,
  byCategory: (category: string) => `settings-category-${category}`,
  site: "site-settings",
  seo: "seo-settings", 
  ui: "ui-settings",
  email: "email-settings",
  payment: "payment-settings",
  shipping: "shipping-settings",
  general: "general-settings",
} as const

// Cache invalidation functions (utility functions)
export const settingsCacheInvalidation = {
  // Invalidate all settings caches
  invalidateAll: () => {
    commonCaches.settings.invalidate()
  },

  // Invalidate specific setting by key
  invalidateBySingleKey: (key: string) => {
    commonCaches.settings.invalidateSubTag(settingsCacheKeys.bySingleKey(key))
    // Also invalidate related grouped caches
    settingsCacheInvalidation.invalidateGroupedCaches()
  },

  // Invalidate settings by category
  invalidateByCategory: (category: string) => {
    commonCaches.settings.invalidateSubTag(settingsCacheKeys.byCategory(category))
    // Also invalidate related caches
    settingsCacheInvalidation.invalidateGroupedCaches()
  },

  // Invalidate category-specific caches
  invalidateSiteSettings: () => {
    commonCaches.settings.invalidateSubTag(settingsCacheKeys.site)
    settingsCacheInvalidation.invalidateGroupedCaches()
  },

  invalidateSEOSettings: () => {
    commonCaches.settings.invalidateSubTag(settingsCacheKeys.seo)
    settingsCacheInvalidation.invalidateGroupedCaches()
  },

  invalidateUISettings: () => {
    commonCaches.settings.invalidateSubTag(settingsCacheKeys.ui)
    settingsCacheInvalidation.invalidateGroupedCaches()
  },

  invalidateEmailSettings: () => {
    commonCaches.settings.invalidateSubTag(settingsCacheKeys.email)
    settingsCacheInvalidation.invalidateGroupedCaches()
  },

  invalidatePaymentSettings: () => {
    commonCaches.settings.invalidateSubTag(settingsCacheKeys.payment)
    settingsCacheInvalidation.invalidateGroupedCaches()
  },

  invalidateShippingSettings: () => {
    commonCaches.settings.invalidateSubTag(settingsCacheKeys.shipping)
    settingsCacheInvalidation.invalidateGroupedCaches()
  },

  invalidateGeneralSettings: () => {
    commonCaches.settings.invalidateSubTag(settingsCacheKeys.general)
    settingsCacheInvalidation.invalidateGroupedCaches()
  },

  // Invalidate public settings
  invalidatePublicSettings: () => {
    commonCaches.settings.invalidateSubTag(settingsCacheKeys.public)
  },

  // Helper to invalidate grouped and aggregate caches
  invalidateGroupedCaches: () => {
    commonCaches.settings.invalidateSubTag(settingsCacheKeys.all)
    commonCaches.settings.invalidateSubTag(settingsCacheKeys.grouped)
    commonCaches.settings.invalidateSubTag(settingsCacheKeys.public)
  },

  // Smart invalidation - when settings are updated, invalidate related caches
  invalidateSettingAndRelated: (key: string) => {
    // Invalidate the specific setting
    settingsCacheInvalidation.invalidateBySingleKey(key)
    
    // Determine category and invalidate category cache
    if (key.startsWith('site.')) {
      settingsCacheInvalidation.invalidateSiteSettings()
    } else if (key.startsWith('seo.')) {
      settingsCacheInvalidation.invalidateSEOSettings()
    } else if (key.startsWith('ui.')) {
      settingsCacheInvalidation.invalidateUISettings()
    } else if (key.startsWith('email.')) {
      settingsCacheInvalidation.invalidateEmailSettings()
    } else if (key.startsWith('payment.')) {
      settingsCacheInvalidation.invalidatePaymentSettings()
    } else if (key.startsWith('shipping.')) {
      settingsCacheInvalidation.invalidateShippingSettings()
    } else if (key.startsWith('general.')) {
      settingsCacheInvalidation.invalidateGeneralSettings()
    }

    // If it's a public setting, invalidate public cache
    const publicKeys = [
      'site.title',
      'site.description', 
      'site.language',
      'site.currency',
      'seo.title',
      'seo.description',
      'seo.keywords',
      'ui.theme',
      'ui.primary_color',
      'ui.secondary_color',
    ]

    if (publicKeys.includes(key)) {
      settingsCacheInvalidation.invalidatePublicSettings()
    }
  },

  // Invalidate multiple settings and related caches
  invalidateSettingsAndRelated: (keys: string[]) => {
    keys.forEach(key => {
      settingsCacheInvalidation.invalidateSettingAndRelated(key)
    })
  },
}

// Export the settings cache instance
export const settingsCache = commonCaches.settings
