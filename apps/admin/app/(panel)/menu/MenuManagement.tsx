"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/ui/card";
import { Input } from "@ui/components/ui/input";
import { Label } from "@ui/components/ui/label";
import { Textarea } from "@ui/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@ui/components/ui/dialog";
import { Plus, Settings, Trash2, Edit, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MenuBuilder } from "@ui/components/admin/menu/MenuBuilder";
import { 
  getMenus, 
  getMenuWithItems,
  createMenu, 
  updateMenu, 
  deleteMenu,
  menuFormSchema,
  type MenuWithItems,
  type MenuFormData 
} from "@actions/menu";

export function MenuManagement() {
  const [menus, setMenus] = useState<MenuWithItems[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuWithItems | null>(null);
  const [showMenuEditor, setShowMenuEditor] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MenuFormData>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      location: '',
    },
  });

  // Load menus on component mount
  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    try {
      setIsLoading(true);
      const response = await getMenus();
      if (response.success && response.data) {
        // Convert Menu[] to MenuWithItems[] by adding empty items array
        const menusWithItems: MenuWithItems[] = response.data.map(menu => ({
          ...menu,
          items: []
        }));
        setMenus(menusWithItems);
        if (menusWithItems.length > 0 && !selectedMenu) {
          // Load the first menu with its items
          loadMenuItems(menusWithItems[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load menus:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMenuItems = async (menuId: string) => {
    try {
      const response = await getMenuWithItems(menuId);
      if (response.success && response.data) {
        setSelectedMenu(response.data);
        // Update menus list with the loaded items
        setMenus(prevMenus => 
          prevMenus.map(menu => 
            menu.id === menuId ? response.data! : menu
          )
        );
      }
    } catch (error) {
      console.error('Failed to load menu items:', error);
    }
  };

  const getMenuItemCount = (items: any[]): number => {
    let count = items.length;
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        count += getMenuItemCount(item.children);
      }
    });
    return count;
  };

  const handleMenuSelect = async (menu: MenuWithItems) => {
    if (menu.id === selectedMenu?.id) return;
    
    setIsLoading(true);
    try {
      await loadMenuItems(menu.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMenu = async (data: MenuFormData) => {
    try {
      setIsLoading(true);
      const response = await createMenu(data);
      if (response.success && response.data) {
        const newMenu: MenuWithItems = {
          ...response.data,
          items: [],
        };
        setMenus([...menus, newMenu]);
        setSelectedMenu(newMenu);
        setShowMenuEditor(false);
        reset();
      }
    } catch (error) {
      console.error('Failed to create menu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMenu = async (data: MenuFormData) => {
    if (!editingMenu) return;

    try {
      setIsLoading(true);
      const response = await updateMenu(editingMenu.id, data);
      if (response.success && response.data) {
        const updatedMenus = menus.map(menu => 
          menu.id === editingMenu.id 
            ? { ...menu, ...response.data } 
            : menu
        );
        setMenus(updatedMenus);
        if (selectedMenu?.id === editingMenu.id) {
          setSelectedMenu({ ...selectedMenu, ...response.data });
        }
        setShowMenuEditor(false);
        setEditingMenu(null);
        reset();
      }
    } catch (error) {
      console.error('Failed to update menu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این منو را حذف کنید؟ این عمل قابل بازگشت نیست.')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await deleteMenu(menuId);
      if (response.success) {
        const updatedMenus = menus.filter(menu => menu.id !== menuId);
        setMenus(updatedMenus);
        if (selectedMenu?.id === menuId) {
          setSelectedMenu(updatedMenus.length > 0 ? updatedMenus[0] : null);
        }
      }
    } catch (error) {
      console.error('Failed to delete menu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMenu = (menu: MenuWithItems) => {
    setEditingMenu(menu);
    reset({
      name: menu.name,
      slug: menu.slug,
      description: menu.description || '',
      location: menu.location || '',
    });
    setShowMenuEditor(true);
  };

  const handleNewMenu = () => {
    setEditingMenu(null);
    reset({
      name: '',
      slug: '',
      description: '',
      location: '',
    });
    setShowMenuEditor(true);
  };

  const handleMenuItemsChange = (items: any[]) => {
    if (selectedMenu) {
      const updatedMenu = {
        ...selectedMenu,
        items,
      };
      setSelectedMenu(updatedMenu);
      setMenus(menus.map(menu => 
        menu.id === selectedMenu.id ? updatedMenu : menu
      ));
    }
  };

  const handleAddMenuItem = () => {
    // This can be implemented to show a menu item creation dialog
    // For now, we'll log it as a placeholder
    console.log('Add menu item requested');
    // You could open a dialog here to create new menu items
  };

  const handleEditMenuItem = (item: any) => {
    // This can be implemented to show a menu item edit dialog
    console.log('Edit menu item requested:', item);
    // You could open a dialog here to edit menu items
  };

  const handleDeleteMenuItem = (itemId: string) => {
    // This can be implemented to delete menu items
    console.log('Delete menu item requested:', itemId);
    // You could implement deletion logic here
  };

  return (
    <div className="space-y-6">
      {/* Menu Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            منوهای شما
            <Button onClick={handleNewMenu} size="sm">
              <Plus className="h-4 w-4 ml-2" />
              منوی جدید
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {menus.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                هیچ منویی یافت نشد. اولین منوی خود را ایجاد کنید تا شروع کنید.
              </p>
              <Button onClick={handleNewMenu}>
                <Plus className="h-4 w-4 ml-2" />
                ایجاد منو
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menus.map((menu) => (
                  <Card 
                    key={menu.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedMenu?.id === menu.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleMenuSelect(menu)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{menu.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedMenu?.id === menu.id 
                              ? `${getMenuItemCount(menu.items)} آیتم`
                              : "بارگذاری..."
                            }
                          </p>
                          {menu.location && (
                            <p className="text-xs text-muted-foreground">
                              موقعیت: {menu.location}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditMenu(menu);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMenu(menu.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Menu Builder */}
      {selectedMenu && (
        <MenuBuilder
          menuId={selectedMenu.id}
          menuItems={selectedMenu.items}
          onMenuItemsChange={handleMenuItemsChange}
          onAddItem={handleAddMenuItem}
          onEditItem={handleEditMenuItem}
          onDeleteItem={handleDeleteMenuItem}
          isLoading={isLoading}
        />
      )}

      {/* Menu Editor Dialog */}
      {showMenuEditor && (
        <Dialog open={showMenuEditor} onOpenChange={setShowMenuEditor}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMenu ? 'ویرایش منو' : 'ایجاد منوی جدید'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(editingMenu ? handleUpdateMenu : handleCreateMenu)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">نام منو *</Label>
                <Input
                  id="name"
                  placeholder="ناوبری اصلی"
                  {...register('name')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">نامک *</Label>
                <Input
                  id="slug"
                  placeholder="main-navigation"
                  {...register('slug')}
                  className={errors.slug ? 'border-destructive' : ''}
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  برای شناسایی این منو در کد استفاده می‌شود
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">موقعیت</Label>
                <Input
                  id="location"
                  placeholder="هدر، فوتر، نوار کناری"
                  {...register('location')}
                />
                <p className="text-sm text-muted-foreground">
                  مکانی که این منو نمایش داده خواهد شد
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">توضیحات</Label>
                <Textarea
                  id="description"
                  placeholder="هدف این منو را توضیح دهید..."
                  {...register('description')}
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowMenuEditor(false)}
                  disabled={isLoading}
                >
                  لغو
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'در حال ذخیره...' : editingMenu ? 'بروزرسانی' : 'ایجاد'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
