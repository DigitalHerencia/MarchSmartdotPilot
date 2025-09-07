"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { parseMusicXml } from "@/lib/music/parseMusicXml"
import { buildPhraseMap } from "@/lib/music/phraseMap"

export default function MusicUpload() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [summary, setSummary] = useState<string>("")

  const pick = () => inputRef.current?.click()
  const onFile = async (file: File) => {
    try {
      if (!file.name.toLowerCase().endsWith(".xml")) {
        setSummary("Please upload a MusicXML (.xml) file. PDF parsing is not supported yet.")
        return
      }
      const parsed = await parseMusicXml(file)
      const map = buildPhraseMap(parsed)
      setSummary(
        `${parsed.title || "Untitled"} — ${parsed.tempo} BPM, ${parsed.timeSignature.beats}/${parsed.timeSignature.beatValue}\n` +
          `Measures: ${parsed.measures.length}, Total counts: ${map.totalCounts}`,
      )
    } catch (e) {
      setSummary(`Failed to parse: ${(e as Error).message}`)
    } finally {
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Music Upload (MusicXML)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <input
          ref={inputRef}
          type="file"
          accept=".xml,application/xml"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onFile(f)
          }}
        />
        <Button variant="outline" size="sm" onClick={pick}>
          Choose MusicXML
        </Button>
  {summary && <div className="text-sm text-muted-foreground whitespace-pre-wrap">{summary}</div>}
      </CardContent>
    </Card>
  )
}
