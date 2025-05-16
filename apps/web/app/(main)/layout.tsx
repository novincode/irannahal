import React, { ReactNode } from 'react'
import MainHeader from '@ui/components/layout/MainHeader'
import MainFooter from '@ui/components/layout/MainFooter'


const layout = ({ children }: { children: ReactNode }) => {
    return (
        <div className='min-h-screen flex flex-col'>
            <MainHeader />
            <main className='flex-1'>
                {children}

            </main>
            <MainFooter />

        </div>
    )
}

export default layout