"use server"

import { settingsCache, settingsCacheKeys } from "./cacheConfig"
import * as settingsActions from "./get"

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
