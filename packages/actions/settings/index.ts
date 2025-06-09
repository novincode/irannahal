// ==========================================
// SETTINGS ACTION EXPORTS
// ==========================================

// Export all action functions
export { 
  getSetting,
  getSettings,
  getAllSettings,
  getGroupedSettings,
  getSiteSettings,
  getSEOSettings,
  getUISettings,
  getEmailSettings,
  getPaymentSettings,
  getShippingSettings,
  getGeneralSettings,
  getPublicSettings,
  getPublicSetting
} from "./get"

export { 
  updateSetting,
  updateSettings,
  updateSiteSettings,
  updateSEOSettings,
  updateUISettings,
  updateEmailSettings,
  updatePaymentSettings,
  updateShippingSettings,
  updateGeneralSettings
} from "./update"

export { 
  deleteSetting,
  deleteSettings,
  deleteCategorySettings,
  resetSettingToDefault,
  resetCategoryToDefaults,
  resetAllSettings,
  safeDeleteSetting,
  safeDeleteSettings
} from "./delete"

// Export cached functions
export {
  getAllSettings as cachedGetAllSettings,
  getGroupedSettings as cachedGetGroupedSettings,
  getPublicSettings as cachedGetPublicSettings,
  getSetting as cachedGetSetting,
  getPublicSetting as cachedGetPublicSetting,
  getSiteSettings as cachedGetSiteSettings,
  getSEOSettings as cachedGetSEOSettings,
  getUISettings as cachedGetUISettings,
  getEmailSettings as cachedGetEmailSettings,
  getPaymentSettings as cachedGetPaymentSettings,
  getShippingSettings as cachedGetShippingSettings,
  getGeneralSettings as cachedGetGeneralSettings
} from "./cache"

// Export optimized cached functions for common use cases
export {
  getCachedSiteInfo,
  getCachedUISettings,
  getCachedSEOSettings,
  getCachedSetting,
  getCachedMaintenanceMode
} from "./cached"

// Export all types
export type * from "./types"

// Export form schema types
export type {
  SiteSettingsFormData,
  SiteSettingsFormInput,
  SEOSettingsFormData,
  SEOSettingsFormInput,
  UISettingsFormData,
  UISettingsFormInput,
  EmailSettingsFormData,
  EmailSettingsFormInput,
  PaymentSettingsFormData,
  PaymentSettingsFormInput,
  ShippingSettingsFormData,
  ShippingSettingsFormInput,
  GeneralSettingsFormData,
  GeneralSettingsFormInput,
  UpdateSettingData,
  UpdateSettingsData,
  GetSettingsData
} from "./formSchema"

// Export form schemas as values
export {
  siteSettingsFormSchema,
  seoSettingsFormSchema,
  uiSettingsFormSchema,
  emailSettingsFormSchema,
  paymentSettingsFormSchema,
  shippingSettingsFormSchema,
  generalSettingsFormSchema,
  updateSettingSchema,
  updateSettingsSchema,
  getSettingsSchema
} from "./formSchema"

// ==========================================
// CONVENIENCE EXPORTS
// ==========================================

// Create a settings operations object for easier importing
import * as settingsOperations from "./get"
import * as updateOperations from "./update"
import * as deleteOperations from "./delete"

export const settingsActions = {
  ...settingsOperations,
  ...updateOperations,
  ...deleteOperations,
}

// ==========================================
// HELPER UTILITIES
// ==========================================

// Re-export important constants
export { 
  SETTING_KEYS,
  SETTING_CATEGORIES,
  DEFAULT_SETTINGS
} from "./types"

// Validation helpers
export {
  isValidHexColor,
  isValidEmail,
  isValidUrl
} from "./formSchema"

// Database initialization utilities
export {
  autoInitializeSettings,
  checkDatabaseInitialization
} from "./initialize"
