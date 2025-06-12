"use client"

import * as React from "react"
import { Input } from "@ui/components/ui/input"
import { Textarea } from "@ui/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/components/ui/select"
import { Checkbox } from "@ui/components/ui/checkbox"
import { Switch } from "@ui/components/ui/switch"
import { Button } from "@ui/components/ui/button"
import { Label } from "@ui/components/ui/label"
import { Card, CardContent } from "@ui/components/ui/card"
import { Trash2, Plus } from "lucide-react"

// ==========================================
// TYPES
// ==========================================

export type MetaFieldType = 
  | "text" 
  | "textarea" 
  | "number" 
  | "email" 
  | "password" 
  | "url"
  | "select" 
  | "multi-select"
  | "checkbox" 
  | "switch"
  | "key-value" 
  | "repeater"

export interface MetaFieldOption {
  label: string
  value: string
}

export interface MetaFieldConfig {
  type: MetaFieldType
  label: string
  placeholder?: string
  required?: boolean
  options?: MetaFieldOption[]
  defaultValue?: any
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

export interface MetaFieldProps {
  name: string
  config: MetaFieldConfig
  value?: any
  onChange: (value: any) => void
  disabled?: boolean
  className?: string
}

// ==========================================
// COMPONENT
// ==========================================

export function MetaField({
  name,
  config,
  value,
  onChange,
  disabled = false,
  className
}: MetaFieldProps) {
  const { type, label, placeholder, options = [], required = false } = config

  const renderField = () => {
    switch (type) {
      case "text":
      case "email":
      case "password":
      case "url":
        return (
          <Input
            type={type}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
          />
        )

      case "number":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
          />
        )

      case "textarea":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={4}
          />
        )

      case "select":
        return (
          <Select
            value={value || ""}
            onValueChange={onChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "multi-select":
        const selectedValues = Array.isArray(value) ? value : []
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${name}-${option.value}`}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange([...selectedValues, option.value])
                    } else {
                      onChange(selectedValues.filter((v) => v !== option.value))
                    }
                  }}
                  disabled={disabled}
                />
                <Label htmlFor={`${name}-${option.value}`}>
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={!!value}
              onCheckedChange={onChange}
              disabled={disabled}
            />
            <Label htmlFor={name}>{label}</Label>
          </div>
        )

      case "switch":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={name}
              checked={!!value}
              onCheckedChange={onChange}
              disabled={disabled}
            />
            <Label htmlFor={name}>{label}</Label>
          </div>
        )

      case "key-value":
        const keyValuePairs = Array.isArray(value) ? value : []
        return (
          <div className="space-y-2">
            {keyValuePairs.map((pair: { key: string; value: string }, index: number) => (
              <Card key={index}>
                <CardContent className="p-3">
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="کلید"
                      value={pair.key || ""}
                      onChange={(e) => {
                        const newPairs = [...keyValuePairs]
                        newPairs[index] = { ...pair, key: e.target.value }
                        onChange(newPairs)
                      }}
                      disabled={disabled}
                    />
                    <Input
                      placeholder="مقدار"
                      value={pair.value || ""}
                      onChange={(e) => {
                        const newPairs = [...keyValuePairs]
                        newPairs[index] = { ...pair, value: e.target.value }
                        onChange(newPairs)
                      }}
                      disabled={disabled}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newPairs = keyValuePairs.filter((_: any, i: number) => i !== index)
                        onChange(newPairs)
                      }}
                      disabled={disabled}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange([...keyValuePairs, { key: "", value: "" }])}
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-2" />
              افزودن
            </Button>
          </div>
        )

      case "repeater":
        const repeaterValues = Array.isArray(value) ? value : []
        return (
          <div className="space-y-2">
            {repeaterValues.map((item: string, index: number) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={item || ""}
                  onChange={(e) => {
                    const newValues = [...repeaterValues]
                    newValues[index] = e.target.value
                    onChange(newValues)
                  }}
                  placeholder={placeholder}
                  disabled={disabled}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newValues = repeaterValues.filter((_: any, i: number) => i !== index)
                    onChange(newValues)
                  }}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange([...repeaterValues, ""])}
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-2" />
              افزودن
            </Button>
          </div>
        )

      default:
        return (
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
          />
        )
    }
  }

  return (
    <div className={className}>
      {type !== "checkbox" && type !== "switch" && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <div className="mt-1">
        {renderField()}
      </div>
    </div>
  )
}
