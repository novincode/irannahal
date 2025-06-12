// Hook to handle cart hydration and loading states

import { useEffect } from 'react'
import { useCartStore } from '@data/useCartStore'

export function useCartHydration() {
  const isHydrated = useCartStore(state => state.isHydrated)
  const setHydrated = useCartStore(state => state.setHydrated)
  const setLoading = useCartStore(state => state.setLoading)
  const items = useCartStore(state => state.items)

  useEffect(() => {
    // Simulate hydration delay to prevent hydration mismatch
    const timer = setTimeout(() => {
      setHydrated(true)
      setLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [setHydrated, setLoading])

  return {
    isHydrated,
    isLoading: !isHydrated,
    hasItems: items.length > 0
  }
}
