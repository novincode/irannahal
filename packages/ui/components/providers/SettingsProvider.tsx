'use client'

import { useEffect } from 'react'
import { useSettingsStore } from '@data/useSettingsStore'

interface SettingsProviderProps {
  children: React.ReactNode
  initialSettings?: any // Optional server-side settings
}

export function SettingsProvider({ children, initialSettings }: SettingsProviderProps) {
  const { loadSettings, updateSettings, isInitialized } = useSettingsStore()

  useEffect(() => {
    // If we have initial settings from server, use them immediately
    if (initialSettings && !isInitialized) {
      updateSettings(initialSettings)
    } else if (!isInitialized) {
      // Otherwise load from server
      loadSettings()
    }
  }, [initialSettings, isInitialized, loadSettings, updateSettings])

  // Always render children - the store handles loading states
  return <>{children}</>
}
