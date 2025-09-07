"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RouteSchema, type MarchingRoute } from "@/schemas/routeSchema"
import { Download, Upload } from "lucide-react"

export default function RouteEditor({
  route,
  onRouteChange,
}: {
  route: MarchingRoute | null
  onRouteChange: (route: MarchingRoute | null) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const exportJson = () => {
    if (!route) return
    const blob = new Blob([JSON.stringify(route, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${route.name || "route"}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onPickFile = () => fileInputRef.current?.click()

  const importJson = async (file: File) => {
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const parsed = RouteSchema.parse(json)
      onRouteChange(parsed)
    } catch {
      alert("Invalid route JSON. Ensure it matches the expected schema.")
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Import / Export</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) importJson(f)
          }}
        />
        <Button size="sm" variant="outline" onClick={onPickFile}>
          <Upload className="h-4 w-4 mr-2" /> Import JSON
        </Button>
        <Button size="sm" onClick={exportJson} disabled={!route}>
          <Download className="h-4 w-4 mr-2" /> Export JSON
        </Button>
      </CardContent>
    </Card>
  )
}
