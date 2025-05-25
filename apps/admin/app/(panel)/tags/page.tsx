import React from 'react'
import { getTags } from "@actions/tags/get"
import TagsClient from "./TagsClient"
import type { TagWithDynamicRelations } from "@actions/tags/types"

const page = async () => {
  const tags: TagWithDynamicRelations<{}>[] = await getTags()
  return <TagsClient initialTags={tags} />
}

export default page
