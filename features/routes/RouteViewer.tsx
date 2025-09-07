"use client"

import { useMemo } from "react"
import { Slider } from "@/components/ui/slider"
import type { MarchingRoute } from "@/schemas/routeSchema"

export default function RouteViewer({
  route,
  value,
  onChange,
}: {
  route: MarchingRoute | null
  value: number
  onChange: (index: number) => void
}) {
  const max = useMemo(() => Math.max(0, (route?.waypoints.length ?? 1) - 1), [route])

  const label = useMemo(() => {
    if (!route || route.waypoints.length === 0) return "No waypoints"
    const wp = route.waypoints[Math.min(value, route.waypoints.length - 1)]
    const seconds = Math.round((wp.timestamp || 0) / 100) / 10
    return `Step ${Math.min(value + 1, route.waypoints.length)} / ${route.waypoints.length} — ${seconds}s`
  }, [route, value])

  return (
    <div className="p-3 bg-muted rounded-lg space-y-2" aria-label="Route preview">
      <div className="text-sm font-medium" id="preview-label">Preview</div>
      <Slider
        value={[Math.min(value, max)]}
        min={0}
        max={max}
        step={1}
        onValueChange={(v) => onChange(v[0] ?? 0)}
        aria-label="Route preview scrubber"
        aria-describedby="preview-label"
      />
  <div className="text-xs text-muted-foreground" aria-live="polite">{label}</div>
    </div>
  )
}
