"use server"

import { eq } from "drizzle-orm"
import { db } from "@db"
import { menus, menuItems } from "@db/schema"
import { withAdmin } from "@actions/utils"
import type { 
  DeleteMenuResponse,
  DeleteMenuItemResponse
} from "./types"

// ==========================================
// MENU DELETION
// ==========================================

export async function deleteMenu(id: string): Promise<DeleteMenuResponse> {
  return withAdmin(async (user) => {
    try {
      // Verify menu exists and user owns it
      const [existingMenu] = await db
        .select({ id: menus.id, userId: menus.userId })
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

      // Delete all menu items first (foreign key constraint)
      await db
        .delete(menuItems)
        .where(eq(menuItems.menuId, id))

      // Delete the menu
      await db
        .delete(menus)
        .where(eq(menus.id, id))

      return {
        success: true,
        timestamp: new Date(),
        data: undefined,
      }
    } catch (error) {
      console.error("Failed to delete menu:", error)
      return {
        success: false,
        error: "خطا در حذف منو",
        code: "INTERNAL_ERROR",
        timestamp: new Date(),
        data: undefined as never,
      }
    }
  })
}

// ==========================================
// MENU ITEM DELETION
// ==========================================

export async function deleteMenuItem(id: string): Promise<DeleteMenuItemResponse> {
  return withAdmin(async (user) => {
    try {
      // Verify menu item exists and user owns the menu
      const [existingItem] = await db
        .select({ 
          id: menuItems.id, 
          menuId: menuItems.menuId,
          userId: menus.userId
        })
        .from(menuItems)
        .innerJoin(menus, eq(menuItems.menuId, menus.id))
        .where(eq(menuItems.id, id))
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

      if (existingItem.userId !== user.id) {
        return {
          success: false,
          error: "دسترسی غیرمجاز",
          code: "UNAUTHORIZED",
          timestamp: new Date(),
          data: undefined as never,
        }
      }

      // Get all descendant items (children, grandchildren, etc.)
      const descendantIds = await getAllDescendantIds(id)
      
      // Delete all descendants first, then the item itself
      if (descendantIds.length > 0) {
        await db
          .delete(menuItems)
          .where(eq(menuItems.parentId, id))
      }

      // Delete the item
      await db
        .delete(menuItems)
        .where(eq(menuItems.id, id))

      return {
        success: true,
        timestamp: new Date(),
        data: undefined,
      }
    } catch (error) {
      console.error("Failed to delete menu item:", error)
      return {
        success: false,
        error: "خطا در حذف آیتم منو",
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

async function getAllDescendantIds(parentId: string): Promise<string[]> {
  const descendants: string[] = []
  
  // Get direct children
  const children = await db
    .select({ id: menuItems.id })
    .from(menuItems)
    .where(eq(menuItems.parentId, parentId))

  for (const child of children) {
    descendants.push(child.id)
    // Recursively get grandchildren
    const grandchildren = await getAllDescendantIds(child.id)
    descendants.push(...grandchildren)
  }

  return descendants
}