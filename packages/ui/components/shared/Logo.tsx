'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSettingsStore } from '@data/useSettingsStore'
import { SETTING_KEYS } from '@actions/settings/types'
import { useGlobalRefresh } from '@data/globalRefresh'

const Logo = () => {
    const { 
        getSettingWithDefault, 
        fetchSettings, 
        initialized, 
        isLoading: settingsLoading,
        refresh,
        settings,
        lastUpdated
    } = useSettingsStore()
    
    const [componentId] = useState(() => Math.random().toString(36).substr(2, 9))
    
    // Force settings fetch on mount
    useEffect(() => {
        console.log(`🏷️ Logo ${componentId}: Component mounted, initialized:`, initialized)
        if (!initialized) {
            console.log(`🏷️ Logo ${componentId}: Fetching settings on mount...`)
            fetchSettings()
        }
    }, [fetchSettings, initialized, componentId])

    // Listen for global refresh events and refresh settings
    useEffect(() => {
        const cleanup = useGlobalRefresh((detail) => {
            console.log(`🏷️ Logo ${componentId}: Received refresh event, refreshing settings...`, detail)
            refresh()
        }, ['settings', 'all'])

        return cleanup
    }, [refresh, componentId])
    
    const siteTitle = getSettingWithDefault(SETTING_KEYS.SITE_TITLE, 'نکست کالا')
     
    // Debug - just for testing
    console.log(`🏷️ Logo ${componentId} render:`, {
      initialized,
      settingsCount: Object.keys(settings).length,
      siteTitle,
      rawSetting: settings[SETTING_KEYS.SITE_TITLE],
      lastUpdated: new Date(lastUpdated).toISOString(),
      storeSettingsKeys: Object.keys(settings).slice(0, 3)
    })
    
    return (
        <Link href={'/'}>
            <strong className='text-primary font-black text-lg '>
                {siteTitle}
            </strong>
        </Link>
    )
}

export default Logo