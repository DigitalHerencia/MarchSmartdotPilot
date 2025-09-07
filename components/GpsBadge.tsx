"use client"

import { Badge, type BadgeProps } from "@/components/ui/badge"
import { useGpsSnapshot } from "@/lib/gps/store"

export default function GpsBadge() {
  const { isTracking, accuracy, averageAccuracy, bestAccuracy } = useGpsSnapshot()

  const label = (() => {
    if (!isTracking) return "GPS: Off"
    if (accuracy == null) return "GPS: On"
    return `GPS: ±${accuracy.toFixed(0)}m`
  })()

  const variant: BadgeProps["variant"] = !isTracking ? "outline" : accuracy != null && accuracy < 5 ? "default" : "secondary"

  return (
    <div className="flex items-center gap-2">
  <Badge variant={variant} className="text-xs">
        {label}
      </Badge>
      {isTracking && averageAccuracy != null && (
        <span className="text-[10px] text-muted-foreground hidden xl:inline">avg ±{averageAccuracy.toFixed(0)}m</span>
      )}
      {isTracking && bestAccuracy != null && (
        <span className="text-[10px] text-muted-foreground hidden 2xl:inline">best ±{bestAccuracy.toFixed(0)}m</span>
      )}
    </div>
  )
}
