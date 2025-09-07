"use client"
import { useActionState, useEffect, useState } from "react"
import { savePreferences } from "@/lib/actions/preferences"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

type FieldType = "high-school" | "college"
type Notation = "yardline" | "steps-off"

export default function SettingsPanel() {
  const [step, setStep] = useState(0.75)
  const [fieldType, setFieldType] = useState<FieldType>("high-school")
  const [notationStyle, setNotationStyle] = useState<Notation>("yardline")
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const action = async () => {
    // directly call server action
    await savePreferences({ stepSizeYards: step, fieldType, notationStyle })
    return { ok: true }
  }
  const [state, formAction, pending] = useActionState(action, { ok: false })

  useEffect(() => {
    if (state.ok) {
  // transient inline success indicator
  setSavedAt(Date.now())
  const t = setTimeout(() => setSavedAt(null), 2500)
  return () => clearTimeout(t)
    }
  }, [state])

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
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save Preferences"}</Button>
        {savedAt && <span className="text-sm text-green-600">Saved</span>}
      </div>
    </form>
  )
}
