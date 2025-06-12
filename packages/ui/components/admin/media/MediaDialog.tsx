import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@ui/components/ui/tabs"
import { UploadDropzone } from "./UploadDropzone"
import { getMedias } from "@actions/media/get"
import { createMedia } from "@actions/media/create"
import type { MediaSchema } from "@db/types"

interface MediaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (media: MediaSchema | MediaSchema[]) => void
  selectedIds?: string[]
  medias?: MediaSchema[]
  renderGrid: (props: {
    medias: MediaSchema[]
    selected: Set<string>
    onSelect: (id: string, checked: boolean, index?: number, shift?: boolean) => void
    loading: boolean
  }) => React.ReactNode
  uploadLabel?: string
  selectLabel?: string
}

export function MediaDialog({
  open,
  onOpenChange,
  onSelect,
  selectedIds = [],
  medias: mediasProp,
  renderGrid,
  uploadLabel = "آپلود جدید",
  selectLabel = "انتخاب رسانه",
}: MediaDialogProps) {
  const [tab, setTab] = React.useState("select")
  const [medias, setMedias] = React.useState<MediaSchema[]>(mediasProp || [])
  const [selected, setSelected] = React.useState<Set<string>>(new Set(selectedIds))
  const [loading, setLoading] = React.useState(false)

  // Load medias if not provided
  React.useEffect(() => {
    if (!mediasProp && open) {
      setLoading(true)
      getMedias().then(ms => {
        setMedias(ms)
        setLoading(false)
      })
    } else if (Array.isArray(mediasProp)) {
      setMedias(mediasProp)
    }
  }, [open, mediasProp])

  // Reset selected when dialog opens
  React.useEffect(() => {
    if (open) setSelected(new Set(selectedIds))
  }, [open, selectedIds])

  const handleSelect = (id: string, checked: boolean) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
    // For single select, call onSelect immediately
    if (checked) {
      const media = medias.find(m => m.id === id)
      if (media) {
        onSelect(media)
        onOpenChange(false)
      }
    }
  }

  const handleUploadDone = async (urls: string[]) => {
    setLoading(true)
    try {
      // For now, assume all uploads are images
      const newMedias = await Promise.all(urls.map(url => createMedia({ url, type: "image" })))
      const ms = mediasProp ? [...newMedias, ...(Array.isArray(mediasProp) ? mediasProp : [])] : await getMedias()
      setMedias(ms)
      if (newMedias.length) {
        setSelected(new Set([newMedias[0].id]))
        onSelect(newMedias[0])
        onOpenChange(false)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{selectLabel}</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="select">{selectLabel}</TabsTrigger>
            <TabsTrigger value="upload">{uploadLabel}</TabsTrigger>
          </TabsList>
          <TabsContent value="select" className="flex-1 overflow-auto">
            {renderGrid({
              medias,
              selected,
              onSelect: handleSelect,
              loading,
            })}
            {loading && <div className="text-center py-8">در حال بارگذاری...</div>}
          </TabsContent>
          <TabsContent value="upload" className="flex-1 overflow-auto">
            <UploadDropzone onDone={handleUploadDone} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
