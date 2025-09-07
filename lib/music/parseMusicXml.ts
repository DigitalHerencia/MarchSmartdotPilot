import { ParsedMusicSchema, type ParsedMusic } from "@/schemas/musicSchema"

export async function parseMusicXml(file: File): Promise<ParsedMusic> {
  const text = await file.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, "application/xml")
  // Basic error check
  const parserError = doc.querySelector("parsererror")
  if (parserError) throw new Error("Invalid MusicXML")

  const title = doc.querySelector("work > work-title")?.textContent || undefined
  // Find first tempo (sound tempo or direction metronome)
  let tempo = 120
  const soundTempo = doc.querySelector("sound[tempo]")?.getAttribute("tempo")
  if (soundTempo) tempo = Number(soundTempo) || tempo
  const dirPerMin = doc.querySelector("metronome > per-minute")?.textContent
  if (dirPerMin) tempo = Number(dirPerMin) || tempo

  // Time signature (assume first found in attributes)
  const beats = Number(doc.querySelector("attributes time beats")?.textContent || 4)
  const beatType = Number(doc.querySelector("attributes time beat-type")?.textContent || 4)

  // Measures and durations: for a minimal approach, count beats per measure based on divisions and note durations
  const measuresNodes = Array.from(doc.querySelectorAll("score-partwise > part > measure"))
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

  const parsed = { title, tempo, timeSignature: { beats, beatValue: beatType }, measures }
  return ParsedMusicSchema.parse(parsed)
}
