import { z } from "zod"

export const TimeSignatureSchema = z.object({
  beats: z.number().int().positive(),
  beatValue: z.number().int().positive(),
})

export const MeasureSchema = z.object({
  number: z.number().int().nonnegative(),
  durationBeats: z.number().nonnegative(),
})

export const ParsedMusicSchema = z.object({
  title: z.string().optional(),
  tempo: z.number().positive(),
  timeSignature: TimeSignatureSchema,
  measures: z.array(MeasureSchema),
})

export type TimeSignature = z.infer<typeof TimeSignatureSchema>
export type Measure = z.infer<typeof MeasureSchema>
export type ParsedMusic = z.infer<typeof ParsedMusicSchema>
