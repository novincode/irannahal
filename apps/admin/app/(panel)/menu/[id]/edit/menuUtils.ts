import type { MenuItemWithChildren } from '@actions/menu/types'

export interface FlatMenuItemWithPath extends MenuItemWithChildren {
  depth: number
  path: string[]
  parentPath: string
}

/**
 * Flatten hierarchical menu items to a flat array with depth information
 */
export function flattenMenuItems(items: MenuItemWithChildren[], depth = 0, path: string[] = []): FlatMenuItemWithPath[] {
  const flatItems: FlatMenuItemWithPath[] = []
  
  items.forEach(item => {
    const currentPath = [...path, item.id]
    const flatItem: FlatMenuItemWithPath = {
      ...item,
      depth,
      path: currentPath,
      parentPath: path.join('/')
    }
    
    flatItems.push(flatItem)
    
    if (item.children && item.children.length > 0) {
      flatItems.push(...flattenMenuItems(item.children, depth + 1, currentPath))
    }
  })
  
  return flatItems
}

/**
 * Build hierarchical structure from flat menu items
 */
export function buildHierarchy(flatItems: MenuItemWithChildren[]): MenuItemWithChildren[] {
  const itemsMap = new Map<string, MenuItemWithChildren>()
  const rootItems: MenuItemWithChildren[] = []
  
  // First pass: create all items with empty children arrays
  flatItems.forEach(item => {
    itemsMap.set(item.id, { ...item, children: [] })
  })
  
  // Second pass: build hierarchy
  flatItems.forEach(item => {
    const menuItem = itemsMap.get(item.id)!
    
    if (!item.parentId) {
      rootItems.push(menuItem)
    } else {
      const parent = itemsMap.get(item.parentId)
      if (parent) {
        parent.children.push(menuItem)
      }
    }
  })
  
  // Sort items by order
  const sortByOrder = (items: MenuItemWithChildren[]) => {
    items.sort((a, b) => (a.order || 0) - (b.order || 0))
    items.forEach(item => {
      if (item.children.length > 0) {
        sortByOrder(item.children)
      }
    })
  }
  
  sortByOrder(rootItems)
  return rootItems
}

/**
 * Reorder items when moving between containers
 */
export function reorderItems(
  items: MenuItemWithChildren[],
  activeId: string,
  newParentId: string | null,
  newIndex?: number
): MenuItemWithChildren[] {
  const flatItems = flattenMenuItems(items)
  
  // Find the item being moved
  const activeItem = flatItems.find(item => item.id === activeId)
  if (!activeItem) return items
  
  // Update the item's parentId
  const updatedFlatItems = flatItems.map(item => {
    if (item.id === activeId) {
      return {
        ...item,
        parentId: newParentId,
        children: item.children // Preserve children
      }
    }
    return item
  })
  
  return buildHierarchy(updatedFlatItems)
}

/**
 * Find all descendants of a menu item
 */
export function findDescendants(items: MenuItemWithChildren[], parentId: string): string[] {
  const descendants: string[] = []
  
  const findChildren = (itemList: MenuItemWithChildren[]) => {
    itemList.forEach(item => {
      if (item.parentId === parentId || descendants.includes(item.parentId || '')) {
        descendants.push(item.id)
        if (item.children.length > 0) {
          findChildren(item.children)
        }
      }
    })
  }
  
  const flatItems = flattenMenuItems(items)
  findChildren(flatItems)
  
  return descendants
}

/**
 * Check if an item can be moved to a new parent (prevent circular references)
 */
export function canMoveToParent(
  items: MenuItemWithChildren[],
  itemId: string,
  newParentId: string | null
): boolean {
  if (!newParentId) return true // Can always move to root
  if (itemId === newParentId) return false // Can't move to self
  
  const descendants = findDescendants(items, itemId)
  return !descendants.includes(newParentId)
}

/**
 * Get the maximum depth allowed for children
 */
export function getMaxDepth(items: MenuItemWithChildren[], maxAllowed = 5): number {
  let maxDepth = 0
  
  const calculateDepth = (itemList: MenuItemWithChildren[], currentDepth = 0) => {
    itemList.forEach(item => {
      maxDepth = Math.max(maxDepth, currentDepth)
      if (item.children.length > 0) {
        calculateDepth(item.children, currentDepth + 1)
      }
    })
  }
  
  calculateDepth(items)
  return Math.min(maxDepth, maxAllowed)
}

/**
 * Calculate new order for items after reordering
 */
export function calculateNewOrder(
  items: MenuItemWithChildren[],
  movedItemId: string,
  targetIndex: number
): MenuItemWithChildren[] {
  return items.map((item, index) => ({
    ...item,
    order: index
  }))
}
