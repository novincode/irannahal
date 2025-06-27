'use client'
import React, { useEffect } from 'react'
import { useSettingsStore } from '@data/useSettingsStore'
import { SETTING_KEYS } from '@actions/settings/types'
import { useGlobalRefresh } from '@data/globalRefresh'
import MainHeader from './MainHeader'
import HeaderNavigationClient from './HeaderNavigationClient'

interface HeaderProps {
  className?: string
  showNavigation?: boolean
}

/**
 * Header - Complete header component with main header and navigation
 * This is the main header component that should be used in layouts
 */
const Header: React.FC<HeaderProps> = ({ 
  className = '', 
  showNavigation = true 
}) => {
  const { 
    fetchSettings, 
    initialized, 
    isLoading: settingsLoading,
    getSetting,
    refresh 
  } = useSettingsStore()

  // Initialize settings if not already done
  useEffect(() => {
    if (!initialized && !settingsLoading) {
      fetchSettings()
    }
  }, [initialized, settingsLoading, fetchSettings])

  // Listen for global refresh events and refresh settings
  useEffect(() => {
    const cleanup = useGlobalRefresh((detail) => {
      console.log('🔄 Header: Received refresh event, refreshing settings...', detail)
      refresh()
    }, ['settings', 'all'])

    return cleanup
  }, [refresh])

  // Get header style from settings
  const headerStyle = getSetting(SETTING_KEYS.UI_HEADER_STYLE) || 'modern'

  return (
    <div className={`sticky top-0 z-50 ${className}`}>
      <MainHeader />
      {showNavigation && <HeaderNavigationClient />}
    </div>
  )
}

export default Header
