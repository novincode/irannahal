"use server"

import { eq, inArray } from "drizzle-orm"
import { db } from "@db"
import { menus, menuItems } from "@db/schema"
import { withAdmin } from "@actions/utils"
import { menuCacheInvalidation } from "./cacheConfig"

// ==========================================
// MENU DELETION
// ==========================================

export async function deleteMenu(id: string) {
  return withAdmin(async (user) => {
    // Verify menu exists and user owns it
    const [existingMenu] = await db
      .select({ id: menus.id, userId: menus.userId })
      .from(menus)
      .where(eq(menus.id, id))
      .limit(1)

    if (!existingMenu) {
      throw new Error("منو پیدا نشد")
    }

    if (existingMenu.userId !== user.id) {
      throw new Error("دسترسی غیرمجاز")
    }

    // Delete all menu items first (foreign key constraint)
    await db
      .delete(menuItems)
      .where(eq(menuItems.menuId, id))

    // Delete the menu
    const [deletedMenu] = await db
      .delete(menus)
      .where(eq(menus.id, id))
      .returning()

    // Invalidate cache
    menuCacheInvalidation.invalidateMenuAndRelated(id)
    menuCacheInvalidation.invalidateAllMenusList()

    return deletedMenu
  })
}

// ==========================================
// MENU ITEM DELETION
// ==========================================

export async function deleteMenuItem(id: string) {
  return withAdmin(async (user) => {
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
      throw new Error("آیتم منو پیدا نشد")
    }

    if (existingItem.userId !== user.id) {
      throw new Error("دسترسی غیرمجاز")
    }

    // Get all descendant items (children, grandchildren, etc.)
    const descendantIds = await getAllDescendantIds(id)
    
    // Delete all descendants first, then the item itself
    if (descendantIds.length > 0) {
      await db
        .delete(menuItems)
        .where(inArray(menuItems.id, descendantIds))
    }

    // Delete the menu item
    const [deletedMenuItem] = await db
      .delete(menuItems)
      .where(eq(menuItems.id, id))
      .returning()

    // Invalidate cache
    menuCacheInvalidation.invalidateMenuAndRelated(existingItem.menuId)

    return deletedMenuItem
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