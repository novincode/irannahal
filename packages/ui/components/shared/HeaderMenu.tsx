import React from 'react'
import { cachedGetMenuBySlug } from '@actions/menu'
import MenuDisplay from './MenuDisplay'

interface HeaderMenuProps {
  className?: string
}

// Server component that fetches and renders the header menu
const HeaderMenu: React.FC<HeaderMenuProps> = async ({ className }) => {
  try {
    // Fetch the header menu by slug using cached version
    const menu = await cachedGetMenuBySlug('header')
    
    const { items } = menu

    // If no menu items, return null
    if (!items || items.length === 0) {
      return null
    }

    return (
      <MenuDisplay 
        items={items} 
        className={className}
      />
    )
  } catch (error) {
    // If no menu found or error, return null (no navigation)
    console.warn('Header menu not found or failed to load:', error)
    return null
  }
}

export default HeaderMenu
