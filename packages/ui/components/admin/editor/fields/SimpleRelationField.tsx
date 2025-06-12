"use client"

import * as React from "react"
import { Badge } from "@ui/components/ui/badge"
import { Button } from "@ui/components/ui/button"
import { Input } from "@ui/components/ui/input"
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@ui/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@ui/lib/utils"

// ==========================================
// TYPES
// ==========================================

export interface SimpleRelationItem {
  id: string
  name: string
  [key: string]: any
}

export interface SimpleRelationFieldProps<T = SimpleRelationItem> {
  value: string[] | string
  onChange: (value: string[] | string) => void
  options: T[]
  multiple?: boolean
  disabled?: boolean
  placeholder?: string
  searchPlaceholder?: string
  renderOption?: (item: T) => React.ReactNode
  getOptionValue?: (item: T) => string
  getOptionLabel?: (item: T) => string
  isOptionSelected?: (item: T, selectedValues: string[] | string) => boolean
  className?: string
}

// ==========================================
// COMPONENT
// ==========================================

export function RelationField<T extends SimpleRelationItem = SimpleRelationItem>({
  value,
  onChange,
  options = [],
  multiple = true,
  disabled = false,
  placeholder = "انتخاب کنید...",
  searchPlaceholder = "جستجو...",
  renderOption,
  getOptionValue = (item) => item.id,
  getOptionLabel = (item) => item.name,
  isOptionSelected,
  className
}: SimpleRelationFieldProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  
  const selectedValues = React.useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : []
    }
    return Array.isArray(value) ? value[0] || '' : value || ''
  }, [value, multiple])
  
  const filteredOptions = React.useMemo(() => {
    if (!search) return options
    return options.filter(option => 
      getOptionLabel(option).toLowerCase().includes(search.toLowerCase())
    )
  }, [options, search, getOptionLabel])
  
  const selectedItems = React.useMemo(() => {
    if (multiple) {
      const selectedIds = Array.isArray(selectedValues) ? selectedValues : []
      return options.filter(option => selectedIds.includes(getOptionValue(option)))
    }
    const selectedId = Array.isArray(selectedValues) ? selectedValues[0] : selectedValues
    return selectedId ? options.filter(option => getOptionValue(option) === selectedId) : []
  }, [options, selectedValues, multiple, getOptionValue])
  
  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(selectedValues) ? selectedValues : []
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue]
      onChange(newValues)
    } else {
      onChange(optionValue)
      setOpen(false)
    }
  }
  
  const handleRemove = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(selectedValues) ? selectedValues : []
      onChange(currentValues.filter(v => v !== optionValue))
    } else {
      onChange('')
    }
  }
  
  const isSelected = (option: T) => {
    if (isOptionSelected) {
      return isOptionSelected(option, selectedValues)
    }
    
    const optionValue = getOptionValue(option)
    if (multiple) {
      const currentValues = Array.isArray(selectedValues) ? selectedValues : []
      return currentValues.includes(optionValue)
    }
    return selectedValues === optionValue
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected Items */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedItems.map((item) => (
            <Badge key={getOptionValue(item)} variant="secondary" className="gap-1">
              {getOptionLabel(item)}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(getOptionValue(item))}
                  className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
      
      {/* Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedItems.length > 0 ? (
              multiple ? 
                `${selectedItems.length} مورد انتخاب شده` : 
                getOptionLabel(selectedItems[0])
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder={searchPlaceholder} 
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>موردی یافت نشد.</CommandEmpty>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={getOptionValue(option)}
                  onSelect={() => handleSelect(getOptionValue(option))}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isSelected(option) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {renderOption ? renderOption(option) : getOptionLabel(option)}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
