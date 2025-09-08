"use client"

import { useState, useEffect } from "react"

export function useAudioContext() {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [isAudioReady, setIsAudioReady] = useState(false)

  useEffect(() => {
    const initAudioContext = async () => {
      try {
        const Ctor =
          window.AudioContext ||
          (window as Window & { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext
        const context = new Ctor()

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

  useEffect(() => {
    return () => {
      audioContext?.close()
    }
  }, [audioContext])

  return { audioContext, isAudioReady }
}
