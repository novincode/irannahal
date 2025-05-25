"use client"
import * as React from "react"
import { TagForm, TagFormHandle } from "@ui/components/admin/tags/TagForm"
import { updateTag } from "@actions/tags/update"
import { useRouter } from "next/navigation"
import type { TagWithDynamicRelations } from "@actions/tags/types"
import { TagFormInput } from "@actions/tags/formSchema"

export default function EditTagClient({ initialTag }: { initialTag: TagWithDynamicRelations<{}> }) {
  const [loading, setLoading] = React.useState(false)
  const formRef = React.useRef<TagFormHandle>(null)
  const router = useRouter()

  const handleUpdate = async (data: TagFormInput) => {
    setLoading(true)
    try {
      await updateTag({ ...data, id: initialTag.id })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <TagForm
      ref={formRef}
      initialData={initialTag}
      onSubmit={handleUpdate}
      submitLabel={loading ? "در حال ویرایش..." : "ذخیره تغییرات"}
      isEditing
    />
  )
}
