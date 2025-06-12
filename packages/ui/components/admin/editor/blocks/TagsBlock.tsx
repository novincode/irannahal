"use client"

import * as React from "react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@ui/components/ui/form"
import { RelationField } from "../fields/SimpleRelationField"
import { Button } from "@ui/components/ui/button"
import { Plus } from "lucide-react"
import type { BlockProps } from "@data/usePostEditorStore"
import type { TagWithDynamicRelations } from "@actions/tags/types"

interface TagsBlockProps extends BlockProps {
  tags?: TagWithDynamicRelations[]
  multiple?: boolean
  disabled?: boolean
  allowCreate?: boolean
  onCreateTag?: (name: string) => Promise<TagWithDynamicRelations>
}

export function TagsBlock({ 
  control, 
  postType, 
  blockId, 
  onUpdate,
  tags = [],
  multiple = true,
  disabled = false,
  allowCreate = false,
  onCreateTag
}: TagsBlockProps) {
  const [isCreating, setIsCreating] = React.useState(false)
  const [newTagName, setNewTagName] = React.useState('')
  
  const handleCreateTag = async () => {
    if (!newTagName.trim() || !onCreateTag) return
    
    setIsCreating(true)
    try {
      const newTag = await onCreateTag(newTagName.trim())
      if (newTag) {
        // Add the new tag to the current selection
        const currentIds = control._getWatch('tagIds') || []
        const updatedIds = multiple ? [...currentIds, newTag.id] : [newTag.id]
        control._formValues.tagIds = updatedIds
        onUpdate?.('tagIds', updatedIds)
      }
      setNewTagName('')
    } catch (error) {
      console.error('Failed to create tag:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="tagIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>برچسب‌ها</FormLabel>
            <FormControl>
              <RelationField
                value={field.value || []}
                onChange={(value) => {
                  field.onChange(value)
                  onUpdate?.('tagIds', value)
                }}
                options={tags}
                multiple={multiple}
                disabled={disabled}
                placeholder="انتخاب برچسب..."
                searchPlaceholder="جستجوی برچسب..."
                renderOption={(tag: TagWithDynamicRelations) => (
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium">{tag.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {tag.slug}
                      </span>
                    </div>
                  </div>
                )}
                getOptionValue={(tag: TagWithDynamicRelations) => tag.id}
                getOptionLabel={(tag: TagWithDynamicRelations) => tag.name}
                isOptionSelected={(tag: TagWithDynamicRelations, selectedValues: string[] | string) => 
                  multiple 
                    ? (Array.isArray(selectedValues) ? selectedValues.includes(tag.id) : selectedValues === tag.id)
                    : selectedValues === tag.id
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {allowCreate && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="نام برچسب جدید..."
              className="flex-1 px-3 py-2 text-sm border border-input rounded-md"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleCreateTag()
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!newTagName.trim() || isCreating}
              onClick={handleCreateTag}
            >
              <Plus className="w-4 h-4" />
              {isCreating ? 'در حال ایجاد...' : 'افزودن'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
