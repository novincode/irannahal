"use client";

import { useState, useCallback } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { 
  createMenuItem as createMenuItemAction,
  updateMenuItem as updateMenuItemAction, 
  deleteMenuItem as deleteMenuItemAction,
  updateMenuItemsOrder
} from "@actions/menu";
import type { MenuItemWithChildren, MenuItemFormData } from "@actions/menu";

export function useMenuBuilder(
  menuId: string, 
  menuItems: MenuItemWithChildren[], 
  onMenuItemsChange: (items: MenuItemWithChildren[]) => void
) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Hierarchical drag and drop handler
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    
    console.log('🎯 DragEnd - Active:', activeId, 'Over:', overId);
    
    // Find the active and over items in the current menu structure
    const { item: activeItem, parent: activeParent } = findItemAndParent(menuItems, activeId);
    const { item: overItem, parent: overParent } = findItemAndParent(menuItems, overId);

    if (!activeItem || !overItem) {
      console.log('❌ Could not find active or over item');
      return;
    }

    // Prevent dropping an item on itself or its descendants
    if (isDescendant(activeItem, overId)) {
      console.log('❌ Cannot drop item on itself or its descendant');
      return;
    }

    const newMenuItems = [...menuItems];
    
    // Remove the active item from its current location
    removeItemFromHierarchy(newMenuItems, activeId);
    
    // Determine drop position based on drag data
    let newParentId: string | null = null;
    let insertIndex = 0;
    
    // Check if we have drop position data from the drag overlay
    const dropData = over.data?.current;
    const activeData = active.data?.current;
    
    if (dropData?.dropPosition) {
      // Handle specific drop positions (above, below, inside)
      switch (dropData.dropPosition) {
        case 'above':
          newParentId = overParent?.id || null;
          insertIndex = overParent 
            ? overParent.children?.findIndex(child => child.id === overId) || 0
            : menuItems.findIndex(item => item.id === overId);
          break;
        case 'below':
          newParentId = overParent?.id || null;
          insertIndex = overParent 
            ? (overParent.children?.findIndex(child => child.id === overId) || 0) + 1
            : menuItems.findIndex(item => item.id === overId) + 1;
          break;
        case 'inside':
        default:
          newParentId = overId;
          insertIndex = overItem.children ? overItem.children.length : 0;
          break;
      }
    } else {
      // Default behavior: make it a child of the target item
      newParentId = overId;
      insertIndex = overItem.children ? overItem.children.length : 0;
    }
    
    // Update the active item with new parent
    const updatedActiveItem = { ...activeItem, parentId: newParentId };
    
    // Insert the item in its new position
    insertItemInHierarchy(newMenuItems, updatedActiveItem, newParentId, insertIndex);
    
    console.log('✅ Updated menu structure:', newMenuItems);
    onMenuItemsChange(newMenuItems);
    setHasUnsavedChanges(true);
  }, [menuItems, onMenuItemsChange]);

  // Save changes to server
  const saveChanges = useCallback(async () => {
    if (!hasUnsavedChanges) return;

    setIsLoading(true);
    try {
      // Prepare order update data for all items
      const orderUpdates = flattenItemsWithOrder(menuItems);
      
      console.log('💾 Saving menu order updates:', orderUpdates);
      
      // Update order on server
      await updateMenuItemsOrder({ items: orderUpdates });
      setHasUnsavedChanges(false);
      
      console.log('✅ Menu order saved successfully');
    } catch (error) {
      console.error('Failed to save menu changes:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [menuItems, hasUnsavedChanges]);

  const createMenuItem = useCallback(async (data: MenuItemFormData) => {
    setIsLoading(true);
    try {
      const requestData = {
        ...data,
        menuId,
        order: menuItems.length, // Add to end
      };
      
      const result = await createMenuItemAction(requestData);
      if (result.success && result.data) {
        // Add new item to the list
        const newItem: MenuItemWithChildren = {
          ...result.data,
          children: [],
        };
        onMenuItemsChange([...menuItems, newItem]);
      } else {
        throw new Error(result.error || 'Failed to create menu item');
      }
    } catch (error) {
      console.error('Failed to create menu item:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [menuId, menuItems, onMenuItemsChange]);

  const updateMenuItem = useCallback(async (itemId: string, data: MenuItemFormData) => {
    setIsLoading(true);
    try {
      const result = await updateMenuItemAction({
        id: itemId,
        ...data,
      });

      if (result.success && result.data) {
        // Update item in the list
        const updatedItems = updateItemInTree(menuItems, itemId, result.data);
        onMenuItemsChange(updatedItems);
      } else {
        throw new Error(result.error || 'Failed to update menu item');
      }
    } catch (error) {
      console.error('Failed to update menu item:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [menuItems, onMenuItemsChange]);

  const deleteMenuItem = useCallback(async (itemId: string) => {
    setIsLoading(true);
    try {
      const result = await deleteMenuItemAction(itemId);

      if (result.success) {
        // Remove item from the list (including children)
        const updatedItems = removeItemFromTree(menuItems, itemId);
        onMenuItemsChange(updatedItems);
      } else {
        throw new Error(result.error || 'Failed to delete menu item');
      }
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [menuItems, onMenuItemsChange]);

  return {
    isLoading,
    hasUnsavedChanges,
    handleDragEnd,
    saveChanges,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
  };
}

// Helper functions for hierarchical drag and drop
function findItemAndParent(
  items: MenuItemWithChildren[], 
  targetId: string, 
  parent: MenuItemWithChildren | null = null
): { item: MenuItemWithChildren | null, parent: MenuItemWithChildren | null } {
  for (const item of items) {
    if (item.id === targetId) {
      return { item, parent };
    }
    if (item.children && item.children.length > 0) {
      const result = findItemAndParent(item.children, targetId, item);
      if (result.item) {
        return result;
      }
    }
  }
  return { item: null, parent: null };
}

function findItemById(items: MenuItemWithChildren[], targetId: string): MenuItemWithChildren | null {
  for (const item of items) {
    if (item.id === targetId) {
      return item;
    }
    if (item.children && item.children.length > 0) {
      const found = findItemById(item.children, targetId);
      if (found) return found;
    }
  }
  return null;
}

function isDescendant(parentItem: MenuItemWithChildren, targetId: string): boolean {
  if (parentItem.id === targetId) return true;
  if (!parentItem.children) return false;
  
  return parentItem.children.some(child => isDescendant(child, targetId));
}

function removeItemFromHierarchy(items: MenuItemWithChildren[], itemId: string): boolean {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === itemId) {
      items.splice(i, 1);
      return true;
    }
    if (items[i].children && items[i].children.length > 0) {
      if (removeItemFromHierarchy(items[i].children, itemId)) {
        return true;
      }
    }
  }
  return false;
}

function insertItemInHierarchy(
  items: MenuItemWithChildren[], 
  item: MenuItemWithChildren, 
  parentId: string | null, 
  index: number
): void {
  if (!parentId) {
    // Insert at root level
    items.splice(index, 0, item);
  } else {
    // Find parent and insert into its children
    const parent = findItemById(items, parentId);
    if (parent) {
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.splice(index, 0, item);
    }
  }
}

function updateItemInTree(
  items: MenuItemWithChildren[], 
  targetId: string, 
  updatedData: Partial<MenuItemWithChildren>
): MenuItemWithChildren[] {
  return items.map(item => {
    if (item.id === targetId) {
      return { ...item, ...updatedData };
    }
    if (item.children && item.children.length > 0) {
      return {
        ...item,
        children: updateItemInTree(item.children, targetId, updatedData),
      };
    }
    return item;
  });
}

function removeItemFromTree(items: MenuItemWithChildren[], itemId: string): MenuItemWithChildren[] {
  return items.filter(item => {
    if (item.id === itemId) {
      return false; // Remove this item
    }
    if (item.children && item.children.length > 0) {
      item.children = removeItemFromTree(item.children, itemId);
    }
    return true;
  });
}

function flattenItemsWithOrder(items: MenuItemWithChildren[]): Array<{id: string, parentId: string | null, order: number}> {
  const result: Array<{id: string, parentId: string | null, order: number}> = [];
  
  function traverse(items: MenuItemWithChildren[], parentId: string | null = null) {
    items.forEach((item, index) => {
      result.push({
        id: item.id,
        parentId: parentId,
        order: index
      });
      
      if (item.children && item.children.length > 0) {
        traverse(item.children, item.id);
      }
    });
  }
  
  traverse(items);
  return result;
}