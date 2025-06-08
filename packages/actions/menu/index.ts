// ==========================================
// MENU ACTION EXPORTS
// ==========================================

// Export all original action functions
export { createMenu, createMenuItem } from "./create"
export { getMenuById, getAllMenus, getUserMenus, getMenuWithItems, getMenuBySlug, getLinkableResources } from "./get"
export { updateMenu, updateMenuItem, updateMenuItemsOrder } from "./update"
export { deleteMenu, deleteMenuItem } from "./delete"

// Add getMenus as an alias for getAllMenus to fix import errors
export { getAllMenus as getMenus } from "./get"

// Export cached versions (only the ones that exist in cache.ts)
export { 
  getMenuBySlug as cachedGetMenuBySlug,
  getAllMenus as cachedGetAllMenus,
  getMenuWithItems as cachedGetMenuWithItems,
  getLinkableResources as cachedGetLinkableResources,
} from "./cache"

// Export cached actions as grouped objects for easier importing
import * as cachedActions from "./cache"
import * as createActions from "./create"
import * as updateActions from "./update"
import * as deleteActions from "./delete"

export const cachedMenuActions = {
  getMenuBySlug: (slug: string) => () => cachedActions.getMenuBySlug(slug),
  getAllMenus: () => () => cachedActions.getAllMenus(),
  getMenuWithItems: (id: string) => () => cachedActions.getMenuWithItems(id),
  getLinkableResources: () => () => cachedActions.getLinkableResources(),
}

export const menuCacheOperations = {
  createMenu: createActions.createMenu,
  createMenuItem: createActions.createMenuItem,
  updateMenu: updateActions.updateMenu,
  updateMenuItem: updateActions.updateMenuItem,
  updateMenuItemsOrder: updateActions.updateMenuItemsOrder,
  deleteMenu: deleteActions.deleteMenu,
  deleteMenuItem: deleteActions.deleteMenuItem,
}

// Export all types
export type * from "./types"

// Export form schema types
export type {
  MenuFormData,
  MenuItemFormData,
  CreateMenuItemData,
  UpdateMenuItemData,
  UpdateMenuItemsOrderData,
  MoveMenuItemData
} from "./formSchema"

// Export form schemas as values
export {
  menuFormSchema,
  menuItemFormSchema,
  createMenuItemSchema,
  updateMenuItemSchema,
  updateMenuItemsOrderSchema,
  moveMenuItemSchema
} from "./formSchema"