import React from 'react'
import { getMenuBySlug } from '@actions/menu'
import MenuDisplay from '@ui/components/shared/MenuDisplay'

const HeaderNavigation = async () => {
  try {
    const response = await getMenuBySlug('header')
    
    if (!response.success || !response.data || !response.data.items || response.data.items.length === 0) {
      return null
    }

    return (
      <nav className="border-t border-border bg-card p-2">
        <div className="container flex">
          <MenuDisplay items={response.data.items} />
        </div>
      </nav>
    )
  } catch (error) {
    console.error('Failed to load header menu:', error)
    return null
  }
}

export default HeaderNavigation
