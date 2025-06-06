"use client";

import React, { useState, useMemo } from "react";
import {
  DndContext,
  DragStartEvent,
  DragEndEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Button } from "@ui/components/ui/button";
import { Badge } from "@ui/components/ui/badge";
import { Save, Plus, RefreshCw } from "lucide-react";
import { SortableMenuItem } from "./SortableMenuItemSimple";
import { MenuItemEditor } from "./MenuItemEditor";
import type { MenuItemWithChildren, MenuItemFormData } from "@actions/menu";

interface MenuBuilderProps {
  menuId: string;
  menuItems: MenuItemWithChildren[];
  onMenuItemsChange: (items: MenuItemWithChildren[]) => void;
  onAddItem: () => void;
  onEditItem: (item: MenuItemWithChildren) => void;
  onDeleteItem: (itemId: string) => void;
  isLoading?: boolean;
}

export function MenuBuilder({
  menuId,
  menuItems,
  onMenuItemsChange,
  onAddItem,
  onEditItem,
  onDeleteItem,
  isLoading = false,
}: MenuBuilderProps) {
  const [activeItem, setActiveItem] = useState<MenuItemWithChildren | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Menu item dialog states
  const [showItemEditor, setShowItemEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemWithChildren | null>(null);

  // Configure drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Get all item IDs for sortable context (flat array of all items)
  const getAllItemIds = useMemo(() => {
    const ids: string[] = [];
    const traverse = (items: MenuItemWithChildren[]) => {
      items.forEach(item => {
        ids.push(item.id);
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        }
      });
    };
    traverse(menuItems);
    return ids;
  }, [menuItems]);

  // Find item by ID anywhere in the tree
  const findItem = (items: MenuItemWithChildren[], id: string): MenuItemWithChildren | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItem(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Find parent of an item
  const findParent = (items: MenuItemWithChildren[], childId: string): { parent: MenuItemWithChildren | null, index: number } => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.children) {
        for (let j = 0; j < item.children.length; j++) {
          if (item.children[j].id === childId) {
            return { parent: item, index: j };
          }
        }
        const result = findParent(item.children, childId);
        if (result.parent) return result;
      }
    }
    return { parent: null, index: -1 };
  };

  // Remove item from tree
  const removeItem = (items: MenuItemWithChildren[], itemId: string): MenuItemWithChildren[] => {
    return items.filter(item => {
      if (item.id === itemId) return false;
      if (item.children) {
        item.children = removeItem(item.children, itemId);
      }
      return true;
    });
  };

  // Insert item at specific position
  const insertItem = (items: MenuItemWithChildren[], item: MenuItemWithChildren, parentId: string | null, index: number): MenuItemWithChildren[] => {
    if (!parentId) {
      // Insert at root level
      const newItems = [...items];
      newItems.splice(index, 0, item);
      return newItems;
    } else {
      // Insert as child
      return items.map(i => {
        if (i.id === parentId) {
          const newChildren = [...(i.children || [])];
          newChildren.splice(index, 0, item);
          return { ...i, children: newChildren };
        }
        if (i.children) {
          return { ...i, children: insertItem(i.children, item, parentId, index) };
        }
        return i;
      });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const item = findItem(menuItems, event.active.id as string);
    setActiveItem(item);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveItem(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    
    const activeItem = findItem(menuItems, activeId);
    const overItem = findItem(menuItems, overId);
    
    if (!activeItem || !overItem) {
      setActiveItem(null);
      return;
    }

    // Check if dropping on descendant (prevent infinite loops)
    const isDescendant = (parent: MenuItemWithChildren, targetId: string): boolean => {
      if (parent.id === targetId) return true;
      if (!parent.children) return false;
      return parent.children.some(child => isDescendant(child, targetId));
    };

    if (isDescendant(activeItem, overId)) {
      setActiveItem(null);
      return;
    }

    // Simple nesting logic: if dropping on another item, make it a child
    let newItems = [...menuItems];
    
    // Remove active item from its current position
    newItems = removeItem(newItems, activeId);
    
    // Make it a child of the target item
    newItems = insertItem(newItems, activeItem, overId, 0);
    
    onMenuItemsChange(newItems);
    setHasUnsavedChanges(true);
    setActiveItem(null);
  };

  const saveChanges = async () => {
    setIsUpdating(true);
    try {
      // Here you would call your API to save the menu structure
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save changes:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle add new item
  const handleAddNewItem = () => {
    setEditingItem(null);
    setShowItemEditor(true);
  };

  // Handle edit existing item
  const handleEditExistingItem = (item: MenuItemWithChildren) => {
    console.log('Edit menu item requested:', item);
    setEditingItem(item);
    setShowItemEditor(true);
  };

  // Handle save menu item (create or update)
  const handleSaveMenuItem = async (data: MenuItemFormData) => {
    try {
      if (editingItem) {
        // Update existing item
        const updateItems = (items: MenuItemWithChildren[]): MenuItemWithChildren[] => {
          return items.map(item => {
            if (item.id === editingItem.id) {
              return { ...item, ...data };
            }
            if (item.children) {
              return { ...item, children: updateItems(item.children) };
            }
            return item;
          });
        };
        onMenuItemsChange(updateItems(menuItems));
      } else {
        // Create new item
        const newItem: MenuItemWithChildren = {
          id: `temp-${Date.now()}`, // This should be generated by your API
          menuId,
          parentId: null,
          order: menuItems.length,
          children: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          label: data.label,
          type: data.type,
          url: data.url || null,
          target: data.target || null,
          rel: data.rel || null,
          linkedResourceId: data.linkedResourceId || null,
          cssClasses: data.cssClasses || null,
          isVisible: data.isVisible ?? true,
        };
        onMenuItemsChange([...menuItems, newItem]);
      }
      setShowItemEditor(false);
      setEditingItem(null);
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('Failed to save menu item:', error);
    }
  };

  // Handle delete menu item
  const handleDeleteMenuItem = (itemId: string) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این آیتم منو را حذف کنید؟')) {
      const newItems = removeItem(menuItems, itemId);
      onMenuItemsChange(newItems);
      setHasUnsavedChanges(true);
    }
  };

  const renderDragOverlay = () => {
    if (!activeItem) return null;

    return (
      <div className="flex items-center gap-3 p-3 bg-background border rounded-lg shadow-lg opacity-90">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm truncate">{activeItem.label}</span>
            <Badge variant="secondary" className="text-xs">
              {activeItem.type}
            </Badge>
          </div>
          {activeItem.url && (
            <div className="text-xs text-muted-foreground truncate">
              {activeItem.url}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">آیتم‌های منو</h3>
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              تغییرات ذخیره نشده
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleAddNewItem}
            disabled={isLoading || isUpdating}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            افزودن آیتم
          </Button>
          {hasUnsavedChanges && (
            <Button
              onClick={saveChanges}
              disabled={isLoading || isUpdating}
              size="sm"
              variant="default"
            >
              {isUpdating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              ذخیره تغییرات
            </Button>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>هیچ آیتم منو یافت نشد</p>
            <p className="text-sm mt-1">برای شروع یک آیتم جدید اضافه کنید</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={getAllItemIds} 
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <SortableMenuItem
                    key={item.id}
                    item={item}
                    onEdit={handleEditExistingItem}
                    onDelete={handleDeleteMenuItem}
                    isLoading={isLoading || isUpdating}
                    depth={0}
                  />
                ))}
              </div>
            </SortableContext>
            
            <DragOverlay>
              {renderDragOverlay()}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Instructions */}
      <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
        <p className="font-medium mb-1">نحوه استفاده:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>آیتم‌ها را با کشیدن و رها کردن مرتب کنید</li>
          <li>آیتم‌ها را روی یکدیگر رها کنید تا زیرمنو ایجاد شود</li>
          <li>از دکمه‌های ویرایش و حذف برای مدیریت آیتم‌ها استفاده کنید</li>
        </ul>
      </div>

      {/* Menu Item Editor Dialog */}
      {showItemEditor && (
        <MenuItemEditor
          item={editingItem}
          onSave={handleSaveMenuItem}
          onCancel={() => {
            setShowItemEditor(false);
            setEditingItem(null);
          }}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
}