"use client"

import * as React from "react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@ui/components/ui/form"
import { Input } from "@ui/components/ui/input"
import { Button } from "@ui/components/ui/button"
import { Badge } from "@ui/components/ui/badge"
import { X, Plus, Search } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@ui/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@ui/components/ui/popover"
import { searchTags } from "@actions/tags/get"
import { createTag } from "@actions/tags/create"
import { toast } from "sonner"
import type { BlockProps } from "@data/usePostEditorStore"
import type { TagWithDynamicRelations } from "@actions/tags/types"

interface TagsBlockProps extends BlockProps {
  tags?: TagWithDynamicRelations[]
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
  disabled = false,
  allowCreate = true,
  onCreateTag
}: TagsBlockProps) {
  const [searchValue, setSearchValue] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<TagWithDynamicRelations[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)

  // Debounced search
  React.useEffect(() => {
    if (!searchValue) {
      setSearchResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await searchTags(searchValue)
        setSearchResults(results)
      } catch (error) {
        console.error("Search failed:", error)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchValue])

  const handleCreateTag = async () => {
    if (!searchValue.trim()) return
    
    setIsCreating(true)
    try {
      const newTag = await createTag({ 
        name: searchValue.trim(),
        slug: searchValue.trim().toLowerCase().replace(/\s+/g, '-')
      })
      toast.success("برچسب جدید ایجاد شد")
      
      // Add to current selection
      const currentTagIds = control._getWatch('tagIds') || []
      const updatedTagIds = [...currentTagIds, newTag.id]
      control._formValues.tagIds = updatedTagIds
      onUpdate?.('tagIds', updatedTagIds)
      
      setSearchValue("")
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to create tag:", error)
      toast.error("خطا در ایجاد برچسب")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="tagIds"
        render={({ field }) => {
          const selectedIds = field.value || []
          const selectedTags = tags.filter(tag => selectedIds.includes(tag.id))
          
          const handleAddTag = (tagId: string) => {
            if (!selectedIds.includes(tagId)) {
              const newValue = [...selectedIds, tagId]
              field.onChange(newValue)
              onUpdate?.('tagIds', newValue)
            }
            setSearchValue("")
            setIsOpen(false)
          }

          const handleRemoveTag = (tagId: string) => {
            const newValue = selectedIds.filter((id: string) => id !== tagId)
            field.onChange(newValue)
            onUpdate?.('tagIds', newValue)
          }

          const availableResults = searchResults.filter(tag => 
            !selectedIds.includes(tag.id)
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
                          className="flex items-center gap-1 px-2 py-1"
                        >
                          {tag.name}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1"
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
                  <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <Input
                          placeholder="جستجو یا اضافه کردن برچسب..."
                          value={searchValue}
                          onChange={(e) => {
                            setSearchValue(e.target.value)
                            setIsOpen(!!e.target.value)
                          }}
                          disabled={disabled}
                          className="pr-8"
                        />
                        <Search className="absolute right-2 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                    </PopoverTrigger>
                    
                    {searchValue && (
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandList>
                            {isSearching ? (
                              <CommandEmpty>در حال جستجو...</CommandEmpty>
                            ) : (
                              <>
                                {availableResults.length > 0 && (
                                  <CommandGroup heading="برچسب‌های موجود">
                                    {availableResults.map((tag) => (
                                      <CommandItem
                                        key={tag.id}
                                        onSelect={() => handleAddTag(tag.id)}
                                        className="cursor-pointer"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline" className="text-xs">
                                            {tag.name}
                                          </Badge>
                                          <span className="text-sm text-muted-foreground">
                                            {tag.slug}
                                          </span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                )}
                                
                                {allowCreate && searchValue.trim() && (
                                  <CommandGroup heading="ایجاد جدید">
                                    <CommandItem
                                      onSelect={handleCreateTag}
                                      className="cursor-pointer"
                                      disabled={isCreating}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        <span>
                                          {isCreating 
                                            ? "در حال ایجاد..." 
                                            : `ایجاد "${searchValue}"`
                                          }
                                        </span>
                                      </div>
                                    </CommandItem>
                                  </CommandGroup>
                                )}
                                
                                {!isSearching && availableResults.length === 0 && !allowCreate && (
                                  <CommandEmpty>برچسبی یافت نشد</CommandEmpty>
                                )}
                              </>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    )}
                  </Popover>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }}
      />
    </div>
  )
}
