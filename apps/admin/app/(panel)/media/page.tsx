'use client'
import dynamic from "next/dynamic"

const MediaManager = dynamic(() => import("@ui/components/admin/media/MediaManager").then(m => m.MediaManager), { ssr: false })

export default function MediaPage() {
  return <MediaManager />
}
