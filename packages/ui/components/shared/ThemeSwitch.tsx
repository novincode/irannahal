"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@shadcn/button"
import { cn } from "@ui/lib/utils"

export interface ThemeSwitchProps {
  size?: 'sm' | 'md' | 'lg' | number | string
  className?: string
}

export default function ThemeSwitch({ size = 'md', className }: ThemeSwitchProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Render nothing until mounted to avoid hydration mismatch
    return null
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon_lg"
      aria-label="Toggle theme"
      className={cn('p-2', getSizeClass(size), className)}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      style={typeof size === 'number' || typeof size === 'string' ? { width: size, height: size } : undefined}
    >
      {isDark ? (
        <Moon className="size-full" />
      ) : (
        <Sun className="size-full" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

function getSizeClass(size: ThemeSwitchProps['size']) {
  if (size === 'sm') return 'w-7 h-7'
  if (size === 'md') return 'w-9 h-9'
  if (size === 'lg') return 'w-12 h-12'
  return ''
}
