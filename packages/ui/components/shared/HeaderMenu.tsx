import React from 'react'
import { getMenuBySlug } from '@actions/menu'
import MenuDisplay from './MenuDisplay'

interface HeaderMenuProps {
  className?: string
}

// Server component that fetches and renders the header menu
const HeaderMenu: React.FC<HeaderMenuProps> = async ({ className }) => {
  // Fetch the header menu by slug
  const menuResponse = await getMenuBySlug('header')
  
  // If no menu found or error, return null (no navigation)
  if (!menuResponse.success || !menuResponse.data) {
    console.warn('Header menu not found or failed to load')
    return null
  }

  const { items } = menuResponse.data

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
}

export default HeaderMenu
