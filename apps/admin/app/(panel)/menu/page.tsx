import React from 'react'
import { getAllMenus } from '@actions/menu/get'
import MenuManagement from './MenuManagement'
import type { Menu } from '@actions/menu/types'

export default async function MenuPage() {
  const menusResponse = await getAllMenus()
  const menus: Menu[] = menusResponse.success ? menusResponse.data : []

  return <MenuManagement initialMenus={menus} />
}