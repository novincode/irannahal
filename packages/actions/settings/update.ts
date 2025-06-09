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
import { SETTING_KEYS, DEFAULT_SETTINGS } from "./types"

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

export async function updateSiteSettings(data: SiteSettingsFormInput) {
  return withAdmin(async (user) => {
    // Validate input data
    const validatedData = siteSettingsFormSchema.parse(data)
    
    // Convert form data to setting updates
    const settingsToUpdate: UpdateSettingData[] = [
      { key: SETTING_KEYS.SITE_TITLE, value: validatedData.title },
      { key: SETTING_KEYS.SITE_DESCRIPTION, value: validatedData.description || null },
      { key: SETTING_KEYS.SITE_LANGUAGE, value: validatedData.language },
      { key: SETTING_KEYS.SITE_TIMEZONE, value: validatedData.timezone },
      { key: SETTING_KEYS.SITE_CURRENCY, value: validatedData.currency },
      { key: SETTING_KEYS.SITE_LOGO, value: validatedData.logoId || null },
      { key: SETTING_KEYS.SITE_FAVICON, value: validatedData.faviconId || null }
    ]

    // Update settings
    return await updateSettings({ settings: settingsToUpdate })
  })
}

// ==========================================
// SEO SETTINGS UPDATE
// ==========================================

export async function updateSEOSettings(data: SEOSettingsFormInput) {
  return withAdmin(async (user) => {
    // Validate input data
    const validatedData = seoSettingsFormSchema.parse(data)
    
    // Convert form data to setting updates
    const settingsToUpdate: UpdateSettingData[] = [
      { key: SETTING_KEYS.SEO_TITLE, value: validatedData.title || null },
      { key: SETTING_KEYS.SEO_DESCRIPTION, value: validatedData.description || null },
      { key: SETTING_KEYS.SEO_KEYWORDS, value: validatedData.keywords || null },
      { key: SETTING_KEYS.SEO_ROBOTS, value: validatedData.robots },
      { key: SETTING_KEYS.SEO_GOOGLE_ANALYTICS, value: validatedData.googleAnalytics || null },
      { key: SETTING_KEYS.SEO_GOOGLE_TAG_MANAGER, value: validatedData.googleTagManager || null },
      { key: SETTING_KEYS.SEO_PRODUCTS_TITLE_FORMAT, value: validatedData.productsTitle },
      { key: SETTING_KEYS.SEO_PRODUCTS_DESCRIPTION_FORMAT, value: validatedData.productsDescription },
      { key: SETTING_KEYS.SEO_CATEGORIES_TITLE_FORMAT, value: validatedData.categoriesTitle },
      { key: SETTING_KEYS.SEO_CATEGORIES_DESCRIPTION_FORMAT, value: validatedData.categoriesDescription }
    ]

    // Update settings
    return await updateSettings({ settings: settingsToUpdate })
  })
}

// ==========================================
// UI SETTINGS UPDATE
// ==========================================

export async function updateUISettings(data: UISettingsFormInput) {
  return withAdmin(async (user) => {
    // Validate input data
    const validatedData = uiSettingsFormSchema.parse(data)
    
    // Convert form data to setting updates
    const settingsToUpdate: UpdateSettingData[] = [
      { key: SETTING_KEYS.UI_THEME, value: validatedData.theme },
      { key: SETTING_KEYS.UI_PRIMARY_COLOR, value: validatedData.primaryColor },
      { key: SETTING_KEYS.UI_SECONDARY_COLOR, value: validatedData.secondaryColor || null },
      { key: SETTING_KEYS.UI_HEADER_STYLE, value: validatedData.headerStyle },
      { key: SETTING_KEYS.UI_FOOTER_STYLE, value: validatedData.footerStyle },
      { key: SETTING_KEYS.UI_HOMEPAGE_LAYOUT, value: validatedData.homepageLayout }
    ]

    // Update settings
    return await updateSettings({ settings: settingsToUpdate })
  })
}

// ==========================================
// EMAIL SETTINGS UPDATE
// ==========================================

export async function updateEmailSettings(data: EmailSettingsFormInput) {
  return withAdmin(async (user) => {
    // Validate input data
    const validatedData = emailSettingsFormSchema.parse(data)
    
    // Convert form data to setting updates
    const settingsToUpdate: UpdateSettingData[] = [
      { key: SETTING_KEYS.EMAIL_FROM_NAME, value: validatedData.fromName },
      { key: SETTING_KEYS.EMAIL_FROM_ADDRESS, value: validatedData.fromAddress },
      { key: SETTING_KEYS.EMAIL_SMTP_HOST, value: validatedData.smtpHost },
      { key: SETTING_KEYS.EMAIL_SMTP_PORT, value: validatedData.smtpPort.toString() },
      { key: SETTING_KEYS.EMAIL_SMTP_USER, value: validatedData.smtpUser || null },
      { key: SETTING_KEYS.EMAIL_SMTP_PASSWORD, value: validatedData.smtpPassword || null },
      { key: SETTING_KEYS.EMAIL_SMTP_SECURE, value: validatedData.smtpSecure.toString() }
    ]

    // Update settings
    return await updateSettings({ settings: settingsToUpdate })
  })
}

// ==========================================
// PAYMENT SETTINGS UPDATE
// ==========================================

export async function updatePaymentSettings(data: PaymentSettingsFormInput) {
  return withAdmin(async (user) => {
    // Validate input data
    const validatedData = paymentSettingsFormSchema.parse(data)
    
    // Convert form data to setting updates
    const settingsToUpdate: UpdateSettingData[] = [
      { key: SETTING_KEYS.PAYMENT_CURRENCY, value: validatedData.currency },
      { key: SETTING_KEYS.PAYMENT_TAX_RATE, value: validatedData.taxRate.toString() },
      { key: SETTING_KEYS.PAYMENT_ENABLED_METHODS, value: JSON.stringify(validatedData.enabledMethods) }
    ]

    // Update settings
    return await updateSettings({ settings: settingsToUpdate })
  })
}

// ==========================================
// SHIPPING SETTINGS UPDATE
// ==========================================

export async function updateShippingSettings(data: ShippingSettingsFormInput) {
  return withAdmin(async (user) => {
    // Validate input data
    const validatedData = shippingSettingsFormSchema.parse(data)
    
    // Convert form data to setting updates
    const settingsToUpdate: UpdateSettingData[] = [
      { key: SETTING_KEYS.SHIPPING_ENABLED, value: validatedData.enabled.toString() },
      { key: SETTING_KEYS.SHIPPING_FREE_THRESHOLD, value: validatedData.freeThreshold.toString() },
      { key: SETTING_KEYS.SHIPPING_DEFAULT_COST, value: validatedData.defaultCost.toString() }
    ]

    // Update settings
    return await updateSettings({ settings: settingsToUpdate })
  })
}

// ==========================================
// GENERAL SETTINGS UPDATE
// ==========================================

export async function updateGeneralSettings(data: GeneralSettingsFormInput) {
  return withAdmin(async (user) => {
    // Validate input data
    const validatedData = generalSettingsFormSchema.parse(data)
    
    // Convert form data to setting updates
    const settingsToUpdate: UpdateSettingData[] = [
      { key: SETTING_KEYS.GENERAL_MAINTENANCE_MODE, value: validatedData.maintenanceMode.toString() },
      { key: SETTING_KEYS.GENERAL_REGISTRATION_ENABLED, value: validatedData.registrationEnabled.toString() },
      { key: SETTING_KEYS.GENERAL_GUEST_CHECKOUT, value: validatedData.guestCheckout.toString() },
      { key: SETTING_KEYS.GENERAL_INVENTORY_TRACKING, value: validatedData.inventoryTracking.toString() }
    ]

    // Update settings
    return await updateSettings({ settings: settingsToUpdate })
  })
}
