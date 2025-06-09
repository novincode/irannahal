import { db } from "../index"
import { settings } from "../schema"
import { DEFAULT_SETTINGS, SETTING_KEYS } from "@actions/settings/types"
import { count, eq } from "drizzle-orm"

/**
 * Seeds default settings into the database if they don't exist
 * This is called during installation or when running manual seeds
 */
export async function seedDefaultSettings() {
  console.log("🌱 Seeding default settings...")

  // Check if settings already exist
  const [settingsCount] = await db
    .select({ count: count() })
    .from(settings)

  if (settingsCount.count > 0) {
    console.log(`⚠️  Settings already exist (${settingsCount.count} records). Skipping default seed.`)
    return { skipped: true, existing: settingsCount.count }
  }

  // Prepare settings for insertion
  const settingsToInsert = Object.entries(DEFAULT_SETTINGS)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => ({
      key,
      value: value as string
    }))

  if (settingsToInsert.length === 0) {
    console.log("⚠️  No default settings to seed.")
    return { skipped: true, reason: "no_defaults" }
  }

  try {
    // Insert default settings
    await db.insert(settings).values(settingsToInsert)

    console.log(`✅ Successfully seeded ${settingsToInsert.length} default settings:`)
    settingsToInsert.forEach(({ key, value }) => {
      console.log(`   ${key}: ${value}`)
    })

    return { 
      success: true, 
      seeded: settingsToInsert.length,
      settings: settingsToInsert
    }
  } catch (error) {
    console.error("❌ Failed to seed default settings:", error)
    throw error
  }
}

/**
 * Seeds or updates specific settings (useful for updates/migrations)
 * This will add missing settings or update existing ones if force is true
 */
export async function seedOrUpdateSettings(
  settingsToSeed: Record<string, string>,
  options: { force?: boolean; onlyMissing?: boolean } = {}
) {
  const { force = false, onlyMissing = true } = options
  
  console.log(`🌱 Seeding/updating specific settings (force: ${force}, onlyMissing: ${onlyMissing})...`)

  const results = {
    added: 0,
    updated: 0,
    skipped: 0,
    errors: 0
  }

  for (const [key, value] of Object.entries(settingsToSeed)) {
    try {
      // Check if setting exists
      const [existingSetting] = await db
        .select()
        .from(settings)
        .where(eq(settings.key, key))
        .limit(1)

      if (existingSetting) {
        if (force && !onlyMissing) {
          // Update existing setting
          await db
            .update(settings)
            .set({ value })
            .where(eq(settings.key, key))
          
          console.log(`   ✏️  Updated: ${key} = ${value}`)
          results.updated++
        } else {
          console.log(`   ⏭️  Skipped (exists): ${key}`)
          results.skipped++
        }
      } else {
        // Insert new setting
        await db.insert(settings).values({ key, value })
        console.log(`   ➕ Added: ${key} = ${value}`)
        results.added++
      }
    } catch (error) {
      console.error(`   ❌ Error with ${key}:`, error)
      results.errors++
    }
  }

  console.log(`✅ Settings seeding complete:`, results)
  return results
}

/**
 * Ensures all default settings exist in the database
 * This is safe to call multiple times - it only adds missing settings
 */
export async function ensureDefaultSettings() {
  console.log("🔍 Ensuring all default settings exist...")

  const missingSettings: Record<string, string> = {}

  // Check each default setting
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    if (value === undefined) continue

    const [existingSetting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1)

    if (!existingSetting) {
      missingSettings[key] = value
    }
  }

  if (Object.keys(missingSettings).length === 0) {
    console.log("✅ All default settings already exist.")
    return { success: true, added: 0 }
  }

  // Add missing settings
  const result = await seedOrUpdateSettings(missingSettings, { onlyMissing: true })
  
  console.log(`✅ Ensured ${result.added} missing default settings exist.`)
  return { success: true, added: result.added }
}

/**
 * Enhanced default settings with more comprehensive defaults
 * You can extend this for more specific installation scenarios
 */
export const ENHANCED_DEFAULT_SETTINGS = {
  ...DEFAULT_SETTINGS,
  
  // Additional SEO defaults
  [SETTING_KEYS.SEO_TITLE]: 'نکست کالا - فروشگاه آنلاین',
  [SETTING_KEYS.SEO_DESCRIPTION]: 'فروشگاه آنلاین نکست کالا - بهترین محصولات با کیفیت بالا و قیمت مناسب',
  [SETTING_KEYS.SEO_KEYWORDS]: 'فروشگاه آنلاین، خرید آنلاین، نکست کالا',
  
  // Additional UI defaults
  [SETTING_KEYS.UI_HEADER_STYLE]: 'modern',
  [SETTING_KEYS.UI_FOOTER_STYLE]: 'detailed',
  [SETTING_KEYS.UI_HOMEPAGE_LAYOUT]: 'grid',
  
  // Additional general settings
  [SETTING_KEYS.GENERAL_INVENTORY_TRACKING]: 'true',
  
  // Email defaults (basic setup required)
  [SETTING_KEYS.EMAIL_FROM_NAME]: 'نکست کالا',
  [SETTING_KEYS.EMAIL_SMTP_SECURE]: 'true',
  
  // Payment defaults
  [SETTING_KEYS.PAYMENT_CURRENCY]: 'IRR',
  [SETTING_KEYS.PAYMENT_TAX_RATE]: '9', // 9% VAT in Iran
  
  // Shipping defaults
  [SETTING_KEYS.SHIPPING_ENABLED]: 'true',
  [SETTING_KEYS.SHIPPING_DEFAULT_COST]: '50000', // 50,000 IRR
} as const

/**
 * Seeds enhanced default settings for a complete installation
 */
export async function seedEnhancedDefaults() {
  console.log("🌱 Seeding enhanced default settings...")
  
  const settingsToInsert = Object.entries(ENHANCED_DEFAULT_SETTINGS)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => ({
      key,
      value: value as string
    }))

  // Check existing settings count
  const [settingsCount] = await db
    .select({ count: count() })
    .from(settings)

  if (settingsCount.count > 0) {
    // Add only missing enhanced settings
    return await ensureEnhancedSettings()
  }

  try {
    await db.insert(settings).values(settingsToInsert)
    
    console.log(`✅ Successfully seeded ${settingsToInsert.length} enhanced default settings.`)
    return { 
      success: true, 
      seeded: settingsToInsert.length,
      settings: settingsToInsert
    }
  } catch (error) {
    console.error("❌ Failed to seed enhanced settings:", error)
    throw error
  }
}

/**
 * Ensures all enhanced default settings exist
 */
export async function ensureEnhancedSettings() {
  const missingSettings: Record<string, string> = {}

  for (const [key, value] of Object.entries(ENHANCED_DEFAULT_SETTINGS)) {
    if (value === undefined) continue

    const [existingSetting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1)

    if (!existingSetting) {
      missingSettings[key] = value
    }
  }

  if (Object.keys(missingSettings).length === 0) {
    console.log("✅ All enhanced settings already exist.")
    return { success: true, added: 0 }
  }

  return await seedOrUpdateSettings(missingSettings, { onlyMissing: true })
}
