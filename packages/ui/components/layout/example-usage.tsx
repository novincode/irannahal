// Example: How to use the new Header with SettingsProvider
// You can use this pattern in your app layout

import { SettingsProvider } from '@ui/components/providers'
import Header from '@ui/components/layout/Header'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <div className="min-h-screen">
        {/* Complete header with main header + navigation */}
        <Header />
        
        {/* Or just main header without navigation */}
        {/* <Header showNavigation={false} /> */}
        
        <main>{children}</main>
      </div>
    </SettingsProvider>
  )
}

// Settings are now available anywhere in your app via:
// const { getSetting, getSettingWithDefault } = useSettingsStore()
