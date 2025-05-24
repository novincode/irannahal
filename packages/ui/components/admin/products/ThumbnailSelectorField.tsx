import * as React from "react"
import { Button } from "@ui/components/ui/button"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@ui/components/ui/form"
import { MediaDialog } from "../media/MediaDialog"
import { MediaGrid } from "../media/MediaGrid"
import type { ProductFormWithMetaInput } from "@actions/products/formSchema"
import type { Control } from "react-hook-form"
import { useWatch } from "react-hook-form"
import { MediaSchema } from "@db/types"
import { getMediaById } from "@actions/media/get"

interface ThumbnailSelectorFieldProps {
  form: any
}

export function ThumbnailSelectorField({ form }: ThumbnailSelectorFieldProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const thumbnailId = useWatch({ control: form.control, name: "thumbnailId" })
  const [selectedMedia, setSelectedMedia] = React.useState<MediaSchema | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (thumbnailId) {
      setLoading(true)
      getMediaById(thumbnailId).then(media => {
        setSelectedMedia(media || null)
        setLoading(false)
      })
    } else {
      setSelectedMedia(null)
      setLoading(false)
    }
  }, [thumbnailId])

  return (
    <FormField control={form.control} name="thumbnailId" render={({ field }) => (
      <FormItem>
        <FormLabel>تصویر شاخص</FormLabel>
        <FormControl>
          <div className="flex  gap-4 flex-col justify-stretch items-stretch">
            <div className="relative flex items-center justify-center aspect-square min-w-[80px]  w-full min-h-[200px] rounded-lg border bg-muted overflow-hidden">
              {loading ? (
                <span className="text-xs text-muted-foreground animate-pulse">در حال بارگذاری...</span>
              ) : selectedMedia && selectedMedia.url ? (
                <img src={selectedMedia.url} alt={selectedMedia.alt || "thumbnail"} className="object-cover w-full h-full" />
              ) : (
                <span className="text-xs text-muted-foreground">بدون تصویر</span>
              )}
            </div>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(true)}>
              انتخاب تصویر
            </Button>
          </div>
        </FormControl>
        <FormMessage />
        <MediaDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSelect={media => {
            setSelectedMedia(media as MediaSchema)
            form.setValue("thumbnailId", (media as MediaSchema).id, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
          }}
          selectedIds={thumbnailId ? [thumbnailId] : []}
          renderGrid={({ medias, selected, onSelect, loading }) => (
            <MediaGrid
              medias={medias}
              selected={selected}
              onSelect={(id, checked, index, shift) => onSelect(id, checked, index, shift)}
              onEdit={() => {}}
              selectMode={true}
            />
          )}
        />
      </FormItem>
    )} />
  )
}
