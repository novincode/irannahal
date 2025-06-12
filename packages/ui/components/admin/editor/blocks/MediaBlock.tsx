"use client"

import * as React from "react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@ui/components/ui/form"
import type { BlockProps } from "@data/usePostEditorStore"
import { MediaPicker } from "@ui/components/admin/media/MediaPicker"

interface ThumbnailBlockProps extends BlockProps {
  onMediaUpload?: (files: File[]) => Promise<any[]>
  onMediaRemove?: (mediaId: string) => Promise<void>
}

export function ThumbnailBlock({ 
  control, 
  postType, 
  blockId, 
  onUpdate,
  onMediaUpload,
  onMediaRemove
}: ThumbnailBlockProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="thumbnailId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>تصویر شاخص</FormLabel>
            <FormControl>
              <MediaPicker
                value={field.value}
                onChange={field.onChange}
                label="انتخاب تصویر شاخص"
                placeholder="هنوز تصویر شاخصی انتخاب نشده"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

// Keep the old MediaBlock for backward compatibility but simplified
export function MediaBlock({ 
  control, 
  postType, 
  blockId, 
  onUpdate,
  multiple = true,
  onMediaUpload,
  onMediaRemove
}: ThumbnailBlockProps & { multiple?: boolean }) {
  
  if (!multiple) {
    // For single media, use thumbnail block
    return <ThumbnailBlock 
      control={control}
      postType={postType}
      blockId={blockId}
      onUpdate={onUpdate}
      onMediaUpload={onMediaUpload}
      onMediaRemove={onMediaRemove}
    />
  }

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="mediaIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>تصاویر محصول</FormLabel>
            <FormControl>
              <div className="text-sm text-muted-foreground">
                گالری تصاویر - این بخش در نسخه آینده اضافه خواهد شد
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

// ThumbnailBlock is already exported above
