"use server"

import { getPublicSettings } from "./get"
import { settingsCache, settingsCacheKeys } from "./cacheConfig"

/**
 * Get cached site information (title, description, logo, etc.)
 * This is optimized for frequent access in layout components
 */
export async function getCachedSiteInfo() {
  const cachedAction = settingsCache.cacheWith(
    async () => {
      const settings = await getPublicSettings()
      
      return {
        title: settings["site.title"] || "نکست کالا",
        description: settings["site.description"] || "فروشگاه آنلاین نکست کالا", 
        language: settings["site.language"] || "fa",
        currency: settings["site.currency"] || "IRR",
        timezone: settings["site.timezone"] || "Asia/Tehran",
        logo: settings["site.logo"] || null,
        favicon: settings["site.favicon"] || null,
      }
    },
    [settingsCacheKeys.public, settingsCacheKeys.site]
  )
  
  return await cachedAction()
}

/**
 * Get cached theme and UI settings
 * Optimized for theme providers and UI components
 */
export async function getCachedUISettings() {
  const cachedAction = settingsCache.cacheWith(
    async () => {
      const settings = await getPublicSettings()
      
      return {
        theme: settings["ui.theme"] || "light",
        primaryColor: settings["ui.primary_color"] || "#3b82f6",
        secondaryColor: settings["ui.secondary_color"] || "",
        headerStyle: settings["ui.header_style"] || "modern",
        footerStyle: settings["ui.footer_style"] || "detailed",
        homepageLayout: settings["ui.homepage_layout"] || "grid",
      }
    },
    [settingsCacheKeys.public, settingsCacheKeys.ui]
  )
  
  return await cachedAction()
}

/**
 * Get cached SEO settings for meta tags
 */
export async function getCachedSEOSettings() {
  const cachedAction = settingsCache.cacheWith(
    async () => {
      const settings = await getPublicSettings()
      
      return {
        title: settings["seo.title"] || settings["site.title"] || "نکست کالا",
        description: settings["seo.description"] || settings["site.description"] || "فروشگاه آنلاین نکست کالا",
        keywords: settings["seo.keywords"] || "",
        robots: settings["seo.robots"] || "index,follow",
        googleAnalytics: settings["seo.google_analytics"] || null,
        googleTagManager: settings["seo.google_tag_manager"] || null,
      }
    },
    [settingsCacheKeys.public, settingsCacheKeys.seo]
  )
  
  return await cachedAction()
}

/**
 * Get specific cached setting value
 */
export async function getCachedSetting(key: string, defaultValue?: string) {
  const cachedAction = settingsCache.cacheWith(
    async () => {
      const settings = await getPublicSettings()
      return settings[key] || defaultValue || null
    },
    [settingsCacheKeys.public, settingsCacheKeys.bySingleKey(key)]
  )
  
  return await cachedAction()
}

/**
 * Check maintenance mode (frequently accessed)
 */
export async function getCachedMaintenanceMode(): Promise<boolean> {
  const cachedAction = settingsCache.cacheWith(
    async () => {
      const settings = await getPublicSettings()
      return settings["general.maintenance_mode"] === "true"
    },
    [settingsCacheKeys.public, settingsCacheKeys.general]
  )
  
  return await cachedAction()
}
