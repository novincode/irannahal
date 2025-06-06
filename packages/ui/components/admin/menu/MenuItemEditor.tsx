"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@ui/components/ui/button";
import { Input } from "@ui/components/ui/input";
import { Label } from "@ui/components/ui/label";
import { Textarea } from "@ui/components/ui/textarea";
import { Switch } from "@ui/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@ui/components/ui/dialog";
import { X, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { menuItemFormSchema } from "@actions/menu";
import type { MenuItemWithChildren, MenuItemFormData } from "@actions/menu";

interface MenuItemEditorProps {
  item?: MenuItemWithChildren | null;
  onSave: (data: MenuItemFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MenuItemEditor({ item, onSave, onCancel, isLoading = false }: MenuItemEditorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      label: item?.label || '',
      type: item?.type || 'custom',
      url: item?.url || '',
      target: (item?.target as any) || '_self',
      rel: item?.rel || '',
      linkedResourceId: item?.linkedResourceId || '',
      cssClasses: item?.cssClasses || '',
      isVisible: item?.isVisible ?? true,
    },
  });

  const selectedType = watch('type');
  const selectedTarget = watch('target');

  useEffect(() => {
    if (item) {
      reset({
        label: item.label,
        type: item.type,
        url: item.url || '',
        target: (item.target as any) || '_self',
        rel: item.rel || '',
        linkedResourceId: item.linkedResourceId || '',
        cssClasses: item.cssClasses || '',
        isVisible: item.isVisible,
      });
    }
  }, [item, reset]);

  const handleClose = () => {
    onCancel();
  };

  const onSubmit = async (data: MenuItemFormData) => {
    try {
      await onSave(data);
      handleClose();
    } catch (error) {
      console.error('Failed to save menu item:', error);
    }
  };

  // Add click handler to debug form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  };

  const menuItemTypes = [
    { value: 'custom', label: 'لینک سفارشی' },
    { value: 'page', label: 'صفحه' },
    { value: 'category', label: 'دسته‌بندی' },
    { value: 'product', label: 'محصول' },
    { value: 'tag', label: 'برچسب' },
    { value: 'external', label: 'لینک خارجی' },
  ];

  const targetOptions = [
    { value: '_self', label: 'همان پنجره' },
    { value: '_blank', label: 'پنجره جدید' },
    { value: '_parent', label: 'فریم والد' },
    { value: '_top', label: 'فریم بالا' },
  ];

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {item ? 'ویرایش آیتم منو' : 'افزودن آیتم منو'}
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="label">برچسب *</Label>
              <Input
                id="label"
                placeholder="برچسب آیتم منو"
                {...register('label')}
                className={errors.label ? 'border-destructive' : ''}
              />
              {errors.label && (
                <p className="text-sm text-destructive">{errors.label.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">نوع *</Label>
              <Select 
                value={selectedType} 
                onValueChange={(value) => {
                  setValue('type', value as any, { shouldValidate: true });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="نوع را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {menuItemTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>
          </div>

          {/* URL Field */}
          {(selectedType === 'custom' || selectedType === 'external') && (
            <div className="space-y-2">
              <Label htmlFor="url">آدرس *</Label>
              <div className="relative">
                <Input
                  id="url"
                  placeholder="https://example.com یا /مسیر-داخلی"
                  {...register('url')}
                  className={errors.url ? 'border-destructive' : ''}
                />
                {errors.url && (
                  <p className="text-sm text-destructive">{errors.url.message}</p>
                )}
                {selectedTarget === '_blank' && (
                  <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          )}

          {/* Linked Resource ID (for dynamic types) */}
          {['page', 'category', 'product', 'tag'].includes(selectedType) && (
            <div className="space-y-2">
              <Label htmlFor="linkedResourceId">شناسه منبع</Label>
              <Input
                id="linkedResourceId"
                placeholder="UUID منبع متصل شده"
                {...register('linkedResourceId')}
                className={errors.linkedResourceId ? 'border-destructive' : ''}
              />
              {errors.linkedResourceId && (
                <p className="text-sm text-destructive">{errors.linkedResourceId.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                شناسه {selectedType} که این آیتم منو به آن متصل می‌شود
              </p>
            </div>
          )}

          {/* Target & Visibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target">باز کردن در</Label>
              <Select 
                value={selectedTarget} 
                onValueChange={(value) => {
                  setValue('target', value as any, { shouldValidate: true });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {targetOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isVisible">نمایش</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isVisible"
                  checked={watch('isVisible')}
                  onCheckedChange={(checked) => {
                    setValue('isVisible', checked, { shouldValidate: true });
                  }}
                />
                <Label htmlFor="isVisible" className="text-sm">
                  نمایش در منو
                </Label>
              </div>
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <div className="border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm"
            >
              {showAdvanced ? 'مخفی کردن' : 'نمایش'} تنظیمات پیشرفته
            </Button>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="space-y-4 border-l-2 border-muted pl-4">
              <div className="space-y-2">
                <Label htmlFor="rel">ویژگی Rel</Label>
                <Input
                  id="rel"
                  placeholder="noopener, noreferrer, etc."
                  {...register('rel')}
                  className={errors.rel ? 'border-destructive' : ''}
                />
                {errors.rel && (
                  <p className="text-sm text-destructive">{errors.rel.message}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  ویژگی‌های rel جدا شده با فاصله (مثل "noopener noreferrer")
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cssClasses">کلاس‌های CSS</Label>
                <Input
                  id="cssClasses"
                  placeholder="menu-item special-link"
                  {...register('cssClasses')}
                  className={errors.cssClasses ? 'border-destructive' : ''}
                />
                {errors.cssClasses && (
                  <p className="text-sm text-destructive">{errors.cssClasses.message}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  کلاس‌های CSS جدا شده با فاصله برای اعمال به این آیتم منو
                </p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              لغو
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'در حال ذخیره...' : item ? 'بروزرسانی' : 'ایجاد'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
