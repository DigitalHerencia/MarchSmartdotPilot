"use client"

import { useState, useEffect } from "react"

export function useAudioContext() {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [isAudioReady, setIsAudioReady] = useState(false)

  useEffect(() => {
    const initAudioContext = async () => {
      try {
        // Support older webkit prefixed AudioContext implementations safely at runtime
        const ctor: any = (window as any).AudioContext ?? (window as any).webkitAudioContext

        if (!ctor) {
          throw new Error("AudioContext is not supported in this browser")
        }

        const context: AudioContext = new ctor()

        // Resume context if suspended (required by some browsers)
        if (context.state === "suspended") {
          await context.resume()
        }

        setAudioContext(context)
        setIsAudioReady(true)
      } catch (error) {
        console.error("Failed to initialize audio context:", error)
        setIsAudioReady(false)
      }
    }

    // Initialize on user interaction to comply with browser autoplay policies
    const handleUserInteraction = () => {
      initAudioContext()
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)
    }

    document.addEventListener("click", handleUserInteraction)
    document.addEventListener("touchstart", handleUserInteraction)

    return () => {
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)

      if (audioContext) {
        void audioContext.close()
      }
    }
  }, [])

  return { audioContext, isAudioReady }
}
