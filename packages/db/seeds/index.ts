export {
  seedDefaultSettings,
  seedOrUpdateSettings,
  ensureDefaultSettings,
  seedEnhancedDefaults,
  ensureEnhancedSettings,
  ENHANCED_DEFAULT_SETTINGS
} from "./settings"

// Future seeds can be exported here
// export { seedDefaultCategories } from "./categories"
// export { seedDefaultMenus } from "./menus"
// export { seedDefaultUsers } from "./users"

/**
 * Run all essential seeds for a fresh installation
 */
export async function runInstallationSeeds() {
  console.log("🚀 Running installation seeds...")
  
  try {
    // Seed enhanced default settings
    const settingsResult = await import("./settings").then(m => m.seedEnhancedDefaults())
    
    console.log("✅ Installation seeds completed successfully!")
    return {
      success: true,
      results: {
        settings: settingsResult
      }
    }
  } catch (error) {
    console.error("❌ Installation seeds failed:", error)
    throw error
  }
}

/**
 * Ensure all essential defaults exist (safe to run multiple times)
 */
export async function ensureEssentialDefaults() {
  console.log("🔍 Ensuring essential defaults exist...")
  
  try {
    const settingsResult = await import("./settings").then(m => m.ensureEnhancedSettings())
    
    console.log("✅ Essential defaults check completed!")
    return {
      success: true,
      results: {
        settings: settingsResult
      }
    }
  } catch (error) {
    console.error("❌ Essential defaults check failed:", error)
    throw error
  }
}
