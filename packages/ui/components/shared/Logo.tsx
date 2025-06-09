'use client'
import React from 'react'
import Link from 'next/link'
import { useSettingsStore } from '@data/useSettingsStore'
import { SETTING_KEYS } from '@actions/settings/types'

const Logo = () => {
    const { getSettingWithDefault } = useSettingsStore()
    const siteTitle = getSettingWithDefault(SETTING_KEYS.SITE_TITLE, 'نهال تو')
    
    return (
        <Link href={'/'}>
            <strong className='text-primary font-black text-lg '>
                {siteTitle}
            </strong>
        </Link>
    )
}

export default Logo