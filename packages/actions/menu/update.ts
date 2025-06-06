"use server"

import { eq, inArray } from "drizzle-orm"
import { db } from "@db"
import { menus, menuItems } from "@db/schema"
import { withAdmin } from "@actions/utils"
import { 
  menuFormSchema,
  updateMenuItemSchema,
  updateMenuItemsOrderSchema,
  type MenuFormData,
  type UpdateMenuItemData,
  type UpdateMenuItemsOrderData
} from "./formSchema"
import type { 
  UpdateMenuResponse,
  UpdateMenuItemResponse,
  UpdateMenuItemsOrderResponse,
  MenuItemOrderUpdate
} from "./types"

// ==========================================
// MENU UPDATES
// ==========================================

export async function updateMenu(id: string, data: MenuFormData): Promise<UpdateMenuResponse> {
  return withAdmin(async (user) => {
    try {
      // Validate input data
      const validatedData = menuFormSchema.parse(data)
      
      // Verify menu exists and user owns it
      const [existingMenu] = await db
        .select({ id: menus.id, userId: menus.userId, slug: menus.slug })
        .from(menus)
        .where(eq(menus.id, id))
        .limit(1)

      if (!existingMenu) {
        return {
          success: false,
          error: "منو پیدا نشد",
          code: "MENU_NOT_FOUND",
          timestamp: new Date(),
          data: undefined as never,
        }
      }

      if (existingMenu.userId !== user.id) {
        return {
          success: false,
          error: "دسترسی غیرمجاز",
          code: "UNAUTHORIZED",
          timestamp: new Date(),
          data: undefined as never,
        }
      }

      // Check for slug conflicts (if slug is being changed)
      if (validatedData.slug !== existingMenu.slug) {
        const [conflictingMenu] = await db
          .select({ id: menus.id })
          .from(menus)
          .where(eq(menus.slug, validatedData.slug))
          .limit(1)

        if (conflictingMenu) {
          return {
            success: false,
            error: "نامک منو قبلاً استفاده شده است",
            code: "DUPLICATE_SLUG",
            timestamp: new Date(),
            data: undefined as never,
          }
        }
      }

      // Update menu
      const [updatedMenu] = await db
        .update(menus)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(menus.id, id))
        .returning()

      return {
        success: true,
        timestamp: new Date(),
        data: updatedMenu,
      }
    } catch (error) {
      console.error("Failed to update menu:", error)
      
      if (error instanceof Error && error.name === 'ZodError') {
        return {
          success: false,
          error: "داده‌های ورودی نامعتبر است",
          code: "VALIDATION_ERROR",
          timestamp: new Date(),
          data: undefined as never,
        }
      }

      return {
        success: false,
        error: "خطا در به‌روزرسانی منو",
        code: "INTERNAL_ERROR",
        timestamp: new Date(),
        data: undefined as never,
      }
    }
  })
}

// ==========================================
// MENU ITEM UPDATES
// ==========================================

export async function updateMenuItem(data: UpdateMenuItemData): Promise<UpdateMenuItemResponse> {
  return withAdmin(async (user) => {
    try {
      // Validate input data
      const validatedData = updateMenuItemSchema.parse(data)
      
      // Verify menu item exists and user owns the menu
      const [existingItem] = await db
        .select({ 
          id: menuItems.id, 
          menuId: menuItems.menuId,
          parentId: menuItems.parentId
        })
        .from(menuItems)
        .innerJoin(menus, eq(menuItems.menuId, menus.id))
        .where(eq(menuItems.id, validatedData.id))
        .limit(1)

      if (!existingItem) {
        return {
          success: false,
          error: "آیتم منو پیدا نشد",
          code: "MENU_ITEM_NOT_FOUND",
          timestamp: new Date(),
          data: undefined as never,
        }
      }

      // Verify parent exists if specified and is different from current
      if (validatedData.parentId && validatedData.parentId !== existingItem.parentId) {
        const [parent] = await db
          .select({ id: menuItems.id, menuId: menuItems.menuId })
          .from(menuItems)
          .where(eq(menuItems.id, validatedData.parentId))
          .limit(1)

        if (!parent) {
          return {
            success: false,
            error: "آیتم والد پیدا نشد",
            code: "PARENT_NOT_FOUND",
            timestamp: new Date(),
            data: undefined as never,
          }
        }

        if (parent.menuId !== existingItem.menuId) {
          return {
            success: false,
            error: "آیتم والد به منوی متفاوتی تعلق دارد",
            code: "PARENT_MENU_MISMATCH",
            timestamp: new Date(),
            data: undefined as never,
          }
        }

        // Prevent circular references (item becoming child of its own descendant)
        if (await isDescendant(validatedData.id, validatedData.parentId)) {
          return {
            success: false,
            error: "نمی‌توان آیتم را به فرزند خودش تبدیل کرد",
            code: "CIRCULAR_REFERENCE",
            timestamp: new Date(),
            data: undefined as never,
          }
        }
      }

      // Update menu item
      const [updatedItem] = await db
        .update(menuItems)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(menuItems.id, validatedData.id))
        .returning()

      return {
        success: true,
        timestamp: new Date(),
        data: updatedItem,
      }
    } catch (error) {
      console.error("Failed to update menu item:", error)
      
      if (error instanceof Error && error.name === 'ZodError') {
        return {
          success: false,
          error: "داده‌های ورودی نامعتبر است",
          code: "VALIDATION_ERROR",
          timestamp: new Date(),
          data: undefined as never,
        }
      }

      return {
        success: false,
        error: "خطا در به‌روزرسانی آیتم منو",
        code: "INTERNAL_ERROR",
        timestamp: new Date(),
        data: undefined as never,
      }
    }
  })
}

// ==========================================
// BULK ORDER UPDATES
// ==========================================

export async function updateMenuItemsOrder(data: UpdateMenuItemsOrderData): Promise<UpdateMenuItemsOrderResponse> {
  return withAdmin(async (user) => {
    try {
      // Validate input data
      const validatedData = updateMenuItemsOrderSchema.parse(data)
      
      if (validatedData.items.length === 0) {
        return {
          success: true,
          timestamp: new Date(),
          data: [],
        }
      }

      // Verify all items exist and user owns their menus
      const itemIds = validatedData.items.map(item => item.id)
      const existingItems = await db
        .select({ 
          id: menuItems.id, 
          menuId: menuItems.menuId,
          userId: menus.userId
        })
        .from(menuItems)
        .innerJoin(menus, eq(menuItems.menuId, menus.id))
        .where(inArray(menuItems.id, itemIds))

      if (existingItems.length !== itemIds.length) {
        return {
          success: false,
          error: "برخی آیتم‌ها پیدا نشدند",
          code: "ITEMS_NOT_FOUND",
          timestamp: new Date(),
          data: undefined as never,
        }
      }

      // Verify user owns all menus
      const unauthorizedItems = existingItems.filter(item => item.userId !== user.id)
      if (unauthorizedItems.length > 0) {
        return {
          success: false,
          error: "دسترسی غیرمجاز به برخی آیتم‌ها",
          code: "UNAUTHORIZED",
          timestamp: new Date(),
          data: undefined as never,
        }
      }

      // Perform bulk update
      const updatePromises = validatedData.items.map(item => 
        db.update(menuItems)
          .set({ 
            order: item.order, 
            parentId: item.parentId,
            updatedAt: new Date()
          })
          .where(eq(menuItems.id, item.id))
      )

      await Promise.all(updatePromises)

      return {
        success: true,
        timestamp: new Date(),
        data: validatedData.items,
      }
    } catch (error) {
      console.error("Failed to update menu items order:", error)
      
      if (error instanceof Error && error.name === 'ZodError') {
        return {
          success: false,
          error: "داده‌های ورودی نامعتبر است",
          code: "VALIDATION_ERROR",
          timestamp: new Date(),
          data: undefined as never,
        }
      }

      return {
        success: false,
        error: "خطا در به‌روزرسانی ترتیب آیتم‌ها",
        code: "INTERNAL_ERROR",
        timestamp: new Date(),
        data: undefined as never,
      }
    }
  })
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

async function isDescendant(ancestorId: string, descendantId: string): Promise<boolean> {
  // Get all children of the descendant
  const children = await db
    .select({ id: menuItems.id })
    .from(menuItems)
    .where(eq(menuItems.parentId, descendantId))

  // Check if ancestor is among direct children
  if (children.some(child => child.id === ancestorId)) {
    return true
  }

  // Recursively check children's children
  for (const child of children) {
    if (await isDescendant(ancestorId, child.id)) {
      return true
    }
  }

  return false
}