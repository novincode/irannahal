"use client"

import * as React from "react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@ui/components/ui/form"
import { Input } from "@ui/components/ui/input"
import { Textarea } from "@ui/components/ui/textarea"
import type { BlockProps } from "@data/usePostEditorStore"

interface MainInfoBlockProps extends BlockProps {
  // Additional props specific to MainInfoBlock
}

export function MainInfoBlock({ control, postType, blockId, onUpdate }: MainInfoBlockProps) {
  return (
    <div className="space-y-4">
      <FormField 
        control={control} 
        name="name" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>نام {postType === 'product' ? 'محصول' : 'پست'}</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                placeholder={`نام ${postType === 'product' ? 'محصول' : 'پست'} را وارد کنید`}
                onChange={(e) => {
                  field.onChange(e)
                  onUpdate?.('name', e.target.value)
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
      
      <FormField 
        control={control} 
        name="slug" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>نامک (Slug)</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                placeholder="product-slug-example"
                onChange={(e) => {
                  field.onChange(e)
                  onUpdate?.('slug', e.target.value)
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
      
      <FormField 
        control={control} 
        name="description" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>توضیحات</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                rows={4}
                placeholder="توضیحات مختصر..."
                onChange={(e) => {
                  field.onChange(e)
                  onUpdate?.('description', e.target.value)
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
      
      {postType === 'product' && (
        <FormField 
          control={control} 
          name="price" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>قیمت (تومان)</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : 0
                    field.onChange(value)
                    onUpdate?.('price', value)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
      )}
    </div>
  )
}
