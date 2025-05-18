'use client'
import React, { ReactNode } from 'react'
import { SidebarProvider } from '../ui/sidebar'
import AdminSidebar from './AdminSidebar'

const AdminMain = ({ children }: { children: ReactNode }) => {
    return (
        <SidebarProvider className='min-h-auto flex flex-auto items-stretch relative'>

            <AdminSidebar />
            <div className='flex flex-col flex-auto'>
                {children}
            </div>

        </SidebarProvider>
    )
}

export default AdminMain