'use client'
import React, { useEffect } from 'react'
import Logo from '@ui/components/shared/Logo'
import { Button } from '@shadcn/button'
import CommandSearch from '@ui/components/forms/CommandSearch'
import { MdOutlineShoppingCart } from "react-icons/md";
import AvatarMenu from '@ui/components/shared/AvatarMenu';
import ThemeSwitch from '@ui/components/shared/ThemeSwitch'
import { useCartStore } from '@data/useCartStore'
import { useSettingsStore } from '@data/useSettingsStore'
import { SETTING_KEYS } from '@actions/settings/types'

// --- MainHeader ---
const MainHeader = () => {
  const openDrawer = useCartStore((state) => state.openDrawer)
  const items = useCartStore((state) => state.items)
  
  // Settings store
  const { 
    fetchSettings, 
    initialized, 
    getSetting, 
    getSettingWithDefault,
    isLoading: settingsLoading 
  } = useSettingsStore()
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  
  // Initialize settings when component mounts
  useEffect(() => {
    if (!initialized && !settingsLoading) {
      fetchSettings()
    }
  }, [initialized, settingsLoading, fetchSettings])

  // Get site settings for header customization
  const siteTitle = getSettingWithDefault(SETTING_KEYS.SITE_TITLE)
  const headerStyle = getSettingWithDefault(SETTING_KEYS.UI_HEADER_STYLE)
  const primaryColor = getSettingWithDefault(SETTING_KEYS.UI_PRIMARY_COLOR)

  return (
    <header 
      className='bg-card'
      style={{ 
        '--header-primary-color': primaryColor,
      } as React.CSSProperties}
    >
      <div className='p-2'>
        <div className="container">
          <div className='flex justify-between items-center gap-2'>
            <Logo />
            <div className='max-w-[500px] flex-1'>
              <CommandSearch />
            </div>
            <div className=' flex items-center gap-2'>
              <Button 
                className='p-2 relative' 
                variant={'ghost'} 
                size={'icon_lg'}
                onClick={openDrawer}
              >
                <MdOutlineShoppingCart className='size-full' />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Button>
              <ThemeSwitch className='size-10'  />
              <AvatarMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default MainHeader