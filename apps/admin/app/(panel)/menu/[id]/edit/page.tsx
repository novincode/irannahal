import React from 'react'
import { getMenuWithItems } from '@actions/menu/get'
import { notFound } from 'next/navigation'
import MenuEditor from './MenuEditor'

interface MenuEditPageProps {
  params: Promise<{ id: string }>
}

export default async function MenuEditPage({ params }: MenuEditPageProps) {
  const { id } = await params
  
  const response = await getMenuWithItems(id)
  
  if (!response.success || !response.data) {
    notFound()
  }

  return <MenuEditor menu={response.data} />
}