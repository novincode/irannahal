"use client"

import * as React from "react"
import { Button } from "@ui/components/ui/button"
import { Card, CardContent } from "@ui/components/ui/card"
import { MediaDialog } from "./MediaDialog"
import { MediaGrid } from "./MediaGrid"
import { getMedias, getMediaById } from "@actions/media/get"
import type { MediaSchema } from "@db/types"
import { ImageIcon, X } from "lucide-react"

interface MediaPickerProps {
  value?: string | null
  onChange: (value: string | null) => void
  label?: string
  placeholder?: string
  className?: string
}

export function MediaPicker({
  value,
  onChange,
  label = "انتخاب تصویر",
  placeholder = "هنوز تصویری انتخاب نشده",
  className
}: MediaPickerProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selectedMedia, setSelectedMedia] = React.useState<MediaSchema | null>(null)
  const [loading, setLoading] = React.useState(false)

  // Load selected media details when value changes
  React.useEffect(() => {
    if (value && value !== selectedMedia?.id) {
      setLoading(true)
      getMediaById(value)
        .then(media => {
          setSelectedMedia(media || null)
        })
        .catch(err => {
          console.error("Failed to load media:", err)
          setSelectedMedia(null)
        })
        .finally(() => {
          setLoading(false)
        })
    } else if (!value) {
      setSelectedMedia(null)
    }
  }, [value, selectedMedia?.id])

  const handleSelect = (media: MediaSchema | MediaSchema[]) => {
    // For single selection, we expect a single MediaSchema
    const selectedMedia = Array.isArray(media) ? media[0] : media
    if (selectedMedia) {
      setSelectedMedia(selectedMedia)
      onChange(selectedMedia.id)
      setDialogOpen(false)
    }
  }

  const handleRemove = () => {
    setSelectedMedia(null)
    onChange(null)
  }

  const renderGrid = ({ medias, selected, onSelect, loading }: {
    medias: MediaSchema[]
    selected: Set<string>
    onSelect: (id: string, checked: boolean) => void
    loading: boolean
  }) => (
    <MediaGrid
      medias={medias}
      selected={selected}
      onSelect={onSelect}
      onEdit={() => {}} // Not needed for picker
      selectMode={true}
    />
  )

  return (
    <div className={className}>
      <div className="space-y-2">
        {selectedMedia ? (
          <Card className="relative">
            <CardContent className="p-0">
              <div className="relative">
                {selectedMedia.type === "image" ? (
                  <img 
                    src={selectedMedia.url} 
                    alt={selectedMedia.alt || ""} 
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-t-lg">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-3">
                <p className="text-sm text-muted-foreground truncate">
                  {selectedMedia.alt || selectedMedia.url}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-6">
              <div className="text-center">
                <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-4">
                  {placeholder}
                </p>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(true)}
                  disabled={loading}
                >
                  {loading ? "در حال بارگذاری..." : label}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedMedia && (
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => setDialogOpen(true)}
            >
              تغییر تصویر
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleRemove}
            >
              حذف تصویر
            </Button>
          </div>
        )}
      </div>

      <MediaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSelect={handleSelect}
        selectedIds={selectedMedia ? [selectedMedia.id] : []}
        renderGrid={renderGrid}
        selectLabel="انتخاب تصویر"
        uploadLabel="آپلود تصویر جدید"
      />
    </div>
  )
}
