'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/card'
import { Button } from '@shadcn/button'
import { Input } from '@shadcn/input'
import { Switch } from '@shadcn/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shadcn/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@shadcn/form'
import { X, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { menuCacheOperations, cachedGetLinkableResources } from '@actions/menu'
import { menuItemFormSchema, type MenuItemFormData } from '@actions/menu/formSchema'
import type { MenuItemWithChildren, GroupedLinkableResources } from '@actions/menu/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@shadcn/alert-dialog'

interface MenuItemFormProps {
  menuId: string
  editingItem?: MenuItemWithChildren | null
  onItemCreated: (item: MenuItemWithChildren) => void
  onItemUpdated: (item: MenuItemWithChildren) => void
  onItemDeleted: (itemId: string) => void
  onClose: () => void
}

const MENU_ITEM_TYPES = [
  { value: 'custom', label: 'سفارشی' },
  { value: 'page', label: 'صفحه' },
  { value: 'category', label: 'دسته‌بندی' },
  { value: 'product', label: 'محصول' },
  { value: 'tag', label: 'برچسب' },
  { value: 'external', label: 'لینک خارجی' },
]

const TARGET_OPTIONS = [
  { value: '_self', label: 'همان صفحه' },
  { value: '_blank', label: 'صفحه جدید' },
  { value: '_parent', label: 'فریم والد' },
  { value: '_top', label: 'فریم اصلی' },
]

export default function MenuItemForm({
  menuId,
  editingItem,
  onItemCreated,
  onItemUpdated,
  onItemDeleted,
  onClose
}: MenuItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [linkableResources, setLinkableResources] = useState<GroupedLinkableResources | null>(null)
  const [selectedType, setSelectedType] = useState<string>('')

  const isEditing = !!editingItem

  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      label: '',
      type: 'custom' as const,
      url: '',
      target: '_self' as const,
      rel: '',
      linkedResourceId: '',
      cssClasses: '',
      isVisible: true,
    },
  })

  const watchedType = form.watch('type')

  useEffect(() => {
    if (editingItem) {
      form.reset({
        label: editingItem.label || '',
        type: (editingItem.type || 'custom') as MenuItemFormData['type'],
        url: editingItem.url || '',
        target: (editingItem.target || '_self') as MenuItemFormData['target'],
        rel: editingItem.rel || '',
        linkedResourceId: editingItem.linkedResourceId || '',
        cssClasses: editingItem.cssClasses || '',
        isVisible: editingItem.isVisible ?? true,
      })
      setSelectedType(editingItem.type || 'custom')
    }
  }, [editingItem, form])

  useEffect(() => {
    setSelectedType(watchedType)
  }, [watchedType])

  // Load linkable resources when type changes to a resource type
  useEffect(() => {
    if (['page', 'category', 'product', 'tag'].includes(selectedType) && !linkableResources) {
      loadLinkableResources()
    }
  }, [selectedType, linkableResources])

  const loadLinkableResources = async () => {
    try {
      const resources = await cachedGetLinkableResources()
      setLinkableResources(resources)
    } catch (error) {
      console.error('Failed to load linkable resources:', error)
    }
  }

  const onSubmit = async (data: MenuItemFormData) => {
    setIsSubmitting(true)
    try {
      if (isEditing && editingItem) {
        const updatedItem = await menuCacheOperations.updateMenuItem({
          ...data,
          id: editingItem.id,
        })
        
        onItemUpdated({ ...editingItem, ...updatedItem, children: editingItem.children })
        toast.success('آیتم منو با موفقیت به‌روزرسانی شد')
      } else {
        const newItem = await menuCacheOperations.createMenuItem({
          ...data,
          menuId,
        })
        
        onItemCreated({ ...newItem, children: [] })
        toast.success('آیتم منو با موفقیت ایجاد شد')
        form.reset()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'خطای غیرمنتظره رخ داد')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!editingItem) return
    
    setIsDeleting(true)
    try {
      await menuCacheOperations.deleteMenuItem(editingItem.id)
      toast.success('آیتم منو با موفقیت حذف شد')
      onItemDeleted(editingItem.id)
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'خطا در حذف آیتم منو')
    } finally {
      setIsDeleting(false)
    }
  }

  const generateUrl = (resourceType: string, resourceId: string) => {
    const urlMap = {
      page: `/pages/${resourceId}`,
      category: `/categories/${resourceId}`,
      product: `/products/${resourceId}`,
      tag: `/tags/${resourceId}`,
    }
    return urlMap[resourceType as keyof typeof urlMap] || ''
  }

  const handleResourceSelect = (resourceId: string) => {
    form.setValue('linkedResourceId', resourceId)
    
    // Auto-generate URL if it's empty
    if (!form.getValues('url') && selectedType !== 'external') {
      const url = generateUrl(selectedType, resourceId)
      form.setValue('url', url)
    }
    
    // Auto-set label if it's empty
    if (!form.getValues('label') && linkableResources) {
      const resource = Object.values(linkableResources)
        .flat()
        .find(r => r.id === resourceId)
      
      if (resource) {
        form.setValue('label', resource.title)
      }
    }
  }

  const renderResourceSelector = () => {
    if (!['page', 'category', 'product', 'tag'].includes(selectedType) || !linkableResources) {
      return null
    }

    const resources = linkableResources[selectedType as keyof GroupedLinkableResources] || []

    if (resources.length === 0) {
      return (
        <div className="text-sm text-muted-foreground">
          هیچ {MENU_ITEM_TYPES.find(t => t.value === selectedType)?.label} موجود نیست
        </div>
      )
    }

    return (
      <FormField
        control={form.control}
        name="linkedResourceId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>انتخاب {MENU_ITEM_TYPES.find(t => t.value === selectedType)?.label}</FormLabel>
            <Select onValueChange={handleResourceSelect} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={`انتخاب ${MENU_ITEM_TYPES.find(t => t.value === selectedType)?.label}`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {resources.map((resource) => (
                  <SelectItem key={resource.id} value={resource.id}>
                    <div className="flex flex-col">
                      <span>{resource.title}</span>
                      {resource.slug && (
                        <span className="text-xs text-muted-foreground">/{resource.slug}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">
          {isEditing ? 'ویرایش آیتم منو' : 'افزودن آیتم جدید'}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Label */}
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>برچسب</FormLabel>
                  <FormControl>
                    <Input placeholder="برچسب آیتم منو" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب نوع" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MENU_ITEM_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Resource Selector */}
            {renderResourceSelector()}

            {/* URL */}
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>آدرس (URL)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={selectedType === 'external' ? 'https://example.com' : '/relative-path'} 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    {selectedType === 'external' 
                      ? 'آدرس کامل لینک خارجی وارد کنید'
                      : 'آدرس نسبی یا کامل صفحه را وارد کنید'
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Target */}
            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>هدف (Target)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TARGET_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* REL attribute */}
            <FormField
              control={form.control}
              name="rel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ویژگی Rel</FormLabel>
                  <FormControl>
                    <Input placeholder="nofollow, noopener, ..." {...field} />
                  </FormControl>
                  <FormDescription>
                    برای SEO و امنیت (مثل nofollow، noopener)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CSS Classes */}
            <FormField
              control={form.control}
              name="cssClasses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>کلاس‌های CSS</FormLabel>
                  <FormControl>
                    <Input placeholder="class1 class2" {...field} />
                  </FormControl>
                  <FormDescription>
                    کلاس‌های CSS برای استایل‌دهی آیتم منو
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Visibility */}
            <FormField
              control={form.control}
              name="isVisible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>نمایش آیتم</FormLabel>
                    <FormDescription>
                      آیا این آیتم در منو نمایش داده شود؟
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting 
                  ? (isEditing ? 'در حال به‌روزرسانی...' : 'در حال ایجاد...') 
                  : (isEditing ? 'به‌روزرسانی' : 'ایجاد')
                }
              </Button>
              
              {isEditing && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeleting}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>حذف آیتم منو</AlertDialogTitle>
                      <AlertDialogDescription>
                        آیا مطمئن هستید که می‌خواهید این آیتم منو را حذف کنید؟
                        این عمل غیرقابل برگشت است.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>لغو</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? 'در حال حذف...' : 'حذف'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
