"use client"
import * as React from "react"
import { TagForm, TagFormHandle } from "@ui/components/admin/tags/TagForm"
import TagsDataTable from "@ui/components/admin/tags/TagsDataTable"
import { createTag } from "@actions/tags/create"
import { getTags } from "@actions/tags/get"
import { TagFormInput } from "@actions/tags/formSchema"
import type { TagWithDynamicRelations } from "@actions/tags/types"

export default function TagsClient({ initialTags }: { initialTags: TagWithDynamicRelations<{}>[] }) {
  const [tags, setTags] = React.useState<TagWithDynamicRelations<{}>[]>(initialTags)
  const [loading, setLoading] = React.useState(false)
  const formRef = React.useRef<TagFormHandle>(null)

  const handleCreate = async (data: TagFormInput) => {
    setLoading(true)
    try {
      const newTag = await createTag(data)
      if (newTag?.id) {
        const updated = await getTags()
        setTags(updated)
        formRef.current?.reset()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="md:w-1/3 w-full">
        <TagForm ref={formRef} onSubmit={handleCreate} submitLabel={loading ? "در حال ثبت..." : "افزودن برچسب"} />
      </div>
      <div className="md:w-2/3 w-full">
        <TagsDataTable data={tags} />
      </div>
    </div>
  )
}
