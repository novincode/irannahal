"use server"

import { eq } from "drizzle-orm"
import { db } from "@db"
import { menus, menuItems } from "@db/schema"
import { withAdmin } from "@actions/utils"
import { 
  menuFormSchema, 
  createMenuItemSchema,
  type MenuFormData,
  type CreateMenuItemData 
} from "./formSchema"
import { menuCacheInvalidation } from "./cacheConfig"

// ==========================================
// MENU CREATION
// ==========================================

export async function createMenu(data: MenuFormData) {
  return withAdmin(async (user) => {
    // Validate input data
    const validatedData = menuFormSchema.parse(data)
    
    // Check for slug conflicts
    const [existingMenu] = await db
      .select({ id: menus.id })
      .from(menus)
      .where(eq(menus.slug, validatedData.slug))
      .limit(1)

    if (existingMenu) {
      throw new Error("نامک منو قبلاً استفاده شده است")
    }

    // Create menu
    const [newMenu] = await db
      .insert(menus)
      .values({
        ...validatedData,
        userId: user.id,
      })
      .returning()

    // Invalidate cache
    menuCacheInvalidation.invalidateAllMenusList()

    return newMenu
  })
}

// ==========================================
// MENU ITEM CREATION
// ==========================================

export async function createMenuItem(data: CreateMenuItemData) {
  return withAdmin(async (user) => {
    // Validate input data
    const validatedData = createMenuItemSchema.parse(data)
    
    // Verify menu exists and user owns it
    const [menu] = await db
      .select({ id: menus.id, userId: menus.userId })
      .from(menus)
      .where(eq(menus.id, validatedData.menuId))
      .limit(1)

    if (!menu) {
      throw new Error("منو پیدا نشد")
    }

    if (menu.userId !== user.id) {
      throw new Error("شما اجازه ایجاد آیتم در این منو را ندارید")
    }

    // Verify parent exists if specified
    if (validatedData.parentId) {
      const [parent] = await db
        .select({ id: menuItems.id, menuId: menuItems.menuId })
        .from(menuItems)
        .where(eq(menuItems.id, validatedData.parentId))
        .limit(1)

      if (!parent) {
        throw new Error("آیتم والد پیدا نشد")
      }

      if (parent.menuId !== validatedData.menuId) {
        throw new Error("آیتم والد به منوی متفاوتی تعلق دارد")
      }
    }

    // Create menu item
    const [newMenuItem] = await db
      .insert(menuItems)
      .values(validatedData)
      .returning()

    // Invalidate cache
    menuCacheInvalidation.invalidateMenuAndRelated(validatedData.menuId)

    return newMenuItem
  })
}