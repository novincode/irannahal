'use client'

// Global refresh event system for coordinating cache invalidation across components

type RefreshEventType = 'settings' | 'menu' | 'all'

interface RefreshEventDetails {
  type: RefreshEventType
  timestamp: number
}

// Custom event names
const REFRESH_EVENT_NAME = 'nextkala-refresh'

/**
 * Dispatch a global refresh event to notify all components to refresh
 */
export function dispatchGlobalRefresh(type: RefreshEventType = 'all') {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent(REFRESH_EVENT_NAME, {
      detail: {
        type,
        timestamp: Date.now()
      } as RefreshEventDetails
    })
    window.dispatchEvent(event)
    console.log(`🔄 Dispatched global refresh event: ${type}`)
  }
}

/**
 * Listen for global refresh events
 */
export function useGlobalRefresh(
  callback: (detail: RefreshEventDetails) => void,
  types: RefreshEventType[] = ['all']
) {
  const handleRefresh = (event: CustomEvent<RefreshEventDetails>) => {
    const { type } = event.detail
    if (types.includes('all') || types.includes(type)) {
      callback(event.detail)
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener(REFRESH_EVENT_NAME, handleRefresh as EventListener)
    return () => {
      window.removeEventListener(REFRESH_EVENT_NAME, handleRefresh as EventListener)
    }
  }

  return () => {}
}
