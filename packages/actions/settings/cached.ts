"use server"

import { getPublicSettings } from "./get"
import { settingsCache, settingsCacheKeys } from "./cacheConfig"
import { getDefaultSetting, SETTING_KEYS } from "./types"

/**
 * Get cached site information (title, description, logo, etc.)
 * This is optimized for frequent access in layout components
 */
export async function getCachedSiteInfo() {
  const cachedAction = settingsCache.cacheWith(
    async () => {
      const settings = await getPublicSettings()
      
      return {
        title: settings[SETTING_KEYS.SITE_TITLE] || getDefaultSetting(SETTING_KEYS.SITE_TITLE),
        description: settings[SETTING_KEYS.SITE_DESCRIPTION] || getDefaultSetting(SETTING_KEYS.SITE_DESCRIPTION), 
        language: settings[SETTING_KEYS.SITE_LANGUAGE] || getDefaultSetting(SETTING_KEYS.SITE_LANGUAGE),
        currency: settings[SETTING_KEYS.SITE_CURRENCY] || getDefaultSetting(SETTING_KEYS.SITE_CURRENCY),
        timezone: settings[SETTING_KEYS.SITE_TIMEZONE] || getDefaultSetting(SETTING_KEYS.SITE_TIMEZONE),
        logo: settings[SETTING_KEYS.SITE_LOGO] || getDefaultSetting(SETTING_KEYS.SITE_LOGO) || null,
        favicon: settings[SETTING_KEYS.SITE_FAVICON] || getDefaultSetting(SETTING_KEYS.SITE_FAVICON) || null,
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
        theme: settings[SETTING_KEYS.UI_THEME] || getDefaultSetting(SETTING_KEYS.UI_THEME),
        primaryColor: settings[SETTING_KEYS.UI_PRIMARY_COLOR] || getDefaultSetting(SETTING_KEYS.UI_PRIMARY_COLOR),
        secondaryColor: settings[SETTING_KEYS.UI_SECONDARY_COLOR] || getDefaultSetting(SETTING_KEYS.UI_SECONDARY_COLOR),
        headerStyle: settings[SETTING_KEYS.UI_HEADER_STYLE] || getDefaultSetting(SETTING_KEYS.UI_HEADER_STYLE),
        footerStyle: settings[SETTING_KEYS.UI_FOOTER_STYLE] || getDefaultSetting(SETTING_KEYS.UI_FOOTER_STYLE),
        homepageLayout: settings[SETTING_KEYS.UI_HOMEPAGE_LAYOUT] || getDefaultSetting(SETTING_KEYS.UI_HOMEPAGE_LAYOUT),
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
        title: settings[SETTING_KEYS.SEO_TITLE] || settings[SETTING_KEYS.SITE_TITLE] || getDefaultSetting(SETTING_KEYS.SEO_TITLE) || getDefaultSetting(SETTING_KEYS.SITE_TITLE),
        description: settings[SETTING_KEYS.SEO_DESCRIPTION] || settings[SETTING_KEYS.SITE_DESCRIPTION] || getDefaultSetting(SETTING_KEYS.SEO_DESCRIPTION) || getDefaultSetting(SETTING_KEYS.SITE_DESCRIPTION),
        keywords: settings[SETTING_KEYS.SEO_KEYWORDS] || getDefaultSetting(SETTING_KEYS.SEO_KEYWORDS),
        robots: settings[SETTING_KEYS.SEO_ROBOTS] || getDefaultSetting(SETTING_KEYS.SEO_ROBOTS),
        googleAnalytics: settings[SETTING_KEYS.SEO_GOOGLE_ANALYTICS] || getDefaultSetting(SETTING_KEYS.SEO_GOOGLE_ANALYTICS) || null,
        googleTagManager: settings[SETTING_KEYS.SEO_GOOGLE_TAG_MANAGER] || getDefaultSetting(SETTING_KEYS.SEO_GOOGLE_TAG_MANAGER) || null,
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
      return settings[SETTING_KEYS.GENERAL_MAINTENANCE_MODE] === "true"
    },
    [settingsCacheKeys.public, settingsCacheKeys.general]
  )
  
  return await cachedAction()
}
