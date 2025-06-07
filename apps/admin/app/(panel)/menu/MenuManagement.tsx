'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/card'
import { Button } from '@shadcn/button'
import { Input } from '@shadcn/input'
import { Label } from '@shadcn/label'
import { Plus, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { createMenu } from '@actions/menu/create'
import { deleteMenu } from '@actions/menu/delete'
import { toast } from 'sonner'
import type { Menu } from '@actions/menu/types'
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

interface MenuManagementProps {
  initialMenus: Menu[]
}

export default function MenuManagement({ initialMenus }: MenuManagementProps) {
  const [menus, setMenus] = useState<Menu[]>(initialMenus)
  const [newMenuName, setNewMenuName] = useState('')
  const [newMenuSlug, setNewMenuSlug] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMenuName.trim() || !newMenuSlug.trim()) {
      toast.error('نام و نامک منو الزامی است')
      return
    }

    setIsCreating(true)
    try {
      const response = await createMenu({
        name: newMenuName.trim(),
        slug: newMenuSlug.trim(),
      })

      if (response.success) {
        setMenus(prev => [...prev, response.data])
        setNewMenuName('')
        setNewMenuSlug('')
        toast.success('منو با موفقیت ایجاد شد')
      } else {
        toast.error(response.error || 'خطا در ایجاد منو')
      }
    } catch (error) {
      toast.error('خطا در ایجاد منو')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteMenu = async (menuId: string) => {
    try {
      const response = await deleteMenu(menuId)
      if (response.success) {
        setMenus(prev => prev.filter(menu => menu.id !== menuId))
        toast.success('منو با موفقیت حذف شد')
      } else {
        toast.error(response.error || 'خطا در حذف منو')
      }
    } catch (error) {
      toast.error('خطا در حذف منو')
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (name: string) => {
    setNewMenuName(name)
    if (!newMenuSlug) {
      setNewMenuSlug(generateSlug(name))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">مدیریت منوها</h1>
        <p className="text-muted-foreground mt-2">
          منوهای سایت را ایجاد و مدیریت کنید
        </p>
      </div>

      {/* Create New Menu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            ایجاد منو جدید
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateMenu} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="menu-name">نام منو</Label>
              <Input
                id="menu-name"
                placeholder="مثال: منو اصلی"
                value={newMenuName}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu-slug">نامک منو</Label>
              <Input
                id="menu-slug"
                placeholder="menu-main"
                value={newMenuSlug}
                onChange={(e) => setNewMenuSlug(e.target.value)}
                disabled={isCreating}
              />
            </div>
            <div className="flex items-end">
              <Button 
                type="submit" 
                disabled={isCreating || !newMenuName.trim() || !newMenuSlug.trim()}
                className="w-full"
              >
                {isCreating ? 'در حال ایجاد...' : 'ایجاد منو'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing Menus */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menus.map((menu) => (
          <Card key={menu.id} className="group">
            <CardHeader>
              <CardTitle className="text-lg">{menu.name}</CardTitle>
              <p className="text-sm text-muted-foreground">نامک: {menu.slug}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Button asChild className="flex-1">
                  <Link href={`/menu/${menu.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    ویرایش منو
                  </Link>
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>حذف منو</AlertDialogTitle>
                      <AlertDialogDescription>
                        آیا مطمئن هستید که می‌خواهید منو "{menu.name}" را حذف کنید؟
                        این عمل غیرقابل برگشت است و تمام آیتم‌های منو نیز حذف خواهند شد.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>لغو</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteMenu(menu.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        حذف
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {menus.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              هنوز منویی ایجاد نشده است. اولین منو خود را ایجاد کنید.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}