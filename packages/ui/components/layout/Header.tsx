'use client'
import React, { useEffect } from 'react'
import { useSettingsStore } from '@data/useSettingsStore'
import { SETTING_KEYS } from '@actions/settings/types'
import MainHeader from './MainHeader'
import HeaderNavigation from './HeaderNavigation'

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
    getSetting 
  } = useSettingsStore()

  // Initialize settings if not already done
  useEffect(() => {
    if (!initialized && !settingsLoading) {
      fetchSettings()
    }
  }, [initialized, settingsLoading, fetchSettings])

  // Get header style from settings
  const headerStyle = getSetting(SETTING_KEYS.UI_HEADER_STYLE) || 'modern'

  return (
    <div className={`sticky top-0 z-50 ${className}`}>
      <MainHeader />
      {showNavigation && <HeaderNavigation />}
    </div>
  )
}

export default Header
