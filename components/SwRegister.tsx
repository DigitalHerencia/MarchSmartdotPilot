"use client"

import { useEffect } from "react"

export default function SwRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator)) return
    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" })
      } catch (e) {
        // no-op
      }
    }
    register()
  }, [])
  return null
}
