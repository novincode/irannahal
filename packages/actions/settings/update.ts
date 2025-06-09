"use server"

import { eq, and, inArray } from "drizzle-orm"
import { db } from "@db"
import { settings } from "@db/schema"
import { withAdmin } from "@actions/utils"
import { 
  updateSettingSchema,
  updateSettingsSchema,
  siteSettingsFormSchema,
  seoSettingsFormSchema,
  uiSettingsFormSchema,
  emailSettingsFormSchema,
  paymentSettingsFormSchema,
  shippingSettingsFormSchema,
  generalSettingsFormSchema,
  type UpdateSettingData,
  type UpdateSettingsData,
  type SiteSettingsFormInput,
  type SEOSettingsFormInput,
  type UISettingsFormInput,
  type EmailSettingsFormInput,
  type PaymentSettingsFormInput,
  type ShippingSettingsFormInput,
  type GeneralSettingsFormInput
} from "./formSchema"
import { settingsCacheInvalidation } from "./cacheConfig"
import { DEFAULT_SETTINGS } from "./types"

// ==========================================
// SINGLE SETTING UPDATE
// ==========================================

export async function updateSetting(data: UpdateSettingData) {
  return withAdmin(async (user) => {
    // Validate input data
    const validatedData = updateSettingSchema.parse(data)
    
    // Check if setting exists
    const [existingSetting] = await db
      .select({ id: settings.id })
      .from(settings)
      .where(eq(settings.key, validatedData.key))
      .limit(1)

    let result
    if (existingSetting) {
      // Update existing setting
      if (validatedData.value === null) {
        // Delete setting if value is null
        [result] = await db
          .delete(settings)
          .where(eq(settings.key, validatedData.key))
          .returning()
      } else {
        // Update setting
        [result] = await db
          .update(settings)
          .set({ value: validatedData.value })
          .where(eq(settings.key, validatedData.key))
          .returning()
      }
    } else if (validatedData.value !== null) {
      // Create new setting only if value is not null
      [result] = await db
        .insert(settings)
        .values({
          key: validatedData.key,
          value: validatedData.value,
        })
        .returning()
    }

    // Invalidate cache
    settingsCacheInvalidation.invalidateBySingleKey(validatedData.key)
    settingsCacheInvalidation.invalidateAll()

    return result
  })
}

// ==========================================
// BULK SETTINGS UPDATE
// ==========================================

export async function updateSettings(data: UpdateSettingsData) {
  return withAdmin(async (user) => {
    // Validate input data
    const validatedData = updateSettingsSchema.parse(data)
    
    // Process each setting
    const results = []
    const keysToInvalidate = []

    for (const settingUpdate of validatedData.settings) {
      // Check if setting exists
      const [existingSetting] = await db
        .select({ id: settings.id })
        .from(settings)
        .where(eq(settings.key, settingUpdate.key))
        .limit(1)

      let result
      if (existingSetting) {
        if (settingUpdate.value === null) {
          // Delete setting if value is null
          [result] = await db
            .delete(settings)
            .where(eq(settings.key, settingUpdate.key))
            .returning()
        } else {
          // Update setting
          [result] = await db
            .update(settings)
            .set({ value: settingUpdate.value })
            .where(eq(settings.key, settingUpdate.key))
            .returning()
        }
      } else if (settingUpdate.value !== null) {
        // Create new setting only if value is not null
        [result] = await db
          .insert(settings)
          .values({
            key: settingUpdate.key,
            value: settingUpdate.value,
          })
          .returning()
      }

      if (result) {
        results.push(result)
        keysToInvalidate.push(settingUpdate.key)
      }
    }

    // Invalidate cache for all updated settings
    keysToInvalidate.forEach(key => {
      settingsCacheInvalidation.invalidateBySingleKey(key)
    })
    settingsCacheInvalidation.invalidateAll()

    return results
  })
}

// ==========================================
// SITE SETTINGS UPDATE
// ==========================================

export async function updateSiteSettings(data: SiteSettingsFormInput, keys: Record<string, string>) {
  return withAdmin(async (user) => {
    // Validate input data
    const validatedData = siteSettingsFormSchema.parse(data)
    
    // Convert form data to setting updates using provided keys
    const settingsToUpdate: UpdateSettingData[] = [
      { key: keys.SITE_TITLE, value: validatedData.title },
      { key: keys.SITE_DESCRIPTION, value: validatedData.description || null },
      { key: keys.SITE_LANGUAGE, value: validatedData.language },
      { key: keys.SITE_TIMEZONE, value: validatedData.timezone },
      { key: keys.SITE_CURRENCY, value: validatedData.currency },
      { key: keys.SITE_LOGO, value: validatedData.logoId || null },
      { key: keys.SITE_FAVICON, value: validatedData.faviconId || null }
    ]

    // Update settings
    const result = await updateSettings({ settings: settingsToUpdate })
    
    // Extra cache invalidation for site settings
    settingsCacheInvalidation.invalidateAll()
    
    return result
  })
}

// ==========================================
// SEO SETTINGS UPDATE
// ==========================================

export async function updateSEOSettings(data: SEOSettingsFormInput, keys: Record<string, string>) {
  return withAdmin(async (user) => {
    // Validate input data
    const validatedData = seoSettingsFormSchema.parse(data)
    
    // Convert form data to setting updates using provided keys
    const settingsToUpdate: UpdateSettingData[] = [
      { key: keys.SEO_TITLE, value: validatedData.title || null },
      { key: keys.SEO_DESCRIPTION, value: validatedData.description || null },
      { key: keys.SEO_KEYWORDS, value: validatedData.keywords || null },
      { key: keys.SEO_ROBOTS, value: validatedData.robots },
      { key: keys.SEO_GOOGLE_ANALYTICS, value: validatedData.googleAnalytics || null },
      { key: keys.SEO_GOOGLE_TAG_MANAGER, value: validatedData.googleTagManager || null },
      { key: keys.SEO_PRODUCTS_TITLE_FORMAT, value: validatedData.productsTitle },
      { key: keys.SEO_PRODUCTS_DESCRIPTION_FORMAT, value: validatedData.productsDescription },
      { key: keys.SEO_CATEGORIES_TITLE_FORMAT, value: validatedData.categoriesTitle },
      { key: keys.SEO_CATEGORIES_DESCRIPTION_FORMAT, value: validatedData.categoriesDescription }
    ]

    // Update settings
    return await updateSettings({ settings: settingsToUpdate })
  })
}

// ==========================================
// UI SETTINGS UPDATE
// ==========================================

export async function updateUISettings(data: UISettingsFormInput, keys: Record<string, string>) {
  return withAdmin(async (user) => {
    // Validate input data
    const validatedData = uiSettingsFormSchema.parse(data)
    
    // Convert form data to setting updates using provided keys
    const settingsToUpdate: UpdateSettingData[] = [
      { key: keys.UI_THEME, value: validatedData.theme },
      { key: keys.UI_PRIMARY_COLOR, value: validatedData.primaryColor },
      { key: keys.UI_SECONDARY_COLOR, value: validatedData.secondaryColor || null },
      { key: keys.UI_HEADER_STYLE, value: validatedData.headerStyle },
      { key: keys.UI_FOOTER_STYLE, value: validatedData.footerStyle },
      { key: keys.UI_HOMEPAGE_LAYOUT, value: validatedData.homepageLayout }
    ]

    // Update settings
    return await updateSettings({ settings: settingsToUpdate })
  })
}

// ==========================================
// EMAIL SETTINGS UPDATE
// ==========================================

export async function updateEmailSettings(data: EmailSettingsFormInput, keys: Record<string, string>) {
  return withAdmin(async (user) => {
    // Validate input data
    const validatedData = emailSettingsFormSchema.parse(data)
    
    // Convert form data to setting updates using provided keys
    const settingsToUpdate: UpdateSettingData[] = [
      { key: keys.EMAIL_FROM_NAME, value: validatedData.fromName },
      { key: keys.EMAIL_FROM_ADDRESS, value: validatedData.fromAddress },
      { key: keys.EMAIL_SMTP_HOST, value: validatedData.smtpHost },
      { key: keys.EMAIL_SMTP_PORT, value: validatedData.smtpPort.toString() },
      { key: keys.EMAIL_SMTP_USER, value: validatedData.smtpUser || null },
      { key: keys.EMAIL_SMTP_PASSWORD, value: validatedData.smtpPassword || null },
      { key: keys.EMAIL_SMTP_SECURE, value: validatedData.smtpSecure.toString() }
    ]

    // Update settings
    return await updateSettings({ settings: settingsToUpdate })
  })
}

// ==========================================
// PAYMENT SETTINGS UPDATE
// ==========================================

export async function updatePaymentSettings(data: PaymentSettingsFormInput, keys: Record<string, string>) {
  return withAdmin(async (user) => {
    // Validate input data
    const validatedData = paymentSettingsFormSchema.parse(data)
    
    // Convert form data to setting updates using provided keys
    const settingsToUpdate: UpdateSettingData[] = [
      { key: keys.PAYMENT_CURRENCY, value: validatedData.currency },
      { key: keys.PAYMENT_TAX_RATE, value: validatedData.taxRate.toString() },
      { key: keys.PAYMENT_ENABLED_METHODS, value: JSON.stringify(validatedData.enabledMethods) }
    ]

    // Update settings
    return await updateSettings({ settings: settingsToUpdate })
  })
}

// ==========================================
// SHIPPING SETTINGS UPDATE
// ==========================================

export async function updateShippingSettings(data: ShippingSettingsFormInput, keys: Record<string, string>) {
  return withAdmin(async (user) => {
    // Validate input data
    const validatedData = shippingSettingsFormSchema.parse(data)
    
    // Convert form data to setting updates using provided keys
    const settingsToUpdate: UpdateSettingData[] = [
      { key: keys.SHIPPING_ENABLED, value: validatedData.enabled.toString() },
      { key: keys.SHIPPING_FREE_THRESHOLD, value: validatedData.freeThreshold.toString() },
      { key: keys.SHIPPING_DEFAULT_COST, value: validatedData.defaultCost.toString() }
    ]

    // Update settings
    return await updateSettings({ settings: settingsToUpdate })
  })
}

// ==========================================
// GENERAL SETTINGS UPDATE
// ==========================================

export async function updateGeneralSettings(data: GeneralSettingsFormInput, keys: Record<string, string>) {
  return withAdmin(async (user) => {
    // Validate input data
    const validatedData = generalSettingsFormSchema.parse(data)
    
    // Convert form data to setting updates using provided keys
    const settingsToUpdate: UpdateSettingData[] = [
      { key: keys.GENERAL_MAINTENANCE_MODE, value: validatedData.maintenanceMode.toString() },
      { key: keys.GENERAL_REGISTRATION_ENABLED, value: validatedData.registrationEnabled.toString() },
      { key: keys.GENERAL_GUEST_CHECKOUT, value: validatedData.guestCheckout.toString() },
      { key: keys.GENERAL_INVENTORY_TRACKING, value: validatedData.inventoryTracking.toString() }
    ]

    // Update settings
    return await updateSettings({ settings: settingsToUpdate })
  })
}
