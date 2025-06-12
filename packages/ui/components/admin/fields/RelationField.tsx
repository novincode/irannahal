"use client"

import * as React from "react"
import { Badge } from "@ui/components/ui/badge"
import { Button } from "@ui/components/ui/button"
import { Input } from "@ui/components/ui/input"
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from "@ui/components/ui/command"
import { useDebounce } from "@ui/hooks/useDebounce"
import { cn } from "@ui/lib/utils"

// ==========================================
// TYPES
// ==========================================

export interface RelationItem {
  id: string
  name: string
  slug?: string
  [key: string]: any
}

export interface RelationFieldProps<T extends RelationItem> {
  name: string
  value: string[]
  onChange: (ids: string[]) => void
  searchFn: (query: string) => Promise<T[]>
  createFn?: (data: { name: string; slug: string }) => Promise<T>
  selectedObjects?: T[]
  placeholder?: string
  disabled?: boolean
  allowCreate?: boolean
  multiple?: boolean
  className?: string
  renderItem?: (item: T) => React.ReactNode
  renderSelected?: (item: T) => React.ReactNode
}

// ==========================================
// COMPONENT
// ==========================================

export function RelationField<T extends RelationItem>({
  name,
  value = [],
  onChange,
  searchFn,
  createFn,
  selectedObjects = [],
  placeholder = "جستجو...",
  disabled = false,
  allowCreate = false,
  multiple = true,
  className,
  renderItem,
  renderSelected
}: RelationFieldProps<T>) {
  const [input, setInput] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<T[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [allItems, setAllItems] = React.useState<T[]>([])

  const debouncedInput = useDebounce(input, 300)
  const selectedIds = React.useMemo(() => new Set(value), [value])

  // Selected items for display
  const selectedItems = React.useMemo(() => {
    if (selectedObjects.length > 0) {
      return selectedObjects.filter(item => selectedIds.has(item.id))
    }
    return allItems.filter(item => selectedIds.has(item.id))
  }, [selectedObjects, allItems, selectedIds])

  // Search items
  React.useEffect(() => {
    if (!debouncedInput.trim()) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    setError(null)
    
    searchFn(debouncedInput.trim())
      .then(results => {
        setSearchResults(results)
        setAllItems(prev => {
          const existingIds = new Set(prev.map(item => item.id))
          const newItems = results.filter(item => !existingIds.has(item.id))
          return [...prev, ...newItems]
        })
      })
      .catch(err => {
        console.error('Search failed:', err)
        setError('خطا در جستجو')
      })
      .finally(() => setIsLoading(false))
  }, [debouncedInput, searchFn])

  // Initialize with selected objects
  React.useEffect(() => {
    if (selectedObjects.length > 0) {
      setAllItems(prev => {
        const existingIds = new Set(prev.map(item => item.id))
        const newItems = selectedObjects.filter(item => !existingIds.has(item.id))
        return prev.length === 0 ? selectedObjects : [...prev, ...newItems]
      })
    }
  }, [selectedObjects])

  const handleAdd = (item: T) => {
    if (multiple) {
      if (!selectedIds.has(item.id)) {
        onChange([...value, item.id])
      }
    } else {
      onChange([item.id])
    }
    setInput('')
  }

  const handleRemove = (itemId: string) => {
    onChange(value.filter(id => id !== itemId))
  }

  const handleCreate = async () => {
    if (!createFn || !input.trim()) return

    setIsCreating(true)
    setError(null)

    try {
      const slug = input.trim().toLowerCase().replace(/\s+/g, '-')
      const newItem = await createFn({ name: input.trim(), slug })
      
      if (newItem?.id) {
        setAllItems(prev => [...prev, newItem])
        handleAdd(newItem)
      }
    } catch (err) {
      console.error('Create failed:', err)
      setError('خطا در ایجاد آیتم جدید')
    } finally {
      setIsCreating(false)
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim() && allowCreate && createFn && !isCreating) {
      e.preventDefault()
      handleCreate()
    }
  }

  const defaultRenderItem = (item: T) => item.name
  const defaultRenderSelected = (item: T) => (
    <Badge 
      variant="secondary"
      className="text-xs cursor-pointer" 
      onClick={() => !disabled && handleRemove(item.id)}
    >
      {item.name}
      <span className="ml-1.5 opacity-70">×</span>
    </Badge>
  )

  return (
    <div className={cn("w-full", className)}>
      {/* Selected items */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedItems.map((item, index) => (
            <div key={item.id || `item-${index}`}>
              {renderSelected ? renderSelected(item) : defaultRenderSelected(item)}
            </div>
          ))}
        </div>
      )}

      {/* Search & create */}
      <Command className="rounded-md border">
        <CommandInput
          placeholder={placeholder}
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

          {!isLoading && input.trim() && searchResults.length === 0 && (
            <CommandEmpty>
              <div className="px-1 py-2 text-sm">
                <div>نتیجه‌ای یافت نشد.</div>
                {allowCreate && createFn && (
                  <div className="mt-1">
                    <button
                      onClick={handleCreate}
                      disabled={isCreating || disabled}
                      className="text-primary hover:underline"
                    >
                      ایجاد "{input}"
                    </button>
                  </div>
                )}
              </div>
            </CommandEmpty>
          )}

          {searchResults.length > 0 && (
            <CommandGroup>
              {searchResults.map((item, index) => (
                <CommandItem
                  key={item.id || `result-${index}`}
                  onSelect={() => handleAdd(item)}
                  disabled={selectedIds.has(item.id) || disabled}
                  className={cn(
                    "text-sm cursor-pointer",
                    selectedIds.has(item.id) && "opacity-50"
                  )}
                >
                  {renderItem ? renderItem(item) : defaultRenderItem(item)}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!isLoading && input.trim() && allowCreate && createFn && searchResults.length > 0 && (
            <div className="px-3 py-2 border-t">
              <button
                onClick={handleCreate}
                disabled={isCreating || disabled}
                className="text-sm text-primary hover:underline"
              >
                ایجاد جدید: "{input}"
              </button>
            </div>
          )}
        </CommandList>
      </Command>
    </div>
  )
}
