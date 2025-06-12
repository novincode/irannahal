"use client"

import * as React from "react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@ui/components/ui/form"
import { Badge } from "@ui/components/ui/badge"
import { Button } from "@ui/components/ui/button"
import { Input } from "@ui/components/ui/input"
import { X, Plus } from "lucide-react"
import { toast } from "sonner"

import type { BlockProps } from "@data/usePostEditorStore"
import type { TagWithDynamicRelations } from "@actions/tags/types"
import { createTag } from "@actions/tags/create"
import { getTags } from "@actions/tags/get"

interface TagsBlockProps extends BlockProps {
  tags?: TagWithDynamicRelations[]
  disabled?: boolean
  onCreateTag?: (name: string) => Promise<TagWithDynamicRelations>
  onTagsUpdated?: (tags: TagWithDynamicRelations[]) => void
}

export function TagsBlock({ 
  control, 
  postType, 
  blockId, 
  onUpdate,
  tags: initialTags = [],
  disabled = false,
  onCreateTag,
  onTagsUpdated
}: TagsBlockProps) {
  const [allTags, setAllTags] = React.useState<TagWithDynamicRelations[]>(initialTags)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [isCreating, setIsCreating] = React.useState(false)

  // Load tags on mount
  React.useEffect(() => {
    if (initialTags.length === 0) {
      getTags().then(setAllTags).catch(console.error)
    } else {
      setAllTags(initialTags)
    }
  }, [])

  // Filter tags based on search
  const filteredTags = React.useMemo(() => {
    if (!searchTerm) return []
    return allTags.filter(tag => 
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5) // Limit to 5 suggestions
  }, [allTags, searchTerm])

  const handleCreateTag = async (name: string) => {
    setIsCreating(true)
    try {
      let newTag: TagWithDynamicRelations

      if (onCreateTag) {
        newTag = await onCreateTag(name.trim())
      } else {
        newTag = await createTag({ 
          name: name.trim(), 
          slug: name.trim().toLowerCase().replace(/\s+/g, "-")
        })
      }

      const updatedTags = [...allTags, newTag]
      setAllTags(updatedTags)
      onTagsUpdated?.(updatedTags)
      
      return newTag
    } catch (error) {
      console.error("Failed to create tag:", error)
      toast.error("خطا در ایجاد برچسب")
      throw error
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <FormField
      control={control}
      name="tagIds"
      render={({ field }) => {
        const selectedIds = Array.isArray(field.value) ? field.value : []
        const selectedTags = allTags.filter(tag => selectedIds.includes(tag.id))

        console.log('=== TAGS BLOCK DEBUG ===')
        console.log('field.value:', field.value)
        console.log('selectedIds:', selectedIds)
        console.log('selectedTags:', selectedTags.map(t => ({ id: t.id, name: t.name })))
        console.log('available tags:', allTags.map(t => ({ id: t.id, name: t.name })))

        const handleAddTag = async (tag: TagWithDynamicRelations) => {
          if (!selectedIds.includes(tag.id)) {
            const newValue = [...selectedIds, tag.id]
            field.onChange(newValue)
          }
          setSearchTerm("")
        }

        const handleRemoveTag = (tagId: string) => {
          const newValue = selectedIds.filter((id: string) => id !== tagId)
          field.onChange(newValue)
        }

        const handleCreateAndAdd = async () => {
          if (!searchTerm.trim()) return
          
          try {
            const newTag = await handleCreateTag(searchTerm.trim())
            await handleAddTag(newTag)
            toast.success("برچسب ایجاد و اضافه شد")
          } catch (error) {
            // Error already handled in handleCreateTag
          }
        }

        const exactMatch = allTags.find(tag => 
          tag.name.toLowerCase() === searchTerm.toLowerCase()
        )

        return (
          <FormItem>
            <FormLabel>برچسب‌ها</FormLabel>
            <FormControl>
              <div className="space-y-3">
                {/* Selected Tags */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <Badge 
                        key={tag.id} 
                        variant="secondary" 
                        className="flex items-center gap-1"
                      >
                        {tag.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 hover:bg-transparent ml-1"
                          onClick={() => handleRemoveTag(tag.id)}
                          disabled={disabled}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Search Input */}
                <div className="relative">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="جستجو یا ایجاد برچسب..."
                    disabled={disabled}
                    className="w-full"
                  />
                  
                  {/* Suggestions Dropdown */}
                  {searchTerm && (
                    <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredTags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          className="w-full text-right px-3 py-2 text-sm hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                          onClick={() => handleAddTag(tag)}
                          disabled={selectedIds.includes(tag.id)}
                        >
                          <span className={selectedIds.includes(tag.id) ? "text-gray-400" : ""}>
                            {tag.name}
                            {selectedIds.includes(tag.id) && " (انتخاب شده)"}
                          </span>
                        </button>
                      ))}
                      
                      {/* Create new tag option */}
                      {searchTerm && !exactMatch && (
                        <button
                          type="button"
                          className="w-full text-right px-3 py-2 text-sm hover:bg-blue-50 text-blue-600 border-t border-gray-200"
                          onClick={handleCreateAndAdd}
                          disabled={isCreating}
                        >
                          <Plus className="w-4 h-4 inline ml-2" />
                          {isCreating ? "در حال ایجاد..." : `ایجاد "${searchTerm}"`}
                        </button>
                      )}
                      
                      {filteredTags.length === 0 && !searchTerm && (
                        <div className="px-3 py-2 text-sm text-gray-500 text-center">
                          برچسبی یافت نشد
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
