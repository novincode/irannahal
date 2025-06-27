'use client'
import React, { useEffect, useState } from 'react'
import { cachedGetMenuBySlug } from '@actions/menu'
import { useGlobalRefresh } from '@data/globalRefresh'
import MenuDisplay from '@ui/components/shared/MenuDisplay'

interface HeaderNavigationProps {
  className?: string
}

const HeaderNavigation: React.FC<HeaderNavigationProps> = ({ className }) => {
  const [menu, setMenu] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMenu = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const headerMenu = await cachedGetMenuBySlug('header')
      setMenu(headerMenu)
    } catch (err) {
      console.error('Failed to load header menu:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchMenu()
  }, [])

  // Listen for global refresh events and refresh menu
  useEffect(() => {
    const cleanup = useGlobalRefresh((detail) => {
      console.log('🔄 HeaderNavigation: Received refresh event, refreshing menu...', detail)
      fetchMenu()
    }, ['menu', 'all'])

    return cleanup
  }, [])

  if (isLoading) {
    return (
      <nav className={`border-t border-border bg-card p-2 ${className || ''}`}>
        <div className="container flex">
          <div className="text-sm text-muted-foreground">در حال بارگذاری منو...</div>
        </div>
      </nav>
    )
  }

  if (error) {
    console.error('Header menu error:', error)
    return null
  }

  if (!menu || !menu.items || menu.items.length === 0) {
    return null
  }

  return (
    <nav className={`border-t border-border bg-card p-2 ${className || ''}`}>
      <div className="container flex">
        <MenuDisplay items={menu.items} />
      </div>
    </nav>
  )
}

export default HeaderNavigation
