import type { ParsedMusic } from "@/schemas/musicSchema"

export interface CountEntry {
  measure: number
  countInMeasure: number
  globalCount: number
}

export interface PhraseMap {
  counts: CountEntry[]
  totalCounts: number
}

export function buildPhraseMap(music: ParsedMusic): PhraseMap {
  const counts: CountEntry[] = []
  let global = 0
  for (const m of music.measures) {
    const perMeasure = Math.max(1, Math.round(m.durationBeats || music.timeSignature.beats))
    for (let c = 1; c <= perMeasure; c++) {
      global += 1
      counts.push({ measure: m.number, countInMeasure: c, globalCount: global })
    }
  }
  return { counts, totalCounts: global }
}

// Given route with waypoints aligned roughly to equal time steps, map a global count to an index.
export function findWaypointForCount(count: number, routeLength: number, totalCounts: number): number {
  if (routeLength <= 1) return 0
  const clamped = Math.max(1, Math.min(totalCounts, count))
  const ratio = (clamped - 1) / (totalCounts - 1)
  return Math.round(ratio * (routeLength - 1))
}
