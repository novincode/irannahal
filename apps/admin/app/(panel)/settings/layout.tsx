import { Metadata } from "next"
import { Suspense } from "react"
import { SettingsNavigation } from "./SettingsNavigation"
import { Loader2 } from "lucide-react"

export const metadata: Metadata = {
  title: "تنظیمات",
  description: "مدیریت تنظیمات سایت"
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">تنظیمات</h2>
      </div>
      
      <div className="space-y-6">
        <SettingsNavigation />
        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="mr-2">در حال بارگذاری...</span>
          </div>
        }>
          {children}
        </Suspense>
      </div>
    </div>
  )
}
