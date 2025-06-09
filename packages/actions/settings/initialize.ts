"use server"

import { db } from "@db"
import { settings } from "@db/schema"
import { count } from "drizzle-orm"
import { ensureEnhancedSettings } from "@db/seeds/settings"

/**
 * Automatically ensures default settings exist when settings are accessed
 * This runs automatically when needed, no manual intervention required
 */
export async function autoInitializeSettings() {
  try {
    // Check if any settings exist
    const [settingsCount] = await db
      .select({ count: count() })
      .from(settings)

    // If no settings exist, initialize with defaults
    if (settingsCount.count === 0) {
      console.log("🔄 No settings found. Auto-initializing default settings...")
      await ensureEnhancedSettings()
      console.log("✅ Default settings auto-initialized successfully!")
      return { initialized: true, reason: "empty_database" }
    }

    // Always ensure essential settings exist (in case of partial data)
    const result = await ensureEnhancedSettings()
    
    if (result.added > 0) {
      console.log(`✅ Auto-added ${result.added} missing default settings.`)
      return { initialized: true, reason: "missing_defaults", added: result.added }
    }

    return { initialized: false, reason: "all_exist" }
  } catch (error) {
    console.error("❌ Failed to auto-initialize settings:", error)
    // Don't throw - let the app continue, but log the error
    return { initialized: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Check if the database is properly initialized with essential data
 */
export async function checkDatabaseInitialization() {
  try {
    const [settingsCount] = await db
      .select({ count: count() })
      .from(settings)

    return {
      isInitialized: settingsCount.count > 0,
      settingsCount: settingsCount.count,
      needsSetup: settingsCount.count === 0
    }
  } catch (error) {
    console.error("❌ Failed to check database initialization:", error)
    return {
      isInitialized: false,
      settingsCount: 0,
      needsSetup: true,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}
