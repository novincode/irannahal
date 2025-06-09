'use client'
import React, { useEffect, ReactNode } from 'react'
import { useSettingsStore } from '@data/useSettingsStore'

interface SettingsProviderProps {
  children: ReactNode
}

/**
 * SettingsProvider - Initializes settings when the app starts
 * This ensures settings are available throughout the application
 * 
 * Usage: Wrap your app root component with this provider
 */
export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const { fetchSettings, initialized, isLoading, error } = useSettingsStore()

  useEffect(() => {
    // Fetch settings when the provider mounts if they haven't been fetched yet
    if (!initialized && !isLoading) {
      fetchSettings().catch((err) => {
        console.error('Failed to initialize settings:', err)
      })
    }
  }, [fetchSettings, initialized, isLoading])

  // Optional: You can add a loading state or error handling here
  if (error) {
    console.error('Settings initialization error:', error)
    // You could show an error boundary or fallback UI here
  }

  return <>{children}</>
}

export default SettingsProvider