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
import type { 
  CreateMenuResponse, 
  CreateMenuItemResponse,
  MenuActionResponse
} from "./types"

// ==========================================
// MENU CREATION
// ==========================================

export async function createMenu(data: MenuFormData): Promise<CreateMenuResponse> {
  return withAdmin(async (user) => {
    try {
      // Validate input data
      const validatedData = menuFormSchema.parse(data)
      
      // Check for slug conflicts
      const [existingMenu] = await db
        .select({ id: menus.id })
        .from(menus)
        .where(eq(menus.slug, validatedData.slug))
        .limit(1)

      if (existingMenu) {
        return {
          success: false,
          error: "نامک منو قبلاً استفاده شده است",
          code: "DUPLICATE_SLUG",
          timestamp: new Date(),
          data: undefined as never,
        }
      }

      // Create menu
      const [newMenu] = await db
        .insert(menus)
        .values({
          ...validatedData,
          userId: user.id,
        })
        .returning()

      return {
        success: true,
        timestamp: new Date(),
        data: newMenu,
      }
    } catch (error) {
      console.error("Failed to create menu:", error)
      
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
        error: "خطا در ایجاد منو",
        code: "INTERNAL_ERROR",
        timestamp: new Date(),
        data: undefined as never,
      }
    }
  })
}

// ==========================================
// MENU ITEM CREATION
// ==========================================

export async function createMenuItem(data: CreateMenuItemData): Promise<CreateMenuItemResponse> {
  return withAdmin(async (user) => {
    try {
      // Validate input data
      const validatedData = createMenuItemSchema.parse(data)
      
      // Verify menu exists and user owns it
      const [menu] = await db
        .select({ id: menus.id, userId: menus.userId })
        .from(menus)
        .where(eq(menus.id, validatedData.menuId))
        .limit(1)

      if (!menu) {
        return {
          success: false,
          error: "منو پیدا نشد",
          code: "MENU_NOT_FOUND",
          timestamp: new Date(),
          data: undefined as never,
        }
      }

      if (menu.userId !== user.id) {
        return {
          success: false,
          error: "دسترسی غیرمجاز",
          code: "UNAUTHORIZED",
          timestamp: new Date(),
          data: undefined as never,
        }
      }

      // Verify parent exists if specified
      if (validatedData.parentId) {
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

        if (parent.menuId !== validatedData.menuId) {
          return {
            success: false,
            error: "آیتم والد به منوی متفاوتی تعلق دارد",
            code: "PARENT_MENU_MISMATCH",
            timestamp: new Date(),
            data: undefined as never,
          }
        }
      }

      // Create menu item
      const [newMenuItem] = await db
        .insert(menuItems)
        .values(validatedData)
        .returning()

      return {
        success: true,
        timestamp: new Date(),
        data: newMenuItem,
      }
    } catch (error) {
      console.error("Failed to create menu item:", error)
      
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
        error: "خطا در ایجاد آیتم منو",
        code: "INTERNAL_ERROR",
        timestamp: new Date(),
        data: undefined as never,
      }
    }
  })
}