"use client"

import * as React from "react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@ui/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/components/ui/select"
import { Button } from "@ui/components/ui/button"
import type { BlockProps } from "@data/usePostEditorStore"

interface StatusBlockProps extends BlockProps {
  submitLabel?: string
  isLoading?: boolean
}

export function StatusBlock({ 
  control, 
  postType, 
  blockId, 
  onUpdate, 
  submitLabel = "ذخیره", 
  isLoading = false 
}: StatusBlockProps) {
  const getStatusOptions = () => {
    if (postType === 'product') {
      return [
        { value: 'draft', label: 'پیش‌نویس' },
        { value: 'active', label: 'فعال' },
        { value: 'inactive', label: 'غیرفعال' },
        { value: 'out_of_stock', label: 'ناموجود' }
      ]
    }
    
    return [
      { value: 'draft', label: 'پیش‌نویس' },
      { value: 'published', label: 'منتشر شده' },
      { value: 'private', label: 'خصوصی' },
      { value: 'pending', label: 'در انتظار بررسی' }
    ]
  }

  return (
    <div className="space-y-4">
      <FormField 
        control={control} 
        name="status" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>وضعیت انتشار</FormLabel>
            <FormControl>
              <Select 
                dir="rtl"
                onValueChange={(value) => {
                  field.onChange(value)
                  onUpdate?.('status', value)
                }}
                value={field.value} 
                defaultValue={field.value || "draft"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  {getStatusOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
      
      <Button 
        type="submit" 
        disabled={isLoading} 
        className="w-full"
        size="default"
      >
        {isLoading ? "در حال ذخیره..." : submitLabel}
      </Button>
    </div>
  )
}
