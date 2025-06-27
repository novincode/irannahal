'use client'
import { useState, useCallback, useMemo } from 'react'
import { isValidIranianPhone, formatPhoneNumber } from '@actions/auth/utils'

export function usePhoneInput(initialValue = '') {
  const [value, setValue] = useState(initialValue)

  // Memoize validation to avoid recalculation
  const isValid = useMemo(() => isValidIranianPhone(value), [value])

  const handleChange = useCallback((newValue: string) => {
    // Remove all non-digit characters except +
    const cleaned = newValue.replace(/[^\d+]/g, '')
    setValue(cleaned)
  }, [])

  const getFormattedValue = useCallback(() => {
    return formatPhoneNumber(value)
  }, [value])

  const getDisplayValue = useCallback(() => {
    // Add formatting for display (e.g., 0912 345 6789)
    if (value.length > 4) {
      return value.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3')
    }
    return value
  }, [value])

  const reset = useCallback(() => {
    setValue('')
  }, [])

  return {
    value,
    isValid,
    handleChange,
    getFormattedValue,
    getDisplayValue,
    reset,
  }
}
