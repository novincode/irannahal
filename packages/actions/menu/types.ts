import type { MenuSchema, MenuItemSchema } from '@db/types'
import type { MenuItemType } from '@db/schema'

// ==========================================
// BASE ENTITY TYPES
// ==========================================

export type Menu = MenuSchema
export type MenuItem = MenuItemSchema

// ==========================================
// HIERARCHY & STRUCTURE TYPES
// ==========================================

// MenuItem with children for hierarchical tree structure
export interface MenuItemWithChildren extends MenuItem {
  children: MenuItemWithChildren[]
}

// Menu with its complete hierarchical item structure
export interface MenuWithItems extends Menu {
  items: MenuItemWithChildren[]
}

// Flattened menu item with structural metadata
export interface FlatMenuItem extends MenuItem {
  depth: number
  hasChildren: boolean
  childrenCount: number
  path: string[] // Array of parent IDs from root to this item
}

// ==========================================
// OPERATION DATA TYPES
// ==========================================

// For drag and drop operations with precise positioning
export interface MenuItemMove {
  readonly id: string
  readonly sourceParentId: string | null
  readonly targetParentId: string | null
  readonly sourceIndex: number
  readonly targetIndex: number
}

// For bulk order updates
export interface MenuItemOrderUpdate {
  readonly id: string
  readonly parentId?: string | null | undefined
  readonly order: number
}

// For hierarchy validation
export interface HierarchyValidation {
  readonly isValid: boolean
  readonly error?: string
  readonly maxDepth: number
  readonly conflictingIds: string[]
}

// ==========================================
// RESOURCE LINKING TYPES
// ==========================================

// Available content types that can be linked to menu items
export type LinkableResourceType = 'post' | 'product' | 'category' | 'tag' | 'page'

// Resource that can be linked to a menu item
export interface LinkableResource {
  readonly id: string
  readonly title: string
  readonly slug: string
  readonly url: string
  readonly type: LinkableResourceType
  readonly status: 'published' | 'draft' | 'archived'
  readonly lastModified: Date
}

// Grouped resources for picker UI
export type GroupedLinkableResources = {
  readonly [K in LinkableResourceType]: LinkableResource[]
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

// Base response structure for all menu operations
export interface MenuActionResponse<TData = undefined> {
  readonly success: boolean
  readonly error?: string
  readonly code?: string
  readonly timestamp: Date
  readonly data: TData
}

// Specific response types for each operation
export type CreateMenuResponse = MenuActionResponse<Menu>
export type UpdateMenuResponse = MenuActionResponse<Menu>
export type DeleteMenuResponse = MenuActionResponse<void>
export type GetMenuResponse = MenuActionResponse<Menu>
export type GetMenusResponse = MenuActionResponse<Menu[]>
export type GetMenuWithItemsResponse = MenuActionResponse<MenuWithItems>

export type CreateMenuItemResponse = MenuActionResponse<MenuItem>
export type UpdateMenuItemResponse = MenuActionResponse<MenuItem>
export type DeleteMenuItemResponse = MenuActionResponse<void>
export type GetMenuItemResponse = MenuActionResponse<MenuItem>
export type UpdateMenuItemsOrderResponse = MenuActionResponse<MenuItemOrderUpdate[]>
export type MoveMenuItemResponse = MenuActionResponse<MenuItem>

export type GetLinkableResourcesResponse = MenuActionResponse<GroupedLinkableResources>

// ==========================================
// APPLICATION STATE TYPES
// ==========================================

// Menu builder component state
export interface MenuBuilderState {
  readonly selectedMenu: Menu | null
  readonly menuItems: MenuItemWithChildren[]
  readonly flatItems: FlatMenuItem[]
  readonly isLoading: boolean
  readonly hasUnsavedChanges: boolean
  readonly draggedItem: MenuItem | null
  readonly errors: Record<string, string>
}

// Menu editor form state
export interface MenuEditorState {
  readonly editingItem: MenuItemWithChildren | null
  readonly showItemEditor: boolean
  readonly showResourcePicker: boolean
  readonly isCreating: boolean
}

// ==========================================
// VALIDATION & ERROR TYPES
// ==========================================

// Validation error with field-specific information
export interface ValidationError {
  readonly field: string
  readonly message: string
  readonly code: string
  readonly value?: unknown
}

// Operation result with detailed error information
export interface OperationResult<TData = undefined> {
  readonly success: boolean
  readonly data?: TData
  readonly errors: ValidationError[]
  readonly warnings: string[]
}

// ==========================================
// UTILITY TYPES
// ==========================================

// Deep readonly version of MenuItemWithChildren
export type ReadonlyMenuItemWithChildren = {
  readonly [K in keyof MenuItemWithChildren]: K extends 'children' 
    ? readonly ReadonlyMenuItemWithChildren[]
    : MenuItemWithChildren[K]
}

// Partial update types that preserve required fields
export type MenuItemPartialUpdate = Partial<Omit<MenuItem, 'id' | 'menuId' | 'createdAt'>> & {
  readonly id: string
}

export type MenuPartialUpdate = Partial<Omit<Menu, 'id' | 'userId' | 'createdAt'>> & {
  readonly id: string
}

// ==========================================
// CONSTANTS & ENUMS
// ==========================================

export const MENU_ITEM_TYPES = ['custom', 'page', 'post', 'product', 'category', 'tag', 'external'] as const
export const MENU_ITEM_TARGETS = ['_self', '_blank', '_parent', '_top'] as const
export const MAX_MENU_DEPTH = 5
export const MAX_ITEMS_PER_MENU = 100

// Type guards for runtime type checking
export const isMenuItemWithChildren = (item: unknown): item is MenuItemWithChildren => {
  return typeof item === 'object' && 
         item !== null && 
         'id' in item && 
         'children' in item && 
         Array.isArray((item as any).children)
}

export const isLinkableResource = (resource: unknown): resource is LinkableResource => {
  return typeof resource === 'object' && 
         resource !== null && 
         'id' in resource && 
         'title' in resource && 
         'type' in resource &&
         MENU_ITEM_TYPES.includes((resource as any).type)
}