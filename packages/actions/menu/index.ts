// ==========================================
// MENU ACTION EXPORTS
// ==========================================

// Export all action functions
export { createMenu, createMenuItem } from "./create"
export { getMenuById, getAllMenus, getUserMenus, getMenuWithItems, getMenuBySlug, getLinkableResources } from "./get"
export { updateMenu, updateMenuItem, updateMenuItemsOrder } from "./update"
export { deleteMenu, deleteMenuItem } from "./delete"

// Add getMenus as an alias for getAllMenus to fix import errors
export { getAllMenus as getMenus } from "./get"

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