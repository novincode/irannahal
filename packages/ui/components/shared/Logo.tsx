import React from 'react'
import Link from 'next/link'

const Logo = () => {
    return (
        <Link href={'/'}>
            <strong className='text-primary font-black text-lg '>
                نهال تو
            </strong>
        </Link>
    )
}

export default Logo