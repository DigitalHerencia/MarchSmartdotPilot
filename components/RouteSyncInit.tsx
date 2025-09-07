"use client"

import { useEffect } from "react"
import { initRouteSync } from "@/lib/routes/syncClient"

export default function RouteSyncInit() {
  useEffect(() => {
    initRouteSync()
  }, [])
  return null
}
