"use server"

import { settingsCache, settingsCacheKeys } from "./cacheConfig"
import * as settingsActions from "./get"
import { getDefaultSetting, SITE_SETTING_KEYS, UI_SETTING_KEYS, SEO_SETTING_KEYS, GENERAL_SETTING_KEYS } from "./types"

// ==========================================
// CACHED FUNCTIONS - REUSING EXISTING ACTIONS
// ==========================================

export async function getAllSettings() {
  const cachedAction = settingsCache.cacheWith(
    () => settingsActions.getAllSettings(),
    [settingsCacheKeys.all]
  )
  
  return await cachedAction()
}

export async function getGroupedSettings() {
  const cachedAction = settingsCache.cacheWith(
    () => settingsActions.getGroupedSettings(),
    [settingsCacheKeys.grouped]
  )
  
  return await cachedAction()
}

export async function getPublicSettings() {
  const cachedAction = settingsCache.cacheWith(
    () => settingsActions.getPublicSettings(),
    [settingsCacheKeys.public]
  )
  
  return await cachedAction()
}

export async function getSetting(key: string) {
  const cachedAction = settingsCache.cacheWith(
    () => settingsActions.getSetting(key as any),
    [settingsCacheKeys.bySingleKey(key)]
  )
  
  return await cachedAction()
}

export async function getPublicSetting(key: string) {
  const cachedAction = settingsCache.cacheWith(
    () => settingsActions.getPublicSetting(key as any),
    [settingsCacheKeys.bySingleKey(key), settingsCacheKeys.public]
  )
  
  return await cachedAction()
}

// ==========================================
// CATEGORY-SPECIFIC CACHED FUNCTIONS
// ==========================================

export async function getSiteSettings() {
  const cachedAction = settingsCache.cacheWith(
    () => settingsActions.getSiteSettings(),
    [settingsCacheKeys.site, settingsCacheKeys.byCategory('site')]
  )
  
  return await cachedAction()
}

export async function getSEOSettings() {
  const cachedAction = settingsCache.cacheWith(
    () => settingsActions.getSEOSettings(),
    [settingsCacheKeys.seo, settingsCacheKeys.byCategory('seo')]
  )
  
  return await cachedAction()
}

export async function getUISettings() {
  const cachedAction = settingsCache.cacheWith(
    () => settingsActions.getUISettings(),
    [settingsCacheKeys.ui, settingsCacheKeys.byCategory('ui')]
  )
  
  return await cachedAction()
}

export async function getEmailSettings() {
  const cachedAction = settingsCache.cacheWith(
    () => settingsActions.getEmailSettings(),
    [settingsCacheKeys.email, settingsCacheKeys.byCategory('email')]
  )
  
  return await cachedAction()
}

export async function getPaymentSettings() {
  const cachedAction = settingsCache.cacheWith(
    () => settingsActions.getPaymentSettings(),
    [settingsCacheKeys.payment, settingsCacheKeys.byCategory('payment')]
  )
  
  return await cachedAction()
}

export async function getShippingSettings() {
  const cachedAction = settingsCache.cacheWith(
    () => settingsActions.getShippingSettings(),
    [settingsCacheKeys.shipping, settingsCacheKeys.byCategory('shipping')]
  )
  
  return await cachedAction()
}

export async function getGeneralSettings() {
  const cachedAction = settingsCache.cacheWith(
    () => settingsActions.getGeneralSettings(),
    [settingsCacheKeys.general, settingsCacheKeys.byCategory('general')]
  )
  
  return await cachedAction()
}

// ==========================================
// SPECIALIZED CACHED FUNCTIONS
// ==========================================

/**
 * Get cached site information (title, description, logo, etc.)
 * This is optimized for frequent access in layout components
 */
export async function getCachedSiteInfo() {
  const cachedAction = settingsCache.cacheWith(
    async () => {
      const settings = await settingsActions.getPublicSettings()
      
      return {
        title: settings[SITE_SETTING_KEYS.SITE_TITLE] || getDefaultSetting(SITE_SETTING_KEYS.SITE_TITLE),
        description: settings[SITE_SETTING_KEYS.SITE_DESCRIPTION] || getDefaultSetting(SITE_SETTING_KEYS.SITE_DESCRIPTION), 
        language: settings[SITE_SETTING_KEYS.SITE_LANGUAGE] || getDefaultSetting(SITE_SETTING_KEYS.SITE_LANGUAGE),
        currency: settings[SITE_SETTING_KEYS.SITE_CURRENCY] || getDefaultSetting(SITE_SETTING_KEYS.SITE_CURRENCY),
        timezone: settings[SITE_SETTING_KEYS.SITE_TIMEZONE] || getDefaultSetting(SITE_SETTING_KEYS.SITE_TIMEZONE),
        logo: settings[SITE_SETTING_KEYS.SITE_LOGO] || getDefaultSetting(SITE_SETTING_KEYS.SITE_LOGO) || null,
        favicon: settings[SITE_SETTING_KEYS.SITE_FAVICON] || getDefaultSetting(SITE_SETTING_KEYS.SITE_FAVICON) || null,
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
      const settings = await settingsActions.getPublicSettings()
      
      return {
        theme: settings[UI_SETTING_KEYS.UI_THEME] || getDefaultSetting(UI_SETTING_KEYS.UI_THEME),
        primaryColor: settings[UI_SETTING_KEYS.UI_PRIMARY_COLOR] || getDefaultSetting(UI_SETTING_KEYS.UI_PRIMARY_COLOR),
        secondaryColor: settings[UI_SETTING_KEYS.UI_SECONDARY_COLOR] || getDefaultSetting(UI_SETTING_KEYS.UI_SECONDARY_COLOR),
        headerStyle: settings[UI_SETTING_KEYS.UI_HEADER_STYLE] || getDefaultSetting(UI_SETTING_KEYS.UI_HEADER_STYLE),
        footerStyle: settings[UI_SETTING_KEYS.UI_FOOTER_STYLE] || getDefaultSetting(UI_SETTING_KEYS.UI_FOOTER_STYLE),
        homepageLayout: settings[UI_SETTING_KEYS.UI_HOMEPAGE_LAYOUT] || getDefaultSetting(UI_SETTING_KEYS.UI_HOMEPAGE_LAYOUT),
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
      const settings = await settingsActions.getPublicSettings()
      
      return {
        title: settings[SEO_SETTING_KEYS.SEO_TITLE] || settings[SITE_SETTING_KEYS.SITE_TITLE] || getDefaultSetting(SEO_SETTING_KEYS.SEO_TITLE) || getDefaultSetting(SITE_SETTING_KEYS.SITE_TITLE),
        description: settings[SEO_SETTING_KEYS.SEO_DESCRIPTION] || settings[SITE_SETTING_KEYS.SITE_DESCRIPTION] || getDefaultSetting(SEO_SETTING_KEYS.SEO_DESCRIPTION) || getDefaultSetting(SITE_SETTING_KEYS.SITE_DESCRIPTION),
        keywords: settings[SEO_SETTING_KEYS.SEO_KEYWORDS] || getDefaultSetting(SEO_SETTING_KEYS.SEO_KEYWORDS),
        robots: settings[SEO_SETTING_KEYS.SEO_ROBOTS] || getDefaultSetting(SEO_SETTING_KEYS.SEO_ROBOTS),
        googleAnalytics: settings[SEO_SETTING_KEYS.SEO_GOOGLE_ANALYTICS] || getDefaultSetting(SEO_SETTING_KEYS.SEO_GOOGLE_ANALYTICS) || null,
        googleTagManager: settings[SEO_SETTING_KEYS.SEO_GOOGLE_TAG_MANAGER] || getDefaultSetting(SEO_SETTING_KEYS.SEO_GOOGLE_TAG_MANAGER) || null,
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
      const settings = await settingsActions.getPublicSettings()
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
      const settings = await settingsActions.getPublicSettings()
      return settings[GENERAL_SETTING_KEYS.GENERAL_MAINTENANCE_MODE] === "true"
    },
    [settingsCacheKeys.public, settingsCacheKeys.general]
  )
  
  return await cachedAction()
}
