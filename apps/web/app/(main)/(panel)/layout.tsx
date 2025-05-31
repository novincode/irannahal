import React, { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@auth'
import PanelSidebar from '@ui/components/panel/PanelSidebar'
import { Separator } from '@shadcn/separator'

interface PanelLayoutProps {
  children: ReactNode
}

export default async function PanelLayout({ children }: PanelLayoutProps) {
 

  return (
    <div className="container py-8">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar */}
        <div className="lg:block">
          <div className="sticky top-8">
            <PanelSidebar />
          </div>
        </div>
        
        {/* Separator for larger screens */}
        <Separator orientation="vertical" className="hidden lg:block" />
        
        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}