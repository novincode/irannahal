"use client"

import * as React from "react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@ui/components/ui/form"
import { Checkbox } from "@ui/components/ui/checkbox"
import { Label } from "@ui/components/ui/label"
import { ScrollArea } from "@ui/components/ui/scroll-area"
import { Button } from "@ui/components/ui/button"
import { Input } from "@ui/components/ui/input"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@ui/components/ui/dialog"
import type { BlockProps } from "@data/usePostEditorStore"
import type { CategoryWithDynamicRelations } from "@actions/categories/types"
import { createCategory } from "@actions/categories/create"
import { getCategories } from "@actions/categories/get"
import { toast } from "sonner"

interface CategoriesBlockProps extends BlockProps {
  categories?: CategoryWithDynamicRelations[]
  disabled?: boolean
  onCreateCategory?: (name: string) => Promise<CategoryWithDynamicRelations>
  onCategoriesUpdated?: (categories: CategoryWithDynamicRelations[]) => void
}

export function CategoriesBlock({ 
  control, 
  postType, 
  blockId, 
  onUpdate,
  categories: initialCategories = [],
  disabled = false,
  onCreateCategory,
  onCategoriesUpdated
}: CategoriesBlockProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  const [categories, setCategories] = React.useState<CategoryWithDynamicRelations[]>(initialCategories)
  const [newCategoryName, setNewCategoryName] = React.useState("")

  // Load categories on mount if not provided
  React.useEffect(() => {
    if (initialCategories.length === 0) {
      getCategories().then(setCategories).catch(console.error)
    } else {
      setCategories(initialCategories)
    }
  }, [])

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    setIsCreating(true)
    try {
      let newCategory: CategoryWithDynamicRelations

      if (onCreateCategory) {
        newCategory = await onCreateCategory(newCategoryName.trim())
      } else {
        newCategory = await createCategory({ 
          name: newCategoryName.trim(), 
          slug: newCategoryName.trim().toLowerCase().replace(/\s+/g, "-")
        })
      }

      toast.success("دسته‌بندی با موفقیت ایجاد شد")
      
      const updatedCategories = [...categories, newCategory]
      setCategories(updatedCategories)
      onCategoriesUpdated?.(updatedCategories)
      
      setNewCategoryName("")
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Failed to create category:", error)
      toast.error("خطا در ایجاد دسته‌بندی")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <FormField
      control={control}
      name="categoryIds"
      render={({ field }) => {
        const selectedIds = Array.isArray(field.value) ? field.value : []
        
        console.log('=== CATEGORIES BLOCK DEBUG ===')
        console.log('field.value:', field.value)
        console.log('selectedIds:', selectedIds)
        console.log('available categories:', categories.map(c => ({ id: c.id, name: c.name })))
        
        const handleToggle = (categoryId: string, checked: boolean) => {
          const newValue = checked 
            ? [...selectedIds, categoryId]
            : selectedIds.filter((id: string) => id !== categoryId)
          
          console.log('Category toggle:', categoryId, checked, 'new value:', newValue)
          field.onChange(newValue)
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
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="category-name">نام دسته‌بندی</Label>
                      <Input
                        id="category-name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="نام دسته‌بندی را وارد کنید"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        type="button"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        لغو
                      </Button>
                      <Button 
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={isCreating || !newCategoryName.trim()}
                      >
                        {isCreating ? "در حال ایجاد..." : "ایجاد"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <FormControl>
              <ScrollArea className="h-48 border rounded-md p-3">
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedIds.includes(category.id)}
                        onCheckedChange={(checked) => 
                          handleToggle(category.id, checked === true)
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
                  {categories.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      هیچ دسته‌بندی موجود نیست
                    </p>
                  )}
                </div>
              </ScrollArea>
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
