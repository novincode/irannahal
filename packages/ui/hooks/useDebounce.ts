import { useRef, useState, useEffect } from "react"
import { set } from "zod"

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const handler = useRef<NodeJS.Timeout>(setTimeout(() => {}, 0))

  useEffect(() => {
    if (handler.current) clearTimeout(handler.current)
    handler.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      if (handler.current) clearTimeout(handler.current)
    }
  }, [value, delay])

  return debouncedValue
}
