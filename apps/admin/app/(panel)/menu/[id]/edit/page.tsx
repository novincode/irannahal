import React from 'react'
import { getMenuWithItems } from '@actions/menu'
import { notFound } from 'next/navigation'
import MenuEditor from './MenuEditor'

interface MenuEditPageProps {
  params: Promise<{ id: string }>
}

export default async function MenuEditPage({ params }: MenuEditPageProps) {
  const { id } = await params
  
  try {
    const menu = await getMenuWithItems(id)
    return <MenuEditor menu={menu} />
  } catch (error) {
    console.error('Failed to load menu:', error)
    notFound()
  }
}