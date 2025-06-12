"use client"

import * as React from "react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@ui/components/ui/form"
import { Checkbox } from "@ui/components/ui/checkbox"
import { Label } from "@ui/components/ui/label"
import { ScrollArea } from "@ui/components/ui/scroll-area"
import { Button } from "@ui/components/ui/button"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@ui/components/ui/dialog"
import type { BlockProps } from "@data/usePostEditorStore"
import type { CategoryWithDynamicRelations } from "@actions/categories/types"
import { CategoryForm } from "@ui/components/admin/categories/CategoryForm"
import { createCategory } from "@actions/categories/create"
import { toast } from "sonner"

interface CategoriesBlockProps extends BlockProps {
  categories?: CategoryWithDynamicRelations[]
  disabled?: boolean
  onCreateCategory?: (name: string) => Promise<CategoryWithDynamicRelations>
}

export function CategoriesBlock({ 
  control, 
  postType, 
  blockId, 
  onUpdate,
  categories = [],
  disabled = false,
  onCreateCategory
}: CategoriesBlockProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)

  const handleCreateCategory = async (formData: any) => {
    setIsCreating(true)
    try {
      await createCategory(formData)
      toast.success("دسته‌بندی با موفقیت ایجاد شد")
      setIsDialogOpen(false)
      // Note: Parent should refresh categories list
    } catch (error) {
      console.error("Failed to create category:", error)
      toast.error("خطا در ایجاد دسته‌بندی")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="categoryIds"
        render={({ field }) => {
          const selectedIds = field.value || []
          
          const handleToggle = (categoryId: string, checked: boolean) => {
            const newValue = checked 
              ? [...selectedIds, categoryId]
              : selectedIds.filter((id: string) => id !== categoryId)
            
            field.onChange(newValue)
            onUpdate?.('categoryIds', newValue)
          }

          return (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>دسته‌بندی‌ها</FormLabel>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" type="button">
                      <Plus className="w-4 h-4 ml-2" />
                      جدید
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>دسته‌بندی جدید</DialogTitle>
                    </DialogHeader>
                    <CategoryForm
                      onSubmit={handleCreateCategory}
                      submitLabel={isCreating ? "در حال ایجاد..." : "ایجاد دسته‌بندی"}
                      parentOptions={categories.map(cat => ({
                        value: cat.id,
                        label: cat.name
                      }))}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              
              <FormControl>
                <ScrollArea className="h-40 w-full rounded-md border p-4">
                  {categories.length === 0 ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      هیچ دسته‌بندی یافت نشد
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedIds.includes(category.id)}
                            onCheckedChange={(checked) => 
                              handleToggle(category.id, !!checked)
                            }
                            disabled={disabled}
                          />
                          <Label 
                            htmlFor={`category-${category.id}`}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }}
      />
    </div>
  )
}
