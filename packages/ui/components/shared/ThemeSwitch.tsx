"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@shadcn/button"

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon_lg"
        aria-label="Toggle theme"
        className="p-2"
        disabled
      >
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const isDark = theme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon_lg"
      aria-label="Toggle theme"
      className="p-2"
      onClick={() => setTheme(isDark ? "light" : "dark")}
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
