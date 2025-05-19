'use client'
import React, { ReactNode } from 'react'
import { SidebarProvider, SidebarTrigger } from '../ui/sidebar'
import AdminSidebar from './AdminSidebar'
import { PanelLeftIcon } from 'lucide-react'

const AdminMain = ({ children }: { children: ReactNode }) => {
    return (
        <SidebarProvider className='min-h-auto flex flex-auto items-stretch relative'>
            <AdminSidebar />
            <div className='flex flex-col flex-auto'>
                {/* Sidebar collapse/expand trigger */}
                <div className="p-2">
                    <SidebarTrigger>
                        <PanelLeftIcon className="w-5 h-5" />
                    </SidebarTrigger>
                </div>
                <div className='flex-auto flex flex-col p-4'>
                    {children}

                </div>
            </div>
        </SidebarProvider>
    )
}

export default AdminMain