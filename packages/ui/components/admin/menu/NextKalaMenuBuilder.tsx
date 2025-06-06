/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  UniqueIdentifier,
  MeasuringStrategy,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from "@ui/components/ui/button";
import { Save, Plus, RefreshCw } from "lucide-react";
import { Badge } from "@ui/components/ui/badge";

import type { MenuItemWithChildren, MenuItemFormData } from '@actions/menu';
import { 
  createMenuItem as createMenuItemAction,
  updateMenuItem as updateMenuItemAction, 
  deleteMenuItem as deleteMenuItemAction,
  updateMenuItemsOrder
} from "@actions/menu"; // Assuming these are your server actions

import { NextKalaSortableMenuItem, NextKalaSortableMenuItemProps } from './NextKalaSortableMenuItem';
import { NextKalaDroppableSubMenu } from './NextKalaDroppableSubMenu';
import { 
  findItemRecursive, 
  removeItemRecursive, 
  addItemRecursive, 
  getAllTreeItemIds,
  generateUniqueId,
  normalizeTreeStructure,
  FoundItemInfo
} from './nextKalaMenuTreeUtils';
import { MenuItemEditor } from './MenuItemEditor'; // Re-using your existing editor

interface NextKalaMenuBuilderProps {
  menuId: string;
  initialMenuItems: MenuItemWithChildren[];
  // onSave: (items: MenuItemWithChildren[]) => Promise<void>; // Callback to save the whole structure
}

const MAX_DEPTH = 4;

export function NextKalaMenuBuilder({ menuId, initialMenuItems }: NextKalaMenuBuilderProps) {
  const [menuItems, setMenuItems] = useState<MenuItemWithChildren[]>(() => normalizeTreeStructure(initialMenuItems));
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeItemData, setActiveItemData] = useState<MenuItemWithChildren | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [showItemEditor, setShowItemEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemWithChildren | null>(null);
  const [editingParentId, setEditingParentId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // User must drag for 5px before a drag event is initiated
      },
    })
  );

  // Get all item IDs for DndContext, this needs to include all items that can be dragged
  const allFlattenedItemIds = useMemo(() => getAllTreeItemIds(menuItems), [menuItems]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setIsDragging(true);
    setActiveId(event.active.id);
    const found = findItemRecursive(menuItems, event.active.id as string);
    if (found) {
      setActiveItemData(found.item);
    }
  }, [menuItems]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over?.id ?? null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setIsDragging(false);
      setActiveId(null);
      setActiveItemData(null);
      setOverId(null);

      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const activeItemId = active.id as string;
      const overItemId = over.id as string; // This could be a sortable item or a droppable container ID

      const activeItemInfo = findItemRecursive(menuItems, activeItemId);
      if (!activeItemInfo) return;

      // Determine the target parent and index
      let targetParentId: string | null = null;
      let targetIndex: number = 0;
      let newMenuItems = [...menuItems];

      const overData = over.data?.current;
      const overIsDroppableContainer = overData?.type === 'submenu-droppable-area';
      
      // First, remove the active item from its current position
      const { newTree: treeWithoutActiveItem, removedItem } = removeItemRecursive(newMenuItems, activeItemId);
      if (!removedItem) return;
      newMenuItems = treeWithoutActiveItem;

      if (overIsDroppableContainer) {
        // Dropping into a droppable container (NextKalaDroppableSubMenu)
        targetParentId = overData.parentId;
        // If container is empty, index is 0, otherwise append to its items
        const parentInfo = targetParentId ? findItemRecursive(newMenuItems, targetParentId) : null;
        targetIndex = parentInfo?.item.children?.length ?? (targetParentId === null ? newMenuItems.length : 0);
      } else {
        // Dropping onto another sortable item (NextKalaSortableMenuItem)
        const overItemInfo = findItemRecursive(newMenuItems, overItemId);
        if (!overItemInfo) return; // Should not happen if over.id is valid

        // Default: drop above the overItem in the same parent
        targetParentId = overItemInfo.parent?.id ?? null;
        targetIndex = overItemInfo.index;

        // Logic for dropping 'inside' (as a child) could be added here if needed,
        // e.g., by checking mouse position relative to the overItem or specific drop zones on the item.
        // For now, direct nesting is handled by dropping onto NextKalaDroppableSubMenu areas.
      }
      
      // Ensure not exceeding max depth if we are nesting
      const activeItemDepth = activeItemInfo.path.length;
      const targetParentInfo = targetParentId ? findItemRecursive(newMenuItems, targetParentId) : null;
      const targetDepth = targetParentInfo ? targetParentInfo.path.length + 1 : 0;

      if (targetDepth + activeItemDepth > MAX_DEPTH && targetParentId !== activeItemInfo.parent?.id) {
         // If moving to a new parent would exceed max depth, try to place it sibling to the target parent instead
         // This is a fallback, ideally the UI should prevent this more gracefully
         if(targetParentInfo && targetParentInfo.parent){
            targetParentId = targetParentInfo.parent.id;
            targetIndex = targetParentInfo.index + 1;
         } else {
            targetParentId = null; // move to root
            targetIndex = newMenuItems.length;
         }
      }

      newMenuItems = addItemRecursive(newMenuItems, targetParentId, removedItem, targetIndex);
      const normalizedNewItems = normalizeTreeStructure(newMenuItems);
      setMenuItems(normalizedNewItems);
      setHasUnsavedChanges(true);
    },
    [menuItems]
  );

  const handleOpenAddItemEditor = (parentId: string | null) => {
    setEditingItem(null);
    setEditingParentId(parentId);
    setShowItemEditor(true);
  };

  const handleOpenEditItemEditor = (item: MenuItemWithChildren) => {
    setEditingItem(item);
    setEditingParentId(item.parentId ?? null); // parentId should be part of normalized structure
    setShowItemEditor(true);
  };

  const handleSaveMenuItem = async (formData: MenuItemFormData) => {
    setIsLoading(true);
    try {
      let newTree;
      if (editingItem) { // Update existing
        const result = await updateMenuItemAction({ ...formData, id: editingItem.id });
        if (!result.success || !result.data) throw new Error(result.error || 'Failed to update');
        
        const { newTree: treeWithoutOld, removedItem: oldItem } = removeItemRecursive(menuItems, editingItem.id);
        if(!oldItem) throw new Error('Original item not found for update');
        
        const updatedItem = { ...oldItem, ...result.data }; // Make sure children are preserved if not part of form data
        newTree = addItemRecursive(treeWithoutOld, updatedItem.parentId ?? null, updatedItem, findItemRecursive(menuItems, editingItem.id)?.index ?? 0);

      } else { // Create new
        const newItemData: Partial<MenuItemFormData> & { menuId: string; parentId: string | null; order: number } = {
          ...formData,
          menuId: menuId,
          parentId: editingParentId,
          order: 0, // Order will be set by normalizeTreeStructure
        };
        const result = await createMenuItemAction(newItemData as any); // Cast if action expects full MenuItemFormData
        if (!result.success || !result.data) throw new Error(result.error || 'Failed to create');
        const newItemWithChildren: MenuItemWithChildren = { ...result.data, children: [] };
        newTree = addItemRecursive(menuItems, editingParentId, newItemWithChildren);
      }
      const normalized = normalizeTreeStructure(newTree);
      setMenuItems(normalized);
      setHasUnsavedChanges(true);
      setShowItemEditor(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving menu item:", error);
      // Show error to user
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item and all its children?')) return;
    setIsLoading(true);
    try {
      const result = await deleteMenuItemAction(itemId);
      if (!result.success) throw new Error(result.error || 'Failed to delete');
      const { newTree } = removeItemRecursive(menuItems, itemId);
      const normalized = normalizeTreeStructure(newTree);
      setMenuItems(normalized);
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error deleting menu item:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const normalizedItemsToSave = normalizeTreeStructure(menuItems);
      // The action needs to handle a flat list of items with parentId and order
      // or a nested structure. For simplicity, let's assume it can take the normalized structure
      // and figure out the updates, or we create a flat list with parentId/order.
      
      // Example: Flatten for an action that expects {id, parentId, order}[]
      const flatItemsToSave = getAllTreeItemIds(normalizedItemsToSave).map(id => {
        const itemInfo = findItemRecursive(normalizedItemsToSave, id);
        return {
          id: itemInfo!.item.id,
          parentId: itemInfo!.parent?.id ?? null,
          order: itemInfo!.index,
          // ... other properties the action might need like label, url, etc.
          // This part depends heavily on your `updateMenuItemsOrder` action requirements
          label: itemInfo!.item.label,
          url: itemInfo!.item.url,
          type: itemInfo!.item.type,
          target: itemInfo!.item.target,
          rel: itemInfo!.item.rel,
          cssClasses: itemInfo!.item.cssClasses,
          isVisible: itemInfo!.item.isVisible,
          linkedResourceId: itemInfo!.item.linkedResourceId,
        };
      });

      await updateMenuItemsOrder({ items: flatItemsToSave as any }); // Cast if action has specific type
      setHasUnsavedChanges(false);
      // Show success message
    } catch (error) {
      console.error("Error saving menu structure:", error);
      // Show error to user
    } finally {
      setIsLoading(false);
    }
  };

  // Recursive function to render menu items and their children
  const renderSortableMenu = useCallback(
    (itemsToRender: MenuItemWithChildren[], parentContainerId: string, currentDepth: number): React.ReactNode => {
      return (
        <NextKalaDroppableSubMenu
          id={parentContainerId} // ID for the droppable area (e.g., parent item ID or 'root')
          items={itemsToRender}
          depth={currentDepth}
          renderChildren={renderSortableMenu} // Pass self for recursion
          onEditItem={handleOpenEditItemEditor}
          onDeleteItem={handleDeleteItem}
          onAddChildItem={() => handleOpenAddItemEditor(parentContainerId === 'root' ? null : parentContainerId)}
          maxDepth={MAX_DEPTH}
          isLoading={isLoading}
        />
      );
    },
    [isLoading] // Dependencies for useCallback
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter} // Experiment with other collision detection strategies if needed
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }} // Important for dynamic droppables
    >
      <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Menu Structure</h2>
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Unsaved Changes
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleOpenAddItemEditor(null)} // Add to root
              disabled={isLoading}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Root Item
            </Button>
            {hasUnsavedChanges && (
              <Button
                onClick={handleSaveChanges}
                disabled={isLoading}
                size="sm"
                variant="default"
              >
                {isLoading && activeId === null ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            )}
          </div>
        </div>

        {menuItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-background p-6 rounded-md border border-dashed">
            <p className="text-lg font-medium">No menu items yet.</p>
            <p className="text-sm mt-1">Click "Add Root Item" to start building your menu.</p>
          </div>
        ) : (
          <div className="bg-background p-1 rounded-md border min-h-[50px]">
            {renderSortableMenu(menuItems, 'root', 0)}
          </div>
        )}
        
        <DragOverlay dropAnimation={null}>
          {activeId && activeItemData ? (
            <NextKalaSortableMenuItem
              item={activeItemData}
              depth={findItemRecursive(menuItems, activeId as string)?.path.length ?? 0}
              isOverlay={true}
              onEditItem={() => {}} // No-op for overlay
              onDeleteItem={() => {}} // No-op for overlay
              onAddChildItem={() => {}} // No-op for overlay
              renderChildren={() => null} // No children in overlay
              isLoading={isLoading}
            />
          ) : null}
        </DragOverlay>
      </div>

      {showItemEditor && (
        <MenuItemEditor
          item={editingItem}
          // Provide a way to suggest parent if creating a child, or pass parentId directly
          // parentId={editingParentId} // Your MenuItemEditor might need this
          onSave={handleSaveMenuItem}
          onCancel={() => {
            setShowItemEditor(false);
            setEditingItem(null);
            setEditingParentId(null);
          }}
          isLoading={isLoading}
        />
      )}
    </DndContext>
  );
}
