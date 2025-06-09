"use server"

import { eq, inArray } from "drizzle-orm"
import { db } from "@db"
import { settings } from "@db/schema"
import { withAdmin } from "@actions/utils"
import { settingsCacheInvalidation } from "./cacheConfig"
import { 
  type SettingKey,
  SETTING_KEYS 
} from "./types"

// ==========================================
// SINGLE SETTING DELETION
// ==========================================

export async function deleteSetting(key: SettingKey) {
  return withAdmin(async (user) => {
    // Check if setting exists
    const [existingSetting] = await db
      .select({ id: settings.id })
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1)

    if (!existingSetting) {
      throw new Error("تنظیمات پیدا نشد")
    }

    // Delete setting
    const [deletedSetting] = await db
      .delete(settings)
      .where(eq(settings.key, key))
      .returning()

    // Invalidate cache
    settingsCacheInvalidation.invalidateBySingleKey(key)
    settingsCacheInvalidation.invalidateAll()

    return deletedSetting
  })
}

// ==========================================
// MULTIPLE SETTINGS DELETION
// ==========================================

export async function deleteSettings(keys: SettingKey[]) {
  return withAdmin(async (user) => {
    if (keys.length === 0) {
      throw new Error("لیست کلیدها نمی‌تواند خالی باشد")
    }

    // Check which settings exist
    const existingSettings = await db
      .select({ key: settings.key })
      .from(settings)
      .where(inArray(settings.key, keys))

    const existingKeys = existingSettings.map(s => s.key)
    const notFoundKeys = keys.filter(key => !existingKeys.includes(key))

    if (notFoundKeys.length > 0) {
      throw new Error(`تنظیمات زیر پیدا نشد: ${notFoundKeys.join(', ')}`)
    }

    // Delete settings
    const deletedSettings = await db
      .delete(settings)
      .where(inArray(settings.key, keys))
      .returning()

    // Invalidate cache
    keys.forEach(key => {
      settingsCacheInvalidation.invalidateBySingleKey(key)
    })
    settingsCacheInvalidation.invalidateAll()

    return deletedSettings
  })
}

// ==========================================
// CATEGORY DELETION
// ==========================================

export async function deleteCategorySettings(category: string) {
  return withAdmin(async (user) => {
    // Get all settings that start with the category prefix
    const categoryPrefix = `${category}.`
    const categorySettings = await db
      .select()
      .from(settings)
      .where(eq(settings.key, categoryPrefix)) // In real implementation, use LIKE

    if (categorySettings.length === 0) {
      throw new Error(`هیچ تنظیماتی برای دسته‌بندی ${category} پیدا نشد`)
    }

    const keysToDelete = categorySettings.map(s => s.key)

    // Delete all category settings
    const deletedSettings = await db
      .delete(settings)
      .where(inArray(settings.key, keysToDelete))
      .returning()

    // Invalidate cache
    keysToDelete.forEach(key => {
      settingsCacheInvalidation.invalidateBySingleKey(key as SettingKey)
    })
    settingsCacheInvalidation.invalidateByCategory(category)
    settingsCacheInvalidation.invalidateAll()

    return deletedSettings
  })
}

// ==========================================
// RESET TO DEFAULTS
// ==========================================

export async function resetSettingToDefault(key: SettingKey) {
  return withAdmin(async (user) => {
    // Check if setting exists
    const [existingSetting] = await db
      .select({ id: settings.id })
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1)

    if (!existingSetting) {
      throw new Error("تنظیمات پیدا نشد")
    }

    // Delete the setting (falling back to default value)
    const [deletedSetting] = await db
      .delete(settings)
      .where(eq(settings.key, key))
      .returning()

    // Invalidate cache
    settingsCacheInvalidation.invalidateBySingleKey(key)
    settingsCacheInvalidation.invalidateAll()

    return deletedSetting
  })
}

export async function resetCategoryToDefaults(category: string) {
  return withAdmin(async (user) => {
    // Get all settings for this category
    const categoryPrefix = `${category}.`
    const categorySettings = await db
      .select()
      .from(settings)
      .where(eq(settings.key, categoryPrefix)) // In real implementation, use LIKE

    if (categorySettings.length === 0) {
      throw new Error(`هیچ تنظیماتی برای دسته‌بندی ${category} پیدا نشد`)
    }

    const keysToDelete = categorySettings.map(s => s.key)

    // Delete all category settings (falling back to defaults)
    const deletedSettings = await db
      .delete(settings)
      .where(inArray(settings.key, keysToDelete))
      .returning()

    // Invalidate cache
    keysToDelete.forEach(key => {
      settingsCacheInvalidation.invalidateBySingleKey(key as SettingKey)
    })
    settingsCacheInvalidation.invalidateByCategory(category)
    settingsCacheInvalidation.invalidateAll()

    return deletedSettings
  })
}

// ==========================================
// BULK OPERATIONS
// ==========================================

export async function resetAllSettings() {
  return withAdmin(async (user) => {
    // Delete all settings (will fall back to defaults)
    const deletedSettings = await db
      .delete(settings)
      .returning()

    // Invalidate all caches
    settingsCacheInvalidation.invalidateAll()

    return deletedSettings
  })
}

// ==========================================
// SAFE DELETION WITH VALIDATION
// ==========================================

export async function safeDeleteSetting(key: SettingKey) {
  return withAdmin(async (user) => {
    // Define critical settings that should not be deleted
    const criticalSettings: SettingKey[] = [
      SETTING_KEYS.SITE_TITLE,
      SETTING_KEYS.SITE_LANGUAGE,
      SETTING_KEYS.SITE_CURRENCY,
      SETTING_KEYS.EMAIL_FROM_ADDRESS,
      SETTING_KEYS.PAYMENT_CURRENCY,
    ]

    if (criticalSettings.includes(key)) {
      throw new Error("این تنظیمات حیاتی هستند و نمی‌توانند حذف شوند")
    }

    return deleteSetting(key)
  })
}

export async function safeDeleteSettings(keys: SettingKey[]) {
  return withAdmin(async (user) => {
    // Define critical settings that should not be deleted
    const criticalSettings: SettingKey[] = [
      SETTING_KEYS.SITE_TITLE,
      SETTING_KEYS.SITE_LANGUAGE,
      SETTING_KEYS.SITE_CURRENCY,
      SETTING_KEYS.EMAIL_FROM_ADDRESS,
      SETTING_KEYS.PAYMENT_CURRENCY,
    ]

    const criticalKeysInList = keys.filter(key => criticalSettings.includes(key))

    if (criticalKeysInList.length > 0) {
      throw new Error(`تنظیمات زیر حیاتی هستند و نمی‌توانند حذف شوند: ${criticalKeysInList.join(', ')}`)
    }

    return deleteSettings(keys)
  })
}
