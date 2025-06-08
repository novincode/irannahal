import React from 'react'
import { cachedGetMenuBySlug } from '@actions/menu'
import MenuDisplay from '@ui/components/shared/MenuDisplay'

const HeaderNavigation = async () => {
  try {
    const menu = await cachedGetMenuBySlug('header')
    
    if (!menu || !menu.items || menu.items.length === 0) {
      return null
    }

    return (
      <nav className="border-t border-border bg-card p-2">
        <div className="container flex">
          <MenuDisplay items={menu.items} />
        </div>
      </nav>
    )
  } catch (error) {
    console.error('Failed to load header menu:', error)
    return null
  }
}

export default HeaderNavigation
