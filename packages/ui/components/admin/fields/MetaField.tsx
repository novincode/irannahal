"use client"

import * as React from "react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@ui/components/ui/form"
import { Input } from "@ui/components/ui/input"
import { Textarea } from "@ui/components/ui/textarea"
import { Checkbox } from "@ui/components/ui/checkbox"
import { Switch } from "@ui/components/ui/switch"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@ui/components/ui/select"
import { Button } from "@ui/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/ui/card"
import { Badge } from "@ui/components/ui/badge"
import { Trash2, Plus, GripVertical } from "lucide-react"
import { Controller } from "react-hook-form"
import { cn } from "@ui/lib/utils"

// ==========================================
// TYPES
// ==========================================

export type MetaFieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'email' 
  | 'url' 
  | 'password'
  | 'checkbox' 
  | 'switch'
  | 'select'
  | 'multi-select'
  | 'key-value'
  | 'repeater'

export interface MetaFieldOption {
  value: string
  label: string
}

export interface MetaFieldProps {
  control: any
  name: string
  label?: string
  description?: string
  type?: MetaFieldType
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: MetaFieldOption[]
  min?: number
  max?: number
  step?: number
  rows?: number
  className?: string
}

// ==========================================
// COMPONENT
// ==========================================

export function MetaField({
  control,
  name,
  label,
  description,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  options = [],
  min,
  max,
  step,
  rows = 3,
  className
}: MetaFieldProps) {
  const renderField = (field: any) => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            {...field}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className="resize-none"
          />
        )

      case 'number':
        return (
          <Input
            {...field}
            type="number"
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          />
        )

      case 'email':
        return (
          <Input
            {...field}
            type="email"
            placeholder={placeholder}
            disabled={disabled}
          />
        )

      case 'url':
        return (
          <Input
            {...field}
            type="url"
            placeholder={placeholder}
            disabled={disabled}
          />
        )

      case 'password':
        return (
          <Input
            {...field}
            type="password"
            placeholder={placeholder}
            disabled={disabled}
          />
        )

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
            {label && (
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {label}
              </label>
            )}
          </div>
        )

      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
            {label && (
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {label}
              </label>
            )}
          </div>
        )

      case 'select':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
                <SelectTrigger>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )

      case 'key-value':
        return <KeyValueField control={control} name={name} disabled={disabled} />

      case 'repeater':
        return <RepeaterField control={control} name={name} disabled={disabled} />

      default:
        return (
          <Input
            {...field}
            type="text"
            placeholder={placeholder}
            disabled={disabled}
          />
        )
    }
  }

  // Handle checkbox and switch differently as they don't need FormControl
  if (type === 'checkbox' || type === 'switch') {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className={className}>
            <FormControl>
              {renderField(field)}
            </FormControl>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && !['checkbox', 'switch'].includes(type) && (
            <FormLabel className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
              {label}
            </FormLabel>
          )}
          <FormControl>
            {renderField(field)}
          </FormControl>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// ==========================================
// KEY-VALUE FIELD
// ==========================================

function KeyValueField({ control, name, disabled }: { control: any; name: string; disabled?: boolean }) {
  const [items, setItems] = React.useState<Array<{ key: string; value: string }>>([])

  React.useEffect(() => {
    const subscription = control._getWatch(name, (value: any) => {
      if (Array.isArray(value)) {
        setItems(value)
      }
    })
    return () => subscription.unsubscribe()
  }, [control, name])

  const addItem = () => {
    const newItems = [...items, { key: '', value: '' }]
    setItems(newItems)
    control._setValue(name, newItems)
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    control._setValue(name, newItems)
  }

  const updateItem = (index: number, field: 'key' | 'value', newValue: string) => {
    const newItems = [...items]
    newItems[index][field] = newValue
    setItems(newItems)
    control._setValue(name, newItems)
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 items-center">
          <Input
            placeholder="کلید"
            value={item.key}
            onChange={e => updateItem(index, 'key', e.target.value)}
            disabled={disabled}
            className="flex-1"
          />
          <Input
            placeholder="مقدار"
            value={item.value}
            onChange={e => updateItem(index, 'value', e.target.value)}
            disabled={disabled}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeItem(index)}
            disabled={disabled}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addItem}
        disabled={disabled}
      >
        <Plus className="w-4 h-4 ml-2" />
        افزودن ردیف
      </Button>
    </div>
  )
}

// ==========================================
// REPEATER FIELD
// ==========================================

function RepeaterField({ control, name, disabled }: { control: any; name: string; disabled?: boolean }) {
  const [items, setItems] = React.useState<string[]>([])

  React.useEffect(() => {
    const subscription = control._getWatch(name, (value: any) => {
      if (Array.isArray(value)) {
        setItems(value)
      }
    })
    return () => subscription.unsubscribe()
  }, [control, name])

  const addItem = () => {
    const newItems = [...items, '']
    setItems(newItems)
    control._setValue(name, newItems)
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    control._setValue(name, newItems)
  }

  const updateItem = (index: number, value: string) => {
    const newItems = [...items]
    newItems[index] = value
    setItems(newItems)
    control._setValue(name, newItems)
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 items-center">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`آیتم ${index + 1}`}
            value={item}
            onChange={e => updateItem(index, e.target.value)}
            disabled={disabled}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeItem(index)}
            disabled={disabled}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addItem}
        disabled={disabled}
      >
        <Plus className="w-4 h-4 ml-2" />
        افزودن آیتم
      </Button>
    </div>
  )
}
