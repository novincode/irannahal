"use server"

import { eq, inArray, like } from "drizzle-orm"
import { db } from "@db"
import { settings } from "@db/schema"
import { withAdmin } from "@actions/utils"
import { autoInitializeSettings } from "./initialize"
import { 
  getSettingsSchema,
  type GetSettingsData,
} from "./formSchema"
import { 
  SETTING_KEYS,
  DEFAULT_SETTINGS,
  SETTING_CATEGORIES,
  type SettingKey,
  type FlatSettings,
  type GroupedSettings,
  type SettingCategory 
} from "./types"

// ==========================================
// SINGLE SETTING RETRIEVAL
// ==========================================

export async function getSetting(key: SettingKey): Promise<string | null> {
  const [result] = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1)

  return result?.value || DEFAULT_SETTINGS[key] || null
}

// ==========================================
// MULTIPLE SETTINGS RETRIEVAL
// ==========================================

export async function getSettings(data?: GetSettingsData): Promise<FlatSettings> {
  // Auto-initialize settings if needed
  await autoInitializeSettings()
  
  const validatedData = data ? getSettingsSchema.parse(data) : {}
  
  let result

  // Filter by specific keys if provided
  if (validatedData.keys && validatedData.keys.length > 0) {
    result = await db.select().from(settings).where(inArray(settings.key, validatedData.keys))
  }
  // Filter by category if provided
  else if (validatedData.category) {
    const categoryPrefix = `${validatedData.category}.%`
    result = await db.select().from(settings).where(like(settings.key, categoryPrefix))
  }
  // Get all settings
  else {
    result = await db.select().from(settings)
  }

  // Convert to flat object with defaults
  const flatSettings: FlatSettings = {}
  
  // Apply database values
  result.forEach(setting => {
    flatSettings[setting.key as SettingKey] = setting.value
  })
  
  // Apply defaults for missing values
  Object.entries(DEFAULT_SETTINGS).forEach(([key, defaultValue]) => {
    if (!(key in flatSettings) && defaultValue) {
      flatSettings[key as SettingKey] = defaultValue
    }
  })

  return flatSettings
}

// ==========================================
// ALL SETTINGS RETRIEVAL
// ==========================================

export async function getAllSettings(): Promise<FlatSettings> {
  return getSettings()
}

// ==========================================
// GROUPED SETTINGS RETRIEVAL
// ==========================================

export async function getGroupedSettings(): Promise<GroupedSettings> {
  const flatSettings = await getAllSettings()
  
  const grouped: GroupedSettings = {
    site: {},
    seo: {},
    ui: {},
    email: {},
    payment: {},
    shipping: {},
    general: {}
  }

  // Group settings by category
  Object.entries(flatSettings).forEach(([key, value]) => {
    const settingKey = key as SettingKey
    
    if (settingKey.startsWith('site.')) {
      grouped.site[settingKey] = value
    } else if (settingKey.startsWith('seo.')) {
      grouped.seo[settingKey] = value
    } else if (settingKey.startsWith('ui.')) {
      grouped.ui[settingKey] = value
    } else if (settingKey.startsWith('email.')) {
      grouped.email[settingKey] = value
    } else if (settingKey.startsWith('payment.')) {
      grouped.payment[settingKey] = value
    } else if (settingKey.startsWith('shipping.')) {
      grouped.shipping[settingKey] = value
    } else if (settingKey.startsWith('general.')) {
      grouped.general[settingKey] = value
    }
  })

  return grouped
}

// ==========================================
// CATEGORY SPECIFIC GETTERS
// ==========================================

export async function getSiteSettings() {
  return withAdmin(async (user) => {
    const allSettings = await getAllSettings()
    
    // Filter site settings
    const siteSettings: Record<string, string | null> = {}
    Object.entries(allSettings).forEach(([key, value]) => {
      if (key.startsWith('site.')) {
        siteSettings[key] = value
      }
    })
    
    return siteSettings
  })
}

export async function getSEOSettings() {
  return withAdmin(async (user) => {
    const allSettings = await getAllSettings()
    
    // Filter SEO settings
    const seoSettings: Record<string, string | null> = {}
    Object.entries(allSettings).forEach(([key, value]) => {
      if (key.startsWith('seo.')) {
        seoSettings[key] = value
      }
    })
    
    return seoSettings
  })
}

export async function getUISettings() {
  return withAdmin(async (user) => {
    const allSettings = await getAllSettings()
    
    // Filter UI settings
    const uiSettings: Record<string, string | null> = {}
    Object.entries(allSettings).forEach(([key, value]) => {
      if (key.startsWith('ui.')) {
        uiSettings[key] = value
      }
    })
    
    return uiSettings
  })
}

export async function getEmailSettings() {
  return withAdmin(async (user) => {
    const allSettings = await getAllSettings()
    
    // Filter email settings
    const emailSettings: Record<string, string | null> = {}
    Object.entries(allSettings).forEach(([key, value]) => {
      if (key.startsWith('email.')) {
        emailSettings[key] = value
      }
    })
    
    return emailSettings
  })
}

export async function getPaymentSettings() {
  return withAdmin(async (user) => {
    const allSettings = await getAllSettings()
    
    // Filter payment settings
    const paymentSettings: Record<string, string | null> = {}
    Object.entries(allSettings).forEach(([key, value]) => {
      if (key.startsWith('payment.')) {
        paymentSettings[key] = value
      }
    })
    
    return paymentSettings
  })
}

export async function getShippingSettings() {
  return withAdmin(async (user) => {
    const allSettings = await getAllSettings()
    
    // Filter shipping settings
    const shippingSettings: Record<string, string | null> = {}
    Object.entries(allSettings).forEach(([key, value]) => {
      if (key.startsWith('shipping.')) {
        shippingSettings[key] = value
      }
    })
    
    return shippingSettings
  })
}

export async function getGeneralSettings() {
  return withAdmin(async (user) => {
    const allSettings = await getAllSettings()
    
    // Filter general settings
    const generalSettings: Record<string, string | null> = {}
    Object.entries(allSettings).forEach(([key, value]) => {
      if (key.startsWith('general.')) {
        generalSettings[key] = value
      }
    })
    
    return generalSettings
  })
}

// ==========================================
// PUBLIC GETTERS (NO AUTH REQUIRED)
// ==========================================

// Get public settings that can be accessed without authentication
export async function getPublicSettings(): Promise<Partial<FlatSettings>> {
  const publicKeys: SettingKey[] = [
    SETTING_KEYS.SITE_TITLE,
    SETTING_KEYS.SITE_DESCRIPTION,
    SETTING_KEYS.SITE_LANGUAGE,
    SETTING_KEYS.SITE_CURRENCY,
    SETTING_KEYS.SEO_TITLE,
    SETTING_KEYS.SEO_DESCRIPTION,
    SETTING_KEYS.SEO_KEYWORDS,
    SETTING_KEYS.UI_THEME,
    SETTING_KEYS.UI_PRIMARY_COLOR,
    SETTING_KEYS.UI_SECONDARY_COLOR,
  ]

  return getSettings({ keys: publicKeys })
}

// Get a single public setting value
export async function getPublicSetting(key: SettingKey): Promise<string | null> {
  const publicKeys: SettingKey[] = [
    SETTING_KEYS.SITE_TITLE,
    SETTING_KEYS.SITE_DESCRIPTION,
    SETTING_KEYS.SITE_LANGUAGE,
    SETTING_KEYS.SITE_CURRENCY,
    SETTING_KEYS.SEO_TITLE,
    SETTING_KEYS.SEO_DESCRIPTION,
    SETTING_KEYS.SEO_KEYWORDS,
    SETTING_KEYS.UI_THEME,
    SETTING_KEYS.UI_PRIMARY_COLOR,
    SETTING_KEYS.UI_SECONDARY_COLOR,
  ]

  if (!publicKeys.includes(key)) {
    throw new Error("این تنظیمات قابل دسترسی عمومی نیست")
  }

  return getSetting(key)
}
