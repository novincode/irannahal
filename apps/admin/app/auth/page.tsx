import React from 'react'
import AuthPage from '@ui/components/auth/AuthPage'
import { auth } from '@auth'


const page = async () => {
    const session = await auth()


    return (
        <div>
            {session?.user?.id}
            <AuthPage />
        </div>
    )
}

export default page