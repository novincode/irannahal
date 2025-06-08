import React from 'react'
import { cachedGetAllMenus } from '@actions/menu'
import MenuManagement from './MenuManagement'
import type { Menu } from '@actions/menu/types'

export default async function MenuPage() {
  try {
    const menus: Menu[] = await cachedGetAllMenus()
    return <MenuManagement initialMenus={menus} />
  } catch (error) {
    console.error('Failed to load menus:', error)
    return <MenuManagement initialMenus={[]} />
  }
}