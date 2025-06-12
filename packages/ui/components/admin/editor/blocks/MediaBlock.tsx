"use client"

import * as React from "react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@ui/components/ui/form"
import { Button } from "@ui/components/ui/button"
import { Card, CardContent } from "@ui/components/ui/card"
import { Upload, X, Eye } from "lucide-react"
import { cn } from "@ui/lib/utils"
import type { BlockProps } from "@data/usePostEditorStore"

interface MediaBlockProps extends BlockProps {
  multiple?: boolean
  accept?: string
  maxFiles?: number
  maxSize?: number // in MB
  onUpload?: (files: File[]) => Promise<any[]>
  onRemove?: (mediaId: string) => Promise<void>
}

export function MediaBlock({ 
  control, 
  postType, 
  blockId, 
  onUpdate,
  multiple = true,
  accept = "image/*",
  maxFiles = 10,
  maxSize = 5,
  onUpload,
  onRemove
}: MediaBlockProps) {
  const [uploading, setUploading] = React.useState(false)
  const [dragActive, setDragActive] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  const fieldName = multiple ? 'mediaIds' : 'thumbnailId'
  
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0 || !onUpload) return
    
    const fileArray = Array.from(files)
    
    // Validate file count
    if (multiple) {
      const currentCount = control._getWatch(fieldName)?.length || 0
      if (currentCount + fileArray.length > maxFiles) {
        alert(`حداکثر ${maxFiles} فایل مجاز است`)
        return
      }
    } else if (fileArray.length > 1) {
      alert('فقط یک فایل مجاز است')
      return
    }
    
    // Validate file sizes
    const oversizedFiles = fileArray.filter(file => file.size > maxSize * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      alert(`حداکثر حجم مجاز ${maxSize} مگابایت است`)
      return
    }
    
    setUploading(true)
    try {
      const uploadedMedia = await onUpload(fileArray)
      if (uploadedMedia && uploadedMedia.length > 0) {
        const newIds = uploadedMedia.map(media => media.id)
        
        if (multiple) {
          const currentIds = control._getWatch(fieldName) || []
          const updatedIds = [...currentIds, ...newIds]
          control._formValues[fieldName] = updatedIds
          onUpdate?.(fieldName, updatedIds)
        } else {
          control._formValues[fieldName] = newIds[0]
          onUpdate?.(fieldName, newIds[0])
        }
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('آپلود ناموفق بود')
    } finally {
      setUploading(false)
    }
  }
  
  const handleRemove = async (mediaId: string) => {
    if (onRemove) {
      try {
        await onRemove(mediaId)
      } catch (error) {
        console.error('Remove failed:', error)
      }
    }
    
    if (multiple) {
      const currentIds = control._getWatch(fieldName) || []
      const updatedIds = currentIds.filter((id: string) => id !== mediaId)
      control._formValues[fieldName] = updatedIds
      onUpdate?.(fieldName, updatedIds)
    } else {
      control._formValues[fieldName] = null
      onUpdate?.(fieldName, null)
    }
  }
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name={fieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {multiple ? 'تصاویر' : 'تصویر شاخص'}
              {multiple && ` (حداکثر ${maxFiles} فایل)`}
            </FormLabel>
            <FormControl>
              <div className="space-y-4">
                {/* Upload Area */}
                <Card
                  className={cn(
                    "border-2 border-dashed transition-colors cursor-pointer",
                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                    uploading && "opacity-50 pointer-events-none"
                  )}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      {uploading ? 'در حال آپلود...' : 'فایل‌ها را اینجا بکشید یا کلیک کنید'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      حداکثر {maxSize} مگابایت - {accept.split(',').join(', ')}
                    </p>
                  </CardContent>
                </Card>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  multiple={multiple}
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
                
                {/* Media Preview */}
                {field.value && (
                  <div className="grid grid-cols-2 gap-2">
                    {(Array.isArray(field.value) ? field.value : [field.value]).map((mediaId) => (
                      <MediaPreview
                        key={mediaId}
                        mediaId={mediaId}
                        onRemove={() => handleRemove(mediaId)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

// Helper component for media preview
function MediaPreview({ mediaId, onRemove }: { mediaId: string; onRemove: () => void }) {
  // This would typically fetch media details from your API
  // For now, showing a placeholder
  
  return (
    <Card className="relative group">
      <CardContent className="p-2">
        <div className="aspect-square bg-muted rounded flex items-center justify-center relative">
          {/* Placeholder - replace with actual image */}
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded flex items-center justify-center">
            <span className="text-xs text-blue-600">تصویر</span>
          </div>
          
          {/* Action buttons */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                // Open preview modal
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
