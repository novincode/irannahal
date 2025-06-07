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
  closestCenter,
  UniqueIdentifier,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/card'
import { Button } from '@shadcn/button'
import { Plus, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { updateMenuItemsOrder } from '@actions/menu/update'
import type { MenuWithItems, MenuItemWithChildren, MenuItemOrderUpdate } from '@actions/menu/types'
import MenuItemForm from './MenuItemForm'
import SortableMenuItem from './SortableMenuItem'
import { flattenMenuItems, buildHierarchy } from './menuUtils'

interface MenuEditorProps {
  menu: MenuWithItems
}

export default function MenuEditor({ menu }: MenuEditorProps) {
  const [items, setItems] = useState<MenuItemWithChildren[]>(menu.items)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItemWithChildren | null>(null)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [isSaving, setIsSaving] = useState(false)

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

  const findContainer = useCallback((id: UniqueIdentifier): string | null => {
    // Check if the id is a top-level item (root container)
    if (items.find(item => item.id === id && !item.parentId)) {
      return 'root'
    }
    
    // Find which parent container this item belongs to
    for (const item of flatItems) {
      if (item.children.find(child => child.id === id)) {
        return item.id
      }
    }
    
    return null
  }, [items, flatItems])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find containers
    const activeContainer = findContainer(activeId)
    const overContainer = findContainer(overId) || 'root'

    if (activeContainer === overContainer) return

    // Moving between containers
    setItems(prevItems => {
      const activeItem = flatItems.find(item => item.id === activeId)
      if (!activeItem) return prevItems

      // Remove from old container and add to new container
      const newParentId = overContainer === 'root' ? null : overContainer
      
      const updatedFlatItems = flatItems.map(item => {
        if (item.id === activeId) {
          return { ...item, parentId: newParentId }
        }
        return item
      })

      return buildHierarchy(updatedFlatItems)
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    const activeContainer = findContainer(activeId)
    const overContainer = findContainer(overId) || 'root'

    if (activeContainer === overContainer) {
      // Reordering within the same container
      if (activeContainer === 'root') {
        const topLevelItems = items.filter(item => !item.parentId)
        const oldIndex = topLevelItems.findIndex(item => item.id === activeId)
        const newIndex = topLevelItems.findIndex(item => item.id === overId)
        
        if (oldIndex !== newIndex) {
          const reorderedTopLevel = arrayMove(topLevelItems, oldIndex, newIndex)
          const otherItems = items.filter(item => item.parentId)
          setItems([...reorderedTopLevel, ...otherItems])
        }
      } else {
        // Reordering within a parent's children
        const parentItem = flatItems.find(item => item.id === activeContainer)
        if (parentItem) {
          const oldIndex = parentItem.children.findIndex(item => item.id === activeId)
          const newIndex = parentItem.children.findIndex(item => item.id === overId)
          
          if (oldIndex !== newIndex) {
            const reorderedChildren = arrayMove(parentItem.children, oldIndex, newIndex)
            
            setItems(prevItems => {
              const updatedFlatItems = flatItems.map(item => {
                if (item.id === activeContainer) {
                  return { ...item, children: reorderedChildren }
                }
                return item
              })
              return buildHierarchy(updatedFlatItems)
            })
          }
        }
      }
    }

    setActiveId(null)
  }

  const handleSaveOrder = async () => {
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
  }

  const handleItemCreated = (newItem: MenuItemWithChildren) => {
    setItems(prevItems => buildHierarchy([...flattenMenuItems(prevItems), newItem]))
    setShowForm(false)
  }

  const handleItemUpdated = (updatedItem: MenuItemWithChildren) => {
    setItems(prevItems => {
      const flatList = flattenMenuItems(prevItems).map(item =>
        item.id === updatedItem.id ? updatedItem : item
      )
      return buildHierarchy(flatList)
    })
    setEditingItem(null)
  }

  const handleItemDeleted = (deletedItemId: string) => {
    setItems(prevItems => {
      const flatList = flattenMenuItems(prevItems).filter(item => item.id !== deletedItemId)
      return buildHierarchy(flatList)
    })
    setEditingItem(null)
  }

  const activeItem = activeId ? flatItems.find(item => item.id === activeId) : null

  const renderMenuLevel = (levelItems: MenuItemWithChildren[], depth = 0) => {
    const itemIds = levelItems.map(item => item.id)
    
    return (
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className={`space-y-2 ${depth > 0 ? 'ml-8 pl-4 border-l-2 border-muted' : ''}`}>
          {levelItems.map((item) => (
            <div key={item.id}>
              <SortableMenuItem
                item={item}
                depth={depth}
                onEdit={setEditingItem}
                onDelete={handleItemDeleted}
              />
              {item.children.length > 0 && renderMenuLevel(item.children, depth + 1)}
            </div>
          ))}
        </div>
      </SortableContext>
    )
  }

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Builder */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>ساختار منو</CardTitle>
            </CardHeader>
            <CardContent>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                {items.length > 0 ? (
                  renderMenuLevel(items.filter(item => !item.parentId))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      هنوز آیتمی به منو اضافه نشده است.
                    </p>
                  </div>
                )}

                <DragOverlay>
                  {activeItem ? (
                    <SortableMenuItem
                      item={activeItem}
                      depth={0}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      isDragging
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            </CardContent>
          </Card>
        </div>

        {/* Form Panel */}
        <div className="lg:col-span-1">
          {(showForm || editingItem) && (
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
          )}
        </div>
      </div>
    </div>
  )
}
