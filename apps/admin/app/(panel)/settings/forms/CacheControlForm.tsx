'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/card'
import { Button } from '@shadcn/button'
import { Badge } from '@ui/components/ui/badge'
import { Separator } from '@shadcn/separator'
import { RefreshCw, Database, Menu, Settings, Zap, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { invalidateSettingsCache } from '@actions/settings'
import { invalidateAllMenuCaches } from '@actions/menu/invalidate'
import { revalidateSettingsPages, revalidateMenuPages } from '@actions/revalidate'
import { dispatchGlobalRefresh } from '@data/globalRefresh'
import { useSettingsStore } from '@data/useSettingsStore'

interface CacheOperation {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: 'settings' | 'menu' | 'pages' | 'global'
  action: () => Promise<void>
}

const CacheControlForm: React.FC = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [lastRefresh, setLastRefresh] = useState<Record<string, Date>>({})
  const { forceRefresh } = useSettingsStore()

  const setLoading = (id: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [id]: loading }))
  }

  const setRefreshTime = (id: string) => {
    setLastRefresh(prev => ({ ...prev, [id]: new Date() }))
  }

  const cacheOperations: CacheOperation[] = [
    // Settings Cache Operations
    {
      id: 'settings-cache',
      name: 'پاک‌سازی کش تنظیمات',
      description: 'پاک‌سازی کش سرور برای تمام تنظیمات سایت',
      icon: Settings,
      category: 'settings',
      action: async () => {
        setLoading('settings-cache', true)
        try {
          const result = await invalidateSettingsCache()
          if (result.success) {
            // Explicitly revalidate pages after cache invalidation
            await revalidateSettingsPages()
            setRefreshTime('settings-cache')
            toast.success('کش تنظیمات با موفقیت پاک شد')
          } else {
            throw new Error(result.error || 'خطای نامشخص')
          }
        } catch (error) {
          toast.error(`خطا در پاک‌سازی کش تنظیمات: ${error instanceof Error ? error.message : 'خطای نامشخص'}`)
          throw error
        } finally {
          setLoading('settings-cache', false)
        }
      }
    },
    {
      id: 'settings-store',
      name: 'بازنشانی استور تنظیمات',
      description: 'بازنشانی استور کلاینت و دریافت مجدد تنظیمات',
      icon: RefreshCw,
      category: 'settings',
      action: async () => {
        setLoading('settings-store', true)
        try {
          await forceRefresh()
          setRefreshTime('settings-store')
          toast.success('استور تنظیمات با موفقیت بازنشانی شد')
        } catch (error) {
          toast.error(`خطا در بازنشانی استور تنظیمات: ${error instanceof Error ? error.message : 'خطای نامشخص'}`)
          throw error
        } finally {
          setLoading('settings-store', false)
        }
      }
    },
    {
      id: 'settings-pages',
      name: 'اعتبارسنجی مجدد صفحات تنظیمات',
      description: 'فراخوانی revalidatePath و revalidateTag برای صفحات مرتبط با تنظیمات',
      icon: Database,
      category: 'pages',
      action: async () => {
        setLoading('settings-pages', true)
        try {
          await revalidateSettingsPages()
          setRefreshTime('settings-pages')
          toast.success('صفحات تنظیمات با موفقیت اعتبارسنجی شدند')
        } catch (error) {
          toast.error(`خطا در اعتبارسنجی صفحات تنظیمات: ${error instanceof Error ? error.message : 'خطای نامشخص'}`)
          throw error
        } finally {
          setLoading('settings-pages', false)
        }
      }
    },

    // Menu Cache Operations
    {
      id: 'menu-cache',
      name: 'پاک‌سازی کش منوها',
      description: 'پاک‌سازی کش سرور برای تمام منوها و آیتم‌های منو',
      icon: Menu,
      category: 'menu',
      action: async () => {
        setLoading('menu-cache', true)
        try {
          const result = await invalidateAllMenuCaches()
          if (result.success) {
            // Explicitly revalidate pages after cache invalidation
            await revalidateMenuPages()
            setRefreshTime('menu-cache')
            toast.success('کش منوها با موفقیت پاک شد')
          } else {
            throw new Error(result.error || 'خطای نامشخص')
          }
        } catch (error) {
          toast.error(`خطا در پاک‌سازی کش منوها: ${error instanceof Error ? error.message : 'خطای نامشخص'}`)
          throw error
        } finally {
          setLoading('menu-cache', false)
        }
      }
    },
    {
      id: 'menu-pages',
      name: 'اعتبارسنجی مجدد صفحات منو',
      description: 'فراخوانی revalidatePath و revalidateTag برای صفحات مرتبط با منو',
      icon: Database,
      category: 'pages',
      action: async () => {
        setLoading('menu-pages', true)
        try {
          await revalidateMenuPages()
          setRefreshTime('menu-pages')
          toast.success('صفحات منو با موفقیت اعتبارسنجی شدند')
        } catch (error) {
          toast.error(`خطا در اعتبارسنجی صفحات منو: ${error instanceof Error ? error.message : 'خطای نامشخص'}`)
          throw error
        } finally {
          setLoading('menu-pages', false)
        }
      }
    },

    // Global Operations
    {
      id: 'global-refresh',
      name: 'رفرش سراسری',
      description: 'ارسال رویداد رفرش سراسری به تمام کامپوننت‌های کلاینت',
      icon: Zap,
      category: 'global',
      action: async () => {
        setLoading('global-refresh', true)
        try {
          dispatchGlobalRefresh('all')
          setRefreshTime('global-refresh')
          toast.success('رویداد رفرش سراسری ارسال شد')
        } catch (error) {
          toast.error(`خطا در ارسال رویداد رفرش سراسری: ${error instanceof Error ? error.message : 'خطای نامشخص'}`)
          throw error
        } finally {
          setLoading('global-refresh', false)
        }
      }
    }
  ]

  const handleOperation = async (operation: CacheOperation) => {
    try {
      await operation.action()
    } catch (error) {
      console.error(`Cache operation failed: ${operation.id}`, error)
    }
  }

  const handleClearAll = async () => {
    setLoading('clear-all', true)
    const operations = cacheOperations.filter(op => op.id !== 'global-refresh')
    
    try {
      toast.info('شروع پاک‌سازی تمام کش‌ها...')
      
      for (const operation of operations) {
        await operation.action()
      }
      
      // Finally dispatch global refresh
      dispatchGlobalRefresh('all')
      setRefreshTime('clear-all')
      
      toast.success('تمام کش‌ها با موفقیت پاک شدند و رفرش سراسری انجام شد')
    } catch (error) {
      toast.error('خطا در پاک‌سازی کامل کش‌ها')
    } finally {
      setLoading('clear-all', false)
    }
  }

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'settings': return 'default'
      case 'menu': return 'secondary'
      case 'pages': return 'outline'
      case 'global': return 'destructive'
      default: return 'default'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'settings': return 'تنظیمات'
      case 'menu': return 'منو'
      case 'pages': return 'صفحات'
      case 'global': return 'سراسری'
      default: return category
    }
  }

  const formatLastRefresh = (date: Date) => {
    return date.toLocaleString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            کنترل کش
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            مدیریت و پاک‌سازی دستی کش‌های سیستم. این ابزار برای دیباگ و حل مشکلات کش مفید است.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleClearAll}
              disabled={loadingStates['clear-all']}
              variant="destructive"
              size="lg"
            >
              {loadingStates['clear-all'] ? (
                <RefreshCw className="h-4 w-4 animate-spin ml-2" />
              ) : (
                <Database className="h-4 w-4 ml-2" />
              )}
              پاک‌سازی تمام کش‌ها
            </Button>
            
            {lastRefresh['clear-all'] && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                آخرین پاک‌سازی کامل: {formatLastRefresh(lastRefresh['clear-all'])}
              </div>
            )}
          </div>

          <Separator />

          {/* Individual Operations */}
          <div className="grid gap-4">
            {cacheOperations.map((operation) => {
              const Icon = operation.icon
              const isLoading = loadingStates[operation.id]
              const lastRefreshTime = lastRefresh[operation.id]

              return (
                <Card key={operation.id} className="relative">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <h4 className="font-medium">{operation.name}</h4>
                          <Badge variant={getCategoryBadgeVariant(operation.category)}>
                            {getCategoryLabel(operation.category)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {operation.description}
                        </p>
                        {lastRefreshTime && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            آخرین اجرا: {formatLastRefresh(lastRefreshTime)}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => handleOperation(operation)}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                      >
                        {isLoading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Separator />

          {/* Help Information */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">راهنمای استفاده</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>کش تنظیمات:</strong> کش سرور تنظیمات را پاک می‌کند</li>
                    <li>• <strong>استور تنظیمات:</strong> داده‌های محلی کلاینت را بازنشانی می‌کند</li>
                    <li>• <strong>کش منوها:</strong> تمام کش‌های مربوط به منو را پاک می‌کند</li>
                    <li>• <strong>اعتبارسنجی صفحات:</strong> Next.js را مجبور به رندر مجدد صفحات می‌کند</li>
                    <li>• <strong>رفرش سراسری:</strong> به همه کامپوننت‌ها دستور رفرش می‌دهد</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-3">
                    💡 اگر تغییرات در سایت نمایش داده نمی‌شوند، ابتدا "پاک‌سازی تمام کش‌ها" را امتحان کنید.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}

export default CacheControlForm
