import React, { ReactNode } from 'react'
import MainHeader from '@ui/components/layout/MainHeader'
import HeaderNavigation from '@ui/components/layout/HeaderNavigation'
import MainFooter from '@ui/components/layout/MainFooter'
import AdminBar from '@ui/components/admin/AdminBar'
import { auth } from '@auth'
import CartDrawer from '@ui/components/products/CartDrawer'

const layout =  ({ children }: { children: ReactNode }) => {
    return (
        <div className='min-h-screen flex flex-col'>
            <AdminBar />
            <div className='border-b border-border bg-card'>
                <MainHeader />
                <HeaderNavigation />
            </div>
            <main className='flex-1'>
                {children}
            </main>
            <MainFooter />
            <CartDrawer />
        </div>
    )
}

export default layout