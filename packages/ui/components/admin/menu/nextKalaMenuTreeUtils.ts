import type { MenuItemWithChildren } from "@actions/menu";

export interface FoundItemInfo {
  item: MenuItemWithChildren;
  parent: MenuItemWithChildren | null;
  path: string[]; // Path of parent IDs, e.g., ['parentId1', 'parentId2']
  index: number; // Index of the item within its parent's children array
}

/**
 * Finds an item and its parent/path within the tree.
 */
export function findItemRecursive(
  items: MenuItemWithChildren[],
  itemId: string,
  currentPath: string[] = [],
  parent: MenuItemWithChildren | null = null
): FoundItemInfo | null {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.id === itemId) {
      return { item, parent, path: currentPath, index: i };
    }
    if (item.children && item.children.length > 0) {
      const found = findItemRecursive(item.children, itemId, [...currentPath, item.id], item);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * Removes an item from the tree. Returns the new tree and the removed item.
 */
export function removeItemRecursive(
  items: MenuItemWithChildren[],
  itemId: string
): { newTree: MenuItemWithChildren[]; removedItem: MenuItemWithChildren | null } {
  let removedItem: MenuItemWithChildren | null = null;

  function filterRecursive(currentItems: MenuItemWithChildren[], parentId: string | null): MenuItemWithChildren[] {
    const result: MenuItemWithChildren[] = [];
    for (const item of currentItems) {
      if (item.id === itemId) {
        removedItem = { ...item, parentId: parentId }; // Store original parentId before detaching
        continue; // Skip adding this item
      }
      const newItem = { ...item };
      if (newItem.children && newItem.children.length > 0) {
        newItem.children = filterRecursive(newItem.children, newItem.id);
      }
      result.push(newItem);
    }
    return result;
  }

  const newTree = filterRecursive(JSON.parse(JSON.stringify(items)), null); // Deep clone to avoid mutation
  return { newTree, removedItem };
}

/**
 * Adds an item to the tree under a specific parent or at the root.
 */
export function addItemRecursive(
  items: MenuItemWithChildren[],
  targetParentId: string | null,
  itemToAdd: MenuItemWithChildren,
  targetIndex?: number
): MenuItemWithChildren[] {
  const newTree = JSON.parse(JSON.stringify(items)); // Deep clone

  const itemToAddCleaned = { ...itemToAdd };
  // delete itemToAddCleaned.children; // Children should be empty when adding as a new item initially, or handled if moving existing with children

  if (targetParentId === null) {
    // Add to root
    if (targetIndex === undefined || targetIndex < 0 || targetIndex > newTree.length) {
      newTree.push(itemToAddCleaned);
    } else {
      newTree.splice(targetIndex, 0, itemToAddCleaned);
    }
    return newTree;
  }

  // Add to a specific parent
  function findAndAdd(currentItems: MenuItemWithChildren[]): boolean {
    for (const item of currentItems) {
      if (item.id === targetParentId) {
        if (!item.children) {
          item.children = [];
        }
        if (targetIndex === undefined || targetIndex < 0 || targetIndex > item.children.length) {
          item.children.push(itemToAddCleaned);
        } else {
          item.children.splice(targetIndex, 0, itemToAddCleaned);
        }
        return true;
      }
      if (item.children && findAndAdd(item.children)) {
        return true;
      }
    }
    return false;
  }

  findAndAdd(newTree);
  return newTree;
}

/**
 * Flattens the tree to a list of all item IDs.
 * Useful for the `items` prop of the top-level SortableContext or DndContext.
 */
export function getAllTreeItemIds(items: MenuItemWithChildren[]): string[] {
  const ids: string[] = [];
  function traverse(currentItems: MenuItemWithChildren[]) {
    for (const item of currentItems) {
      ids.push(item.id);
      if (item.children && item.children.length > 0) {
        traverse(item.children);
      }
    }
  }
  traverse(items);
  return ids;
}

/**
 * Generates a unique ID.
 * Replace with a more robust UUID generator if needed.
 */
export function generateUniqueId(): string {
  return `menu-item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Rebuilds the parentId and order properties for all items in the tree.
 * This is crucial after drag-and-drop operations to ensure data integrity before saving.
 */
export function normalizeTreeStructure(
  items: MenuItemWithChildren[],
  parentId: string | null = null,
  path: string[] = []
): MenuItemWithChildren[] {
  return items.map((item, index) => {
    const newItem: MenuItemWithChildren = {
      ...item,
      parentId: parentId,
      order: index,
      // Potentially update a 'depth' or 'path' property if your schema uses it
    };
    if (item.children && item.children.length > 0) {
      newItem.children = normalizeTreeStructure(item.children, item.id, [...path, item.id]);
    } else {
      newItem.children = []; // Ensure children is an empty array if no children
    }
    return newItem;
  });
}
