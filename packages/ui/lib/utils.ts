import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Price formatting utility
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
}

// Date formatting utilities
export function formatDate(date: Date | string | null, pattern: string = 'dd MMMM yyyy'): string {
  if (!date) return '-'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, pattern, { locale: faIR })
}

export function formatDateTime(date: Date | string | null): string {
  return formatDate(date, 'dd MMMM yyyy - HH:mm')
}

export function formatShortDate(date: Date | string | null): string {
  return formatDate(date, 'dd/MM/yyyy')
}

export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return '-'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'چند لحظه پیش'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} دقیقه پیش`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ساعت پیش`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} روز پیش`
  
  return formatDate(date)
}
