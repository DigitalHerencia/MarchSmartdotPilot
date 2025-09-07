"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Preview UI for future AI phrasing suggestions.
// Local-only demo; does not call external services.
export default function PhrasingSuggest() {
  const [ideas, setIdeas] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    // Simulate thinking delay without network
    await new Promise((r) => setTimeout(r, 400))
    setIdeas([
      "Phrase 1: Counts 1-8 — Focus on crescendo into the downbeat.",
      "Phrase 2: Counts 9-16 — Emphasize staccato articulations; breathe on 16.",
      "Transition: Align step-off at count 17, horns to the box by 20.",
    ])
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">AI Phrasing Suggestions</CardTitle>
        <Badge variant="secondary">Preview</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
  <p className="text-sm text-muted-foreground">
          Optional assistant to highlight musical phrasing and cue points. This is a local preview only; no AI calls are made.
        </p>
        <Button size="sm" onClick={generate} disabled={loading}>
          {loading ? "Generating…" : "Generate ideas"}
        </Button>
        {ideas.length > 0 && (
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {ideas.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
