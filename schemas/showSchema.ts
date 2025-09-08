import { z } from "zod"

export const PartSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const ShowSchema = z.object({
  id: z.string(),
  name: z.string(),
  parts: z.array(PartSchema).default([]),
})

export type Part = z.infer<typeof PartSchema>
export type Show = z.infer<typeof ShowSchema>
