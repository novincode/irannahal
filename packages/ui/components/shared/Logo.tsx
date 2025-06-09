'use client'
import React from 'react'
import Link from 'next/link'
import { useSettingsStore } from '@data/useSettingsStore'
import { SITE_SETTING_KEYS } from '@actions/settings/types'

const Logo = () => {
    const { getSettingWithDefault } = useSettingsStore()
    const siteTitle = getSettingWithDefault(SITE_SETTING_KEYS.SITE_TITLE)
    
    return (
        <Link href={'/'}>
            <strong className='text-primary font-black text-lg '>
                {siteTitle}
            </strong>
        </Link>
    )
}

export default Logo