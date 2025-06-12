"use client"

import * as React from "react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@ui/components/ui/form"
import { RelationField } from "../fields/SimpleRelationField"
import type { BlockProps } from "@data/usePostEditorStore"
import type { CategoryWithDynamicRelations } from "@actions/categories/types"

interface CategoriesBlockProps extends BlockProps {
  categories?: CategoryWithDynamicRelations[]
  multiple?: boolean
  disabled?: boolean
}

export function CategoriesBlock({ 
  control, 
  postType, 
  blockId, 
  onUpdate,
  categories = [],
  multiple = true,
  disabled = false
}: CategoriesBlockProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="categoryIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>دسته‌بندی‌ها</FormLabel>
            <FormControl>
              <RelationField
                value={field.value || []}
                onChange={(value: string[] | string) => {
                  field.onChange(value)
                  onUpdate?.('categoryIds', value)
                }}
                options={categories}
                multiple={multiple}
                disabled={disabled}
                placeholder="انتخاب دسته‌بندی..."
                searchPlaceholder="جستجوی دسته‌بندی..."
                renderOption={(category: CategoryWithDynamicRelations) => (
                  <div className="flex flex-col">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ID: {category.id}
                    </span>
                  </div>
                )}
                getOptionValue={(category: CategoryWithDynamicRelations) => category.id}
                getOptionLabel={(category: CategoryWithDynamicRelations) => category.name}
                isOptionSelected={(category: CategoryWithDynamicRelations, selectedValues: string[] | string) => 
                  multiple 
                    ? (Array.isArray(selectedValues) ? selectedValues.includes(category.id) : selectedValues === category.id)
                    : selectedValues === category.id
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
