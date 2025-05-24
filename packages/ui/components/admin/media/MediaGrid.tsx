import * as React from "react"
import { Checkbox } from "@ui/components/ui/checkbox"
import { Card, CardContent, CardFooter } from "@ui/components/ui/card"
import type { MediaSchema } from "@db/types"

interface MediaGridProps {
  medias: MediaSchema[]
  selected: Set<string>
  onSelect: (id: string, checked: boolean, index?: number, shift?: boolean) => void
  onEdit: (media: MediaSchema) => void
  selectMode: boolean
}

export function MediaGrid({ medias, selected, onSelect, onEdit, selectMode }: MediaGridProps) {
  const [lastSelected, setLastSelected] = React.useState<number | null>(null)

  const handleCardClick = (media: MediaSchema, index: number, e: React.MouseEvent) => {
    if (selectMode) {
      const shift = e.shiftKey
      onSelect(media.id, !selected.has(media.id), index, shift)
      setLastSelected(index)
    } else {
      onEdit(media)
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
      {medias.map((media, idx) => (
        <MediaCard
          key={media.id}
          media={media}
          checked={selected.has(media.id)}
          onCheck={checked => onSelect(media.id, checked, idx, false)}
          onClick={e => handleCardClick(media, idx, e)}
        />
      ))}
    </div>
  )
}

interface MediaCardProps {
  media: MediaSchema
  checked: boolean
  onCheck: (checked: boolean) => void
  onClick: (e: React.MouseEvent) => void
}

export function MediaCard({ media, checked, onCheck, onClick }: MediaCardProps) {
  return (
    <Card
      className={`relative group gap-0 cursor-pointer border hover:shadow transition-shadow duration-150 overflow-hidden p-0 ${checked ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onCheck}
        className="absolute top-2 right-2 z-10 rounded"
        onClick={e => e.stopPropagation()}
      />
      <CardContent className="p-0">
        {media.type === "image" ? (
          <img src={media.url} alt={media.alt || ""} className="w-full h-32 object-cover" />
        ) : (
          <div className="w-full h-32 flex items-center justify-center text-xs">
            {media.type}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-2 text-xs truncate text-center relative z-10">
        {media.alt || media.url}
      </CardFooter>
    </Card>
  )
}
