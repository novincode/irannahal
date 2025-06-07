'use client'

import React, { useState, useCallback, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  UniqueIdentifier,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/card'
import { Button } from '@shadcn/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@shadcn/drawer'
import { Plus, Save, ArrowLeft, Target } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@ui/lib/utils'
import { updateMenuItemsOrder } from '@actions/menu/update'
import type { MenuWithItems, MenuItemWithChildren, MenuItemOrderUpdate } from '@actions/menu/types'
import MenuItemForm from './MenuItemForm'
import SortableMenuItem from './SortableMenuItem'
import DroppableContainer from './DroppableContainer'
import { flattenMenuItems, buildHierarchy, canMoveToParent } from './menuUtils'

// Root Drop Zone Component for easier dropping into root
function RootDropZone({ 
  id, 
  children, 
  position = 'top' 
}: { 
  id: string
  children?: React.ReactNode
  position?: 'top' | 'bottom'
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition-all duration-200 rounded-lg border-2 border-dashed",
        isOver 
          ? "border-primary bg-primary/10 shadow-lg" 
          : "border-muted-foreground/20 hover:border-muted-foreground/40",
        position === 'top' ? 'mb-4' : 'mt-4',
        children ? 'min-h-[120px] p-4' : 'h-16'
      )}
    >
      {children || (
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-5 w-5" />
            <span className="text-sm font-medium">
              {isOver ? 'اینجا رها کنید' : `آیتم‌ها را به ${position === 'top' ? 'بالای' : 'پایین'} منو بکشید`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

interface MenuEditorProps {
  menu: MenuWithItems
}

export default function MenuEditor({ menu }: MenuEditorProps) {
  const [items, setItems] = useState<MenuItemWithChildren[]>(menu.items)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItemWithChildren | null>(null)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [openDropZones, setOpenDropZones] = useState<Set<string>>(new Set())

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Flatten items for drag and drop
  const flatItems = useMemo(() => flattenMenuItems(items), [items])

  const toggleCollapse = useCallback((itemId: string) => {
    setCollapsed(prev => {
      const newCollapsed = new Set(prev)
      if (newCollapsed.has(itemId)) {
        newCollapsed.delete(itemId)
      } else {
        newCollapsed.add(itemId)
      }
      return newCollapsed
    })
  }, [])

  const toggleDropZone = useCallback((itemId: string) => {
    setOpenDropZones(prev => {
      const newOpenDropZones = new Set(prev)
      if (newOpenDropZones.has(itemId)) {
        newOpenDropZones.delete(itemId)
      } else {
        newOpenDropZones.add(itemId)
      }
      return newOpenDropZones
    })
  }, [])

  // Remove these helper functions that were causing dependency issues
  // We'll inline the logic in handleDragEnd to avoid circular dependencies

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id)
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Only handle visual feedback here, no state updates to prevent infinite loops
    // All logic moved to handleDragEnd
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const activeId = active.id as string
    const overId = over.id as string

    // Handle root drop zones
    if (overId === 'root-top' || overId === 'root-bottom' || overId === 'root') {
      setItems(prevItems => {
        const allFlatItems = flattenMenuItems(prevItems)
        const activeItem = allFlatItems.find(item => item.id === activeId)
        if (!activeItem) return prevItems

        // Remove from current position and add to root
        const otherItems = allFlatItems.filter(item => item.id !== activeId)
        const rootItems = otherItems.filter(item => !item.parentId)
        const updatedActiveItem = { ...activeItem, parentId: null, order: rootItems.length }
        
        return buildHierarchy([...otherItems, updatedActiveItem])
      })
      return
    }

    // Handle drop zone nesting (when dropping into a specific parent's drop zone)
    if (overId.startsWith('drop-zone-')) {
      const parentId = overId.replace('drop-zone-', '')
      
      setItems(prevItems => {
        const allFlatItems = flattenMenuItems(prevItems)
        const activeItem = allFlatItems.find(item => item.id === activeId)
        if (!activeItem) return prevItems

        // Prevent circular nesting
        if (!canMoveToParent(prevItems, activeId, parentId)) {
          toast.error('نمی‌توان آیتم را به زیرمجموعه خودش منتقل کرد')
          return prevItems
        }

        // Remove from current position and add as child
        const otherItems = allFlatItems.filter(item => item.id !== activeId)
        const parentChildren = otherItems.filter(item => item.parentId === parentId)
        const updatedActiveItem = { ...activeItem, parentId, order: parentChildren.length }
        
        const finalItems = buildHierarchy([...otherItems, updatedActiveItem])
        
        // Close the drop zone after successful drop
        setOpenDropZones(prev => {
          const updated = new Set(prev)
          updated.delete(parentId)
          return updated
        })
        
        toast.success('آیتم با موفقیت جابجا شد')
        return finalItems
      })
      return
    }

    // Handle reordering within the same level (normal DnD Kit behavior)
    setItems(prevItems => {
      const allFlatItems = flattenMenuItems(prevItems)
      const activeItem = allFlatItems.find(item => item.id === activeId)
      const overItem = allFlatItems.find(item => item.id === overId)
      
      if (!activeItem || !overItem) return prevItems
      
      // Only reorder if they're at the same level
      if (activeItem.parentId === overItem.parentId) {
        const siblings = allFlatItems.filter(item => item.parentId === activeItem.parentId)
        const oldIndex = siblings.findIndex(item => item.id === activeId)
        const newIndex = siblings.findIndex(item => item.id === overId)
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedSiblings = arrayMove(siblings, oldIndex, newIndex)
          const otherItems = allFlatItems.filter(item => item.parentId !== activeItem.parentId)
          
          const updatedSiblings = reorderedSiblings.map((item, index) => ({
            ...item,
            order: index
          }))
          
          return buildHierarchy([...otherItems, ...updatedSiblings])
        }
      }
      
      return prevItems
    })
  }, [])

  const handleSaveOrder = useCallback(async () => {
    setIsSaving(true)
    try {
      const orderUpdates: MenuItemOrderUpdate[] = []

      const processItems = (items: MenuItemWithChildren[], parentId: string | null = null) => {
        items.forEach((item, index) => {
          orderUpdates.push({
            id: item.id,
            parentId,
            order: index
          })
          
          if (item.children.length > 0) {
            processItems(item.children, item.id)
          }
        })
      }

      processItems(items)

      const response = await updateMenuItemsOrder({ items: orderUpdates })
      
      if (response.success) {
        toast.success('ترتیب منو با موفقیت ذخیره شد')
      } else {
        toast.error(response.error || 'خطا در ذخیره ترتیب منو')
      }
    } catch (error) {
      toast.error('خطا در ذخیره ترتیب منو')
    } finally {
      setIsSaving(false)
    }
  }, [items])

  const handleItemCreated = useCallback((newItem: MenuItemWithChildren) => {
    setItems(prevItems => buildHierarchy([...flattenMenuItems(prevItems), newItem]))
    setShowForm(false)
  }, [])

  const handleItemUpdated = useCallback((updatedItem: MenuItemWithChildren) => {
    setItems(prevItems => {
      const flatList = flattenMenuItems(prevItems).map(item =>
        item.id === updatedItem.id ? updatedItem : item
      )
      return buildHierarchy(flatList)
    })
    setEditingItem(null)
  }, [])

  const handleItemDeleted = useCallback((deletedItemId: string) => {
    setItems(prevItems => {
      const flatList = flattenMenuItems(prevItems).filter(item => item.id !== deletedItemId)
      return buildHierarchy(flatList)
    })
    setEditingItem(null)
  }, [])

  const handleEditItem = useCallback((item: MenuItemWithChildren) => {
    setEditingItem(item)
  }, [])

  const activeItem = useMemo(() => 
    activeId ? flatItems.find(item => item.id === activeId) : null, 
    [activeId, flatItems]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/menu">
                <ArrowLeft className="h-4 w-4" />
                بازگشت
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">ویرایش منو: {menu.name}</h1>
              <p className="text-muted-foreground mt-1">
                آیتم‌های منو را سازماندهی کنید
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            افزودن آیتم
          </Button>
          <Button
            onClick={handleSaveOrder}
            disabled={isSaving}
            variant="default"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'در حال ذخیره...' : 'ذخیره ترتیب'}
          </Button>
        </div>
      </div>

      {/* Menu Builder */}
      <Card>
        <CardHeader>
          <CardTitle>ساختار منو</CardTitle>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {/* Top Root Drop Zone */}
            <RootDropZone id="root-top" position="top" />

            {items.length > 0 ? (
              <DroppableContainer
                id="root"
                items={items.filter(item => !item.parentId)}
                depth={0}
                onEdit={handleEditItem}
                onDelete={handleItemDeleted}
                onToggleCollapse={toggleCollapse}
                onToggleDropZone={toggleDropZone}
                collapsed={collapsed}
                openDropZones={openDropZones}
              />
            ) : (
              <RootDropZone id="root">
                <div className="text-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <Target className="h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      هنوز آیتمی به منو اضافه نشده است.
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                      آیتم‌ها را اینجا بکشید یا دکمه افزودن آیتم را کلیک کنید
                    </p>
                  </div>
                </div>
              </RootDropZone>
            )}

            {/* Bottom Root Drop Zone */}
            {items.length > 0 && <RootDropZone id="root-bottom" position="bottom" />}

            <DragOverlay>
              {activeItem ? (
                <SortableMenuItem
                  item={activeItem}
                  depth={0}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onToggleCollapse={() => {}}
                  isCollapsed={false}
                  isDragging
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </CardContent>
      </Card>

      {/* Form Drawer - RTL positioned on the right */}
      <Drawer 
        direction="left" 
        open={showForm || !!editingItem} 
        onOpenChange={(open) => {
          if (!open) {
            setShowForm(false)
            setEditingItem(null)
          }
        }}
      >
        <DrawerContent className="h-full w-[600px] mt-0 rounded-none">
          <DrawerHeader className="border-b">
            <DrawerTitle className="text-right">
              {editingItem ? 'ویرایش آیتم منو' : 'افزودن آیتم جدید'}
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <MenuItemForm
              menuId={menu.id}
              editingItem={editingItem}
              onItemCreated={handleItemCreated}
              onItemUpdated={handleItemUpdated}
              onClose={() => {
                setShowForm(false)
                setEditingItem(null)
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
