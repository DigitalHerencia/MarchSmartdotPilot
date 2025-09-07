"use client"
import { useActionState, useEffect, useState } from "react"
import { savePreferences, getPreferences } from "@/lib/actions/preferences"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { Show } from "@/schemas"

type FieldType = "high-school" | "college"
type Notation = "yardline" | "steps-off"

interface Props {
  shows: Show[]
}

export default function SettingsPanel({ shows }: Props) {
  const [step, setStep] = useState(0.75)
  const [fieldType, setFieldType] = useState<FieldType>("high-school")
  const [notationStyle, setNotationStyle] = useState<Notation>("yardline")
  const [showId, setShowId] = useState<string>(shows[0]?.id ?? "")
  const [partId, setPartId] = useState<string>(shows[0]?.parts[0]?.id ?? "")
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const action = async () => {
    // directly call server action
    await savePreferences({ stepSizeYards: step, fieldType, notationStyle, showId, partId })
    return { ok: true }
  }
  const [state, formAction, pending] = useActionState(action, { ok: false })

  useEffect(() => {
    if (state.ok) {
      setSavedAt(Date.now())
      const t = setTimeout(() => setSavedAt(null), 2500)
      return () => clearTimeout(t)
    }
  }, [state])

  useEffect(() => {
    ;(async () => {
      try {
        const pref = await getPreferences()
        if (pref) {
          if (typeof pref.stepSizeYards === "number") setStep(pref.stepSizeYards)
          if (pref.fieldType === "high-school" || pref.fieldType === "college") setFieldType(pref.fieldType as FieldType)
          if (pref.notationStyle === "yardline" || pref.notationStyle === "steps-off")
            setNotationStyle(pref.notationStyle as Notation)
          if (pref.showId) setShowId(pref.showId)
          if (pref.partId) setPartId(pref.partId)
        }
      } catch {}
    })()
  }, [shows])

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="step">Step size (yards)</Label>
        <Input id="step" type="number" step="0.01" value={step} onChange={(e) => setStep(parseFloat(e.target.value))} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="field">Field type</Label>
  <select id="field" className="border rounded p-2" value={fieldType} onChange={(e) => setFieldType(e.target.value as FieldType)}>
          <option value="high-school">High school</option>
          <option value="college">College</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notation">Notation</Label>
  <select id="notation" className="border rounded p-2" value={notationStyle} onChange={(e) => setNotationStyle(e.target.value as Notation)}>
          <option value="yardline">Yardline</option>
          <option value="steps-off">Steps off</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="show">Show</Label>
        <select
          id="show"
          className="border rounded p-2"
          value={showId}
          onChange={(e) => {
            const id = e.target.value
            setShowId(id)
            const firstPart = shows.find((s) => s.id === id)?.parts[0]?.id ?? ""
            setPartId(firstPart)
          }}
        >
          {shows.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="part">Part</Label>
        <select
          id="part"
          className="border rounded p-2"
          value={partId}
          onChange={(e) => setPartId(e.target.value)}
        >
          {shows
            .find((s) => s.id === showId)?.parts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            )) ?? null}
        </select>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save Preferences"}</Button>
        {savedAt && <span className="text-sm text-green-600">Saved</span>}
      </div>
    </form>
  )
}
