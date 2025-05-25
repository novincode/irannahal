import * as React from "react"
import { UploadDropzone } from "./UploadDropzone"
import { MediaGrid } from "./MediaGrid"
import { MediaEditDrawer } from "./MediaEditDrawer"
import { getMedias } from "@actions/media/get"
import { createMedia } from "@actions/media/create"
import { uploadToCloudinary } from "@actions/media/providers/cloudinary"
import { deleteMedia } from "@actions/media/delete"
import type { MediaSchema } from "@db/types"
import { toast } from "sonner"
import { Button } from "@ui/components/ui/button"

export function MediaManager() {
    const [medias, setMedias] = React.useState<MediaSchema[]>([])
    const [selected, setSelected] = React.useState<Set<string>>(new Set())
    const [drawerOpen, setDrawerOpen] = React.useState(false)
    const [editingMedia, setEditingMedia] = React.useState<MediaSchema | null>(null)
    const [loading, setLoading] = React.useState(false)
    const [lastSelected, setLastSelected] = React.useState<number | null>(null)

    const selectMode = selected.size > 0

    React.useEffect(() => {
        (async () => {
            const all = await getMedias()
            setMedias(all)
        })()
    }, [])

    const handleUploadDone = async (urls: string[]) => {
        setLoading(true)
        try {
            // For now, assume all uploads are images
            const newMedias = await Promise.all(urls.map(url => createMedia({ url, type: "image" })))
            setMedias(prev => [...newMedias, ...prev])
        } finally {
            setLoading(false)
        }
    }

    // Pass this to UploadDropzone for agnostic upload
    const handleUpload = React.useCallback((file: File, onProgress: (percent: number) => void) => {
        return uploadToCloudinary(file, { onProgress })
    }, [])

    const handleUploadError = React.useCallback((error: unknown) => {
        toast.error("خطا در آپلود فایل. لطفاً کنسول مرورگر را چک کنید.")
        console.error("Upload error:", error)
    }, [])

    const handleSelect = (id: string, checked: boolean, index?: number, shift?: boolean) => {
        setSelected(prev => {
            const next = new Set(prev)
            if (shift && lastSelected !== null && index !== undefined) {
                // Range select
                const [start, end] = [lastSelected, index].sort((a, b) => a - b)
                for (let i = start; i <= end; i++) {
                    next.add(medias[i].id)
                }
            } else {
                if (checked) next.add(id)
                else next.delete(id)
                if (index !== undefined) setLastSelected(index)
            }
            return next
        })
    }

    const handleDeselectAll = () => {
        setSelected(new Set())
        setLastSelected(null)
    }

    const handleDeleteSelected = async () => {
        setLoading(true)
        try {
            // Assume deleteMedia is available
            await Promise.all(Array.from(selected).map(id => deleteMedia(id)))
            setMedias(prev => prev.filter(m => !selected.has(m.id)))
            setSelected(new Set())
            setLastSelected(null)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (media: MediaSchema) => {
        setEditingMedia(media)
        setDrawerOpen(true)
    }

    const handleUpdated = (updated: MediaSchema) => {
        setMedias(prev => prev.map(m => m.id === updated.id ? updated : m))
    }

    const handleDeleted = (id: string) => {
        setMedias(prev => prev.filter(m => m.id !== id))
        setSelected(prev => {
            const next = new Set(prev)
            next.delete(id)
            return next
        })
    }

    return (
        <>

            <UploadDropzone onDone={handleUploadDone} onUpload={handleUpload} onError={handleUploadError} />

            {selectMode && (
                <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={handleDeselectAll}>لغو انتخاب شده ها</Button>
                    <Button size="sm" variant="destructive" onClick={handleDeleteSelected} disabled={loading}>حذف انتخاب شده ها</Button>
                </div>
            )}
            <MediaGrid
                medias={medias}
                selected={selected}
                onSelect={handleSelect}
                onEdit={handleEdit}
                selectMode={selectMode}
            />
            <MediaEditDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                media={editingMedia}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
            />
        </>
    )
}
