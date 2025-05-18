import React from 'react'
import { Button } from '../ui/button';
import { Globe } from 'lucide-react';
import { auth } from '@packages/auth';
import Link from 'next/link';
import AdminBarDropdown from './AdminBarDropdown';

interface AdminBarProps extends CommonProps {
    isInPanel?: boolean
}
const AdminBar = async ({ isInPanel, ...props }: AdminBarProps) => {
    const session = props.session || await auth()

    if (!session) {
        return null
    }
    if (session.user?.role !== 'admin') {
        return null
    }



    return (
        <div className='bg-background p-1 border-b border-border shadow-lg sticky top-0 z-50 flex justify-between items-center'>

            {isInPanel ?

                <Button variant={'ghost'} size={'sm'} asChild>
                    <Link href={process.env.NEXT_PUBLIC_APP_URL || ""} >
                        <Globe />
                        <span className='font-light'>مشاهده وبسایت</span>
                    </Link>
                </Button>
                :
                <Button variant={'ghost'} size={'sm'} asChild>
                    <Link href={process.env.ADMIN_URL || ""} >
                        <Globe />
                        <span className='font-light'>پنل مدیریت</span>
                    </Link>
                </Button>
            }

            <div>
                <AdminBarDropdown admin_url={process.env.ADMIN_URL || "/admin"} />
            </div>
        </div>
    )
}

export default AdminBar