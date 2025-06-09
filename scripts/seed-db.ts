#!/usr/bin/env tsx

/**
 * Database seeding script for NextKala
 * 
 * Usage:
 *   pnpm seed                    # Run all installation seeds
 *   pnpm seed --settings         # Seed only settings
 *   pnpm seed --ensure           # Ensure defaults exist (safe)
 *   pnpm seed --force-settings   # Force update existing settings
 */

import { seedDefaultSettings, seedEnhancedDefaults, ensureEnhancedSettings, seedOrUpdateSettings } from "../packages/db/seeds/settings"
import { runInstallationSeeds, ensureEssentialDefaults } from "../packages/db/seeds"

async function main() {
  const args = process.argv.slice(2)
  
  try {
    if (args.includes('--settings')) {
      console.log("🌱 Seeding default settings only...")
      await seedDefaultSettings()
    } else if (args.includes('--enhanced')) {
      console.log("🌱 Seeding enhanced settings...")
      await seedEnhancedDefaults()
    } else if (args.includes('--ensure')) {
      console.log("🔍 Ensuring essential defaults exist...")
      await ensureEssentialDefaults()
    } else if (args.includes('--force-settings')) {
      console.log("🔄 Force updating all default settings...")
      const { ENHANCED_DEFAULT_SETTINGS } = await import("../packages/db/seeds/settings")
      await seedOrUpdateSettings(ENHANCED_DEFAULT_SETTINGS, { force: true, onlyMissing: false })
    } else {
      console.log("🚀 Running full installation seeds...")
      await runInstallationSeeds()
    }
    
    console.log("✅ Seeding completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("❌ Seeding failed:", error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
