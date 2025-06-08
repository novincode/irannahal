"use server"

import { eq, inArray } from "drizzle-orm"
import { db } from "@db"
import { menus, menuItems } from "@db/schema"
import { withAdmin } from "@actions/utils"
import { 
  updateMenuItemSchema,
  updateMenuItemsOrderSchema,
  type UpdateMenuItemData,
  type UpdateMenuItemsOrderData,
  type MenuFormData 
} from "./formSchema"
import { menuCacheInvalidation } from "./cacheConfig"
import { menuFormSchema } from "./formSchema"

// ==========================================
// MENU UPDATES
// ==========================================

export async function updateMenu(id: string, data: MenuFormData) {
  return withAdmin(async (user) => {
    // Validate input data
    const validatedData = menuFormSchema.parse(data)
    
    // Verify menu exists and user owns it
    const [existingMenu] = await db
      .select({ id: menus.id, userId: menus.userId, slug: menus.slug })
      .from(menus)
      .where(eq(menus.id, id))
      .limit(1)

    if (!existingMenu) {
      throw new Error("منو پیدا نشد")
    }

    if (existingMenu.userId !== user.id) {
      throw new Error("شما اجازه ویرایش این منو را ندارید")
    }

    // Check for slug conflicts (if slug is being changed)
    if (validatedData.slug !== existingMenu.slug) {
      const [conflictingMenu] = await db
        .select({ id: menus.id })
        .from(menus)
        .where(eq(menus.slug, validatedData.slug))
        .limit(1)

      if (conflictingMenu) {
        throw new Error("نامک منو قبلاً استفاده شده است")
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

    // Invalidate cache
    menuCacheInvalidation.invalidateMenuAndRelated(id, validatedData.slug)

    return updatedMenu
  })
}

// ==========================================
// MENU ITEM UPDATES
// ==========================================

export async function updateMenuItem(data: UpdateMenuItemData) {
  return withAdmin(async (user) => {
    // Validate input data
    const validatedData = updateMenuItemSchema.parse(data)
    
    // Verify menu item exists and user owns the menu
    const [existingItem] = await db
      .select({
        id: menuItems.id,
        menuId: menuItems.menuId,
        parentId: menuItems.parentId,
      })
      .from(menuItems)
      .innerJoin(menus, eq(menuItems.menuId, menus.id))
      .where(eq(menuItems.id, validatedData.id))
      .limit(1)

    if (!existingItem) {
      throw new Error("آیتم منو پیدا نشد")
    }

    // Verify parent exists if specified and changed
    if (validatedData.parentId && validatedData.parentId !== existingItem.parentId) {
      const [parent] = await db
        .select({ id: menuItems.id, menuId: menuItems.menuId })
        .from(menuItems)
        .where(eq(menuItems.id, validatedData.parentId))
        .limit(1)

      if (!parent) {
        throw new Error("آیتم والد پیدا نشد")
      }

      if (parent.menuId !== existingItem.menuId) {
        throw new Error("آیتم والد به منوی متفاوتی تعلق دارد")
      }

      // Prevent circular references (item becoming child of its own descendant)
      if (await isDescendant(validatedData.id, validatedData.parentId)) {
        throw new Error("نمی‌توان آیتم را به فرزند خودش تبدیل کرد")
      }
    }

    // Update menu item
    const [updatedMenuItem] = await db
      .update(menuItems)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(menuItems.id, validatedData.id))
      .returning()

    // Invalidate cache
    menuCacheInvalidation.invalidateMenuAndRelated(existingItem.menuId)

    return updatedMenuItem
  })
}

// ==========================================
// BULK ORDER UPDATES
// ==========================================

export async function updateMenuItemsOrder(data: UpdateMenuItemsOrderData) {
  return withAdmin(async (user) => {
    // Validate input data
    const validatedData = updateMenuItemsOrderSchema.parse(data)
    
    if (validatedData.items.length === 0) {
      throw new Error("لیست آیتم‌ها نمی‌تواند خالی باشد")
    }

    // Get menu ID from the first item and verify ownership
    const [firstItem] = await db
      .select({ 
        menuId: menuItems.menuId,
        userId: menus.userId 
      })
      .from(menuItems)
      .innerJoin(menus, eq(menuItems.menuId, menus.id))
      .where(eq(menuItems.id, validatedData.items[0].id))
      .limit(1)

    if (!firstItem) {
      throw new Error("آیتم منو پیدا نشد")
    }

    if (firstItem.userId !== user.id) {
      throw new Error("دسترسی غیرمجاز")
    }

    const menuId = firstItem.menuId

    // Get all current items for this menu
    const currentItems = await db
      .select({ id: menuItems.id })
      .from(menuItems)
      .where(eq(menuItems.menuId, menuId))

    // Find items to delete (exist in DB but not in new state)
    const newItemIds = new Set(validatedData.items.map(item => item.id))
    const itemsToDelete = currentItems
      .filter(item => !newItemIds.has(item.id))
      .map(item => item.id)

    // Perform operations sequentially (Neon HTTP doesn't support transactions)
    // Delete items that are no longer in the new state
    if (itemsToDelete.length > 0) {
      await db
        .delete(menuItems)
        .where(inArray(menuItems.id, itemsToDelete))
    }

    // Update remaining items
    const updatePromises = validatedData.items.map(async (item) => {
      return db
        .update(menuItems)
        .set({
          order: item.order,
          parentId: item.parentId,
          updatedAt: new Date(),
        })
        .where(eq(menuItems.id, item.id))
        .returning()
    })

    await Promise.all(updatePromises)

    // Invalidate cache
    menuCacheInvalidation.invalidateMenuAndRelated(menuId)

    // Return the updated items (excluding deleted ones)
    const finalItems = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.menuId, menuId))

    return finalItems
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
