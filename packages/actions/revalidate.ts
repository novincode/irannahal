"use server"

import { revalidatePath, revalidateTag } from "next/cache"

/**
 * Force revalidation of pages that use cached menu data
 */
export async function revalidateMenuPages() {
  try {
    // Revalidate specific pages that use menu data
    revalidatePath('/', 'layout') // Home page layout
    revalidatePath('/admin', 'layout') // Admin layout
    revalidatePath('/', 'page') // Home page
    
    // Revalidate by tag if you're using fetch with tags
    revalidateTag('menu')
    revalidateTag('navigation')
    revalidateTag('header-menu')
    
    console.log('✅ Successfully revalidated menu pages')
  } catch (error) {
    console.error('❌ Failed to revalidate menu pages:', error)
    throw error
  }
}

/**
 * Force revalidation of pages that use cached settings data
 */
export async function revalidateSettingsPages() {
  try {
    // Revalidate pages that use settings
    revalidatePath('/', 'layout') // Home page layout
    revalidatePath('/admin', 'layout') // Admin layout
    revalidatePath('/', 'page') // Home page
    
    // Revalidate by tag
    revalidateTag('settings')
    revalidateTag('layout')
    revalidateTag('site-settings')
    revalidateTag('ui-settings')
    revalidateTag('seo-settings')
    
    console.log('✅ Successfully revalidated settings pages')
  } catch (error) {
    console.error('❌ Failed to revalidate settings pages:', error)
    throw error
  }
}
