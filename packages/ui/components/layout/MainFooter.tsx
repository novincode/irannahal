import React from 'react'
import { Button } from '@shadcn/button'
import { useSettingsStore } from '@data/useSettingsStore'
import { SETTING_KEYS } from '@actions/settings/types'

const MainFooter = () => {
  const { getSettingWithDefault } = useSettingsStore()
  const siteTitle = getSettingWithDefault(SETTING_KEYS.SITE_TITLE)
  const siteDescription = getSettingWithDefault(SETTING_KEYS.SITE_DESCRIPTION)
  return (
    <footer className="border-t border-border mt-8 bg-card text-foreground text-sm" dir="rtl">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
          {/* درباره ما */}
          <div>
            <h3 className="font-bold mb-2">درباره ما</h3>
            <p className="text-muted-foreground">{siteDescription}</p>
          </div>
          {/* دسترسی سریع */}
          <div>
            <h3 className="font-bold mb-2">دسترسی سریع</h3>
            <div className="flex flex-col gap-2 items-start">
              <Button variant="link" className="p-0 h-auto text-sm" asChild>
                <a href="/">خانه</a>
              </Button>
              <Button variant="link" className="p-0 h-auto text-sm" asChild>
                <a href="/products">محصولات</a>
              </Button>
              <Button variant="link" className="p-0 h-auto text-sm" asChild>
                <a href="/about">درباره ما</a>
              </Button>
              <Button variant="link" className="p-0 h-auto text-sm" asChild>
                <a href="/contact">تماس با ما</a>
              </Button>
            </div>
          </div>
          {/* نماد اعتماد */}
          <div>
            <h3 className="font-bold mb-2">نماد اعتماد</h3>
            <div className="flex justify-center md:justify-end">
              <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                نماد
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        <span>© 2025</span> &nbsp;|&nbsp; ساخته شده با <span className="text-pink-500">♥</span> در نهالتو
      </div>
    </footer>
  )
}

export default MainFooter