import { z } from "zod"

export const TimeSignatureSchema = z.object({
  beats: z.number().int().positive(),
  beatValue: z.number().int().positive(),
})

export const MeasureSchema = z.object({
  number: z.number().int().nonnegative(),
  durationBeats: z.number().nonnegative(),
})

export const PhraseSchema = z.object({
  start: z.number().int().positive(),
  end: z.number().int().positive(),
})

export const TempoChangeSchema = z.object({
  measure: z.number().int().positive(),
  bpm: z.number().positive(),
})

export const ParsedMusicSchema = z.object({
  title: z.string().optional(),
  tempo: z.number().positive(),
  timeSignature: TimeSignatureSchema,
  measures: z.array(MeasureSchema),
  phrases: z.array(PhraseSchema).default([]),
  tempoChanges: z.array(TempoChangeSchema).default([]),
})

export type TimeSignature = z.infer<typeof TimeSignatureSchema>
export type Measure = z.infer<typeof MeasureSchema>
export type Phrase = z.infer<typeof PhraseSchema>
export type TempoChange = z.infer<typeof TempoChangeSchema>
export type ParsedMusic = z.infer<typeof ParsedMusicSchema>
