'use client'
import React, { useEffect, ReactNode } from 'react'
import { useSettingsStore } from '@data/useSettingsStore'

interface SettingsProviderProps {
  children: ReactNode
  fallback?: ReactNode
  errorFallback?: ReactNode
}

/**
 * SettingsProvider - Initializes settings when the app starts
 * This ensures settings are available throughout the application
 * 
 * Usage: Wrap your app root component with this provider
 */
export const SettingsProvider: React.FC<SettingsProviderProps> = ({ 
  children, 
  fallback,
  errorFallback 
}) => {
  const { fetchSettings, initialized, isLoading, error } = useSettingsStore()

  useEffect(() => {
    // Fetch settings when the provider mounts if they haven't been fetched yet
    if (!initialized && !isLoading) {
      fetchSettings().catch((err) => {
        console.error('Failed to initialize settings:', err)
      })
    }
  }, [fetchSettings, initialized, isLoading])

  // Show error fallback if there's an error
  if (error && errorFallback) {
    console.error('Settings initialization error:', error)
    return <>{errorFallback}</>
  }

  // Show loading fallback while initializing
  if (!initialized && isLoading && fallback) {
    return <>{fallback}</>
  }

  // Log error but don't block rendering if no error fallback provided
  if (error) {
    console.error('Settings initialization error:', error)
  }

  return <>{children}</>
}

export default SettingsProvider