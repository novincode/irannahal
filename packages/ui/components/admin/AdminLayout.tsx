import React, { ReactNode } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminBar from './AdminBar'
import { SidebarProvider } from '../ui/sidebar'
import { useSession } from 'next-auth/react'
import { auth } from '@packages/auth'
import AdminMain from './AdminMain'

const AdminLayout = async ({ children }: CommonProps) => {

    const session = await auth()
    if (session?.user?.role !== 'admin') {

        return (
            <div className='flex flex-col min-h-screen'>
                Not Allowed
            </div>
        )
    }


    return (

        <div className='flex flex-col min-h-screen'>
            <AdminBar session={session} isInPanel={true} />
            <AdminMain>
                {children}
            </AdminMain>
        </div>

    )
}

export default AdminLayout