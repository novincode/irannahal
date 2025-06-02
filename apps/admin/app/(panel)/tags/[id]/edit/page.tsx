import React from "react"
import { getTag } from "@actions/tags/get"
import EditTagClient from "./EditTagClient"
import type { TagWithDynamicRelations } from "@actions/tags/types"

interface EditTagPageProps {
  params: Promise<{ id: string }>
}

const EditTagPage = async ({ params }: EditTagPageProps) => {
  // Await params first
  const { id } = await params
  
  const tag: TagWithDynamicRelations<{}> | null = await getTag(id)
  if (!tag) return <div>برچسب پیدا نشد</div>
  return <EditTagClient initialTag={tag} />
}

export default EditTagPage
