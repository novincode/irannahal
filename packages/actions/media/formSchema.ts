import { z } from "zod"

export const mediaFormSchema = z.object({
  url: z.string().url(),
  type: z.enum(["image", "video", "file"]),
  alt: z.string().optional(),
})

export type MediaFormInput = z.input<typeof mediaFormSchema>
export type MediaFormParsed = z.infer<typeof mediaFormSchema>
