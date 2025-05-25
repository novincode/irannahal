import * as React from "react"
import { Badge } from "@ui/components/ui/badge"
import { cn } from "@ui/lib/utils"
import { searchTags } from "@actions/tags/get"
import { createTag } from "@actions/tags/create"
import { slugify } from "@ui/lib/slug"
import { 
  Command, 
  CommandInput, 
  CommandList, 
  CommandItem, 
  CommandEmpty,
  CommandGroup
} from "@ui/components/ui/command"
import { useDebounce } from "@ui/hooks/useDebounce"

export interface TagOption {
  id: string
  name: string
  slug: string
}

interface TagSelectorFieldProps {
  value: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
  allowCreate?: boolean
  className?: string
  selectedObjects?: TagOption[]
}

export function TagSelectorField({
  value = [],
  onChange,
  disabled = false,
  allowCreate = true,
  className,
  selectedObjects
}: TagSelectorFieldProps) {
  // State
  const [input, setInput] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<TagOption[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  // Keep a local copy of all tags we know about (including newly created ones)
  const [allTags, setAllTags] = React.useState<TagOption[]>([])
  
  // Currently selected tag IDs
  const selectedIds = React.useMemo(() => new Set(value), [value])
  
  // Selected tags as objects
  const selectedTags = React.useMemo(() => {
    // Always derive from current selection for live reactivity
    return allTags.filter(tag => selectedIds.has(tag.id))
  }, [allTags, selectedIds])
  
  // Debounced input for search
  const debouncedInput = useDebounce(input, 500)

  // Debounced search for tags
  React.useEffect(() => {
    const value = debouncedInput
    if (!value.trim()) {
      setSearchResults([])
      return
    }
    setIsLoading(true)
    setError(null)
    let cancelled = false
    // Do NOT update input value or focus here, only update searchResults
    searchTags(value.trim())
      .then(results => {
        if (!cancelled) {
          setSearchResults(results)
          setAllTags(prev => {
            const existingIds = new Set(prev.map(t => t.id))
            const newTags = results.filter(t => !existingIds.has(t.id))
            return [...prev, ...newTags]
          })
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error('Failed to search tags:', err)
          setError('خطا در جستجوی برچسب‌ها')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [debouncedInput])
  
  // Currently filtered tags to show in dropdown
  const filteredTags = React.useMemo(() => {
    if (input.trim() === '') return allTags
    return searchResults
  }, [input, searchResults, allTags])
  
  // Add a tag to the selection
  const handleAddTag = (tag: TagOption) => {
    if (!selectedIds.has(tag.id)) {
      onChange([...value, tag.id])
      
      // Make sure the tag is in our local allTags
      if (!allTags.some(t => t.id === tag.id)) {
        setAllTags(prev => [...prev, tag])
      }
    }
    setInput('')
  }
  
  // Remove a tag from selection
  const handleRemoveTag = (tagId: string) => {
    onChange(value.filter(id => id !== tagId))
  }
  
  // Create a new tag from the current input
  const handleCreateTag = async () => {
    const name = input.trim()
    if (!name) return
    
    setIsCreating(true)
    setError(null)
    
    try {
      // Check if tag already exists by name or slug
      const slug = slugify(name)
      const existingTag = allTags.find(
        t => t.name.toLowerCase() === name.toLowerCase() || t.slug === slug
      )
      
      if (existingTag) {
        handleAddTag(existingTag)
        setInput('')
        return
      }
      
      // Create new tag
      const newTag = await createTag({ name, slug })
      
      if (newTag && newTag.id) {
        // Only add to selection; handleAddTag will add to allTags if needed
        handleAddTag(newTag)
        console.log('Created and added new tag:', newTag)
      }
    } catch (err) {
      console.error('Failed to create tag:', err)
      setError('خطا در ایجاد برچسب جدید')
    } finally {
      setIsCreating(false)
      setInput('')
    }
  }
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim() && allowCreate && !isCreating) {
      e.preventDefault()
      handleCreateTag()
    }
  }

  // Ref for CommandInput to force focus
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Ensure CommandInput keeps focus after search
  React.useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.focus()
    }
  }, [searchResults])

  // Ensure all selected tags are present in allTags on mount/prop change
  React.useEffect(() => {
    // If selectedObjects is provided, merge them in
    if (selectedObjects && selectedObjects.length > 0) {
      setAllTags(prev => {
        const existingIds = new Set(prev.map(t => t.id))
        const newTags = selectedObjects.filter(t => !existingIds.has(t.id))
        return [...prev, ...newTags]
      })
    }
  }, [selectedObjects])

  // If value changes and some IDs are missing from allTags, add them from selectedObjects if possible
  React.useEffect(() => {
    if (selectedObjects && selectedObjects.length > 0 && value.length > 0) {
      setAllTags(prev => {
        const existingIds = new Set(prev.map(t => t.id))
        const neededTags = selectedObjects.filter(t => value.includes(t.id) && !existingIds.has(t.id))
        return [...prev, ...neededTags]
      })
    }
  }, [value, selectedObjects])

  return (
    <div className={cn("w-full", className)}>
      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTags.map(tag => (
            <Badge 
              key={tag.id} 
              variant="secondary"
              className="text-xs cursor-pointer" 
              onClick={() => !disabled && handleRemoveTag(tag.id)}
            >
              {tag.name}
              <span className="ml-1.5 opacity-70">×</span>
            </Badge>
          ))}
        </div>
      )}
      
      {/* Tags search & creation */}
      <Command className="rounded-md border">
        <CommandInput
          ref={inputRef}
          placeholder="جستجو یا ایجاد برچسب..."
          value={input}
          onValueChange={setInput}
          onKeyDown={handleKeyDown}
          disabled={disabled || isCreating || isLoading}
          className="text-sm"
        />
        
        {error && (
          <div className="px-3 py-2 text-sm text-red-500">
            {error}
          </div>
        )}
        
        <CommandList className="max-h-64">
          {isLoading && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              در حال جستجو...
            </div>
          )}
          
          {!isLoading && input.trim() && filteredTags.length === 0 && (
            <CommandEmpty>
              <div className="px-1 py-2 text-sm">
                <div>برچسبی یافت نشد.</div>
                {allowCreate && (
                  <div className="mt-1">
                    <button
                      onClick={handleCreateTag}
                      disabled={isCreating || disabled}
                      className="text-primary hover:underline"
                    >
                      ایجاد برچسب "{input}"
                    </button>
                  </div>
                )}
              </div>
            </CommandEmpty>
          )}
          
          {filteredTags.length > 0 && (
            <CommandGroup>
              {filteredTags.map(tag => (
                <CommandItem
                  key={tag.id}
                  onSelect={() => handleAddTag(tag)}
                  disabled={selectedIds.has(tag.id) || disabled}
                  className={cn(
                    "text-sm cursor-pointer",
                    selectedIds.has(tag.id) && "opacity-50"
                  )}
                >
                  {tag.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {!isLoading && input.trim() && allowCreate && filteredTags.length > 0 && (
            <div className="px-3 py-2 border-t">
              <button
                onClick={handleCreateTag}
                disabled={isCreating || disabled}
                className="text-sm text-primary hover:underline"
              >
                ایجاد برچسب جدید: "{input}"
              </button>
            </div>
          )}
        </CommandList>
      </Command>
    </div>
  )
}
