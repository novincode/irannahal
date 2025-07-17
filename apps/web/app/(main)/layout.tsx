import React, { ReactNode } from 'react'
import MainHeader from '@ui/components/layout/MainHeader'
import HeaderNavigation from '@ui/components/layout/HeaderNavigation'
import MainFooter from '@ui/components/layout/MainFooter'
import AdminBar from '@ui/components/admin/AdminBar'
import CartDrawer from '@ui/components/products/CartDrawer'
import AppNav from '@ui/components/shared/AppNav'

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className='min-h-screen flex flex-col'>
            <AdminBar />
            <div className='border-b border-border bg-card'>
                <MainHeader />
                <HeaderNavigation className="hidden md:block" />
            </div>
            <main className='flex-1'>
                {children}
            </main>
            <MainFooter />
            <CartDrawer />
            <AppNav />
        </div>
    )
}