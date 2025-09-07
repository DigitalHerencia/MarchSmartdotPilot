import { DOMParser as LinkeDOMParser } from "linkedom"
import {
  ParsedMusicSchema,
  type ParsedMusic,
  type Phrase,
  type TempoChange,
} from "@/schemas/musicSchema"

export async function parseMusicXml(file: File): Promise<ParsedMusic> {
  const text = await file.text()
  const ParserImpl: typeof DOMParser =
    typeof DOMParser !== "undefined"
      ? DOMParser
      : (LinkeDOMParser as unknown as typeof DOMParser)
  const parser = new ParserImpl()
  const doc = parser.parseFromString(text, "application/xml")
  // Basic error check
  const parserError = doc.querySelector("parsererror")
  if (parserError) throw new Error("Invalid MusicXML")

  const title = doc.querySelector("work > work-title")?.textContent || undefined
  // Find tempo changes per measure and default tempo
  let tempo = 120
  const soundTempo = doc.querySelector("sound[tempo]")?.getAttribute("tempo")
  if (soundTempo) tempo = Number(soundTempo) || tempo
  const dirPerMin = doc.querySelector("metronome > per-minute")?.textContent
  if (dirPerMin) tempo = Number(dirPerMin) || tempo

  // Time signature (assume first found in attributes)
  const beats = Number(doc.querySelector("attributes time beats")?.textContent || 4)
  const beatType = Number(doc.querySelector("attributes time beat-type")?.textContent || 4)

  // Measures and durations: for a minimal approach, count beats per measure based on divisions and note durations
  const measuresNodes = Array.from(
    doc.querySelectorAll("score-partwise > part > measure"),
  )
  const tempoChanges: TempoChange[] = []
  measuresNodes.forEach((m, idx) => {
    let t: number | undefined
    const sound = m.querySelector("direction sound[tempo]")
    if (sound) t = Number(sound.getAttribute("tempo") || "")
    const perMin = m.querySelector(
      "direction metronome per-minute",
    )?.textContent
    if (perMin) t = Number(perMin)
    if (t) tempoChanges.push({ measure: idx + 1, bpm: t })
  })
  if (tempoChanges.length) {
    // If the first tempo change is not at measure 1, insert the initial tempo at measure 1
    if (tempoChanges[0].measure !== 1) {
      tempoChanges.unshift({ measure: 1, bpm: tempo })
    }
    tempo = tempoChanges[0].bpm
  } else {
    tempoChanges.push({ measure: 1, bpm: tempo })
  }

  const divisions = Number(doc.querySelector("divisions")?.textContent || 1)
  const measures = measuresNodes.map((m, idx) => {
    let ticks = 0
    const notes = Array.from(m.querySelectorAll("note"))
    for (const n of notes) {
      const dur = Number(n.querySelector("duration")?.textContent || 0)
      ticks += dur
    }
    const beatsInMeasure = divisions > 0 ? ticks / divisions : beats
    return { number: idx + 1, durationBeats: beatsInMeasure }
  })

  // Phrase detection: end phrase on double/final barlines
  const phraseEnds = measuresNodes.map((m) => {
    const bar = m.querySelector(
      "barline[location='right'] > bar-style",
    )?.textContent
    return bar ? /light-heavy|final|double/i.test(bar) : false
  })
  const phrases: Phrase[] = []
  let start = 1
  phraseEnds.forEach((endFlag, idx) => {
    if (endFlag) {
      phrases.push({ start, end: idx + 1 })
      start = idx + 2
    }
  })
  if (start <= measuresNodes.length)
    phrases.push({ start, end: measuresNodes.length })

  const parsed = {
    title,
    tempo,
    timeSignature: { beats, beatValue: beatType },
    measures,
    phrases,
    tempoChanges,
  }
  return ParsedMusicSchema.parse(parsed)
}
