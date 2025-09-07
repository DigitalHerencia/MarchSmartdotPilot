"use client"

import { useEffect, useRef, useState, useTransition, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause } from "lucide-react"
import type { MarchingRoute } from "@/schemas/routeSchema"

interface StepPlaybackProps {
  route: MarchingRoute | null
  index: number
  onIndexChange: (index: number) => void
  bpm: number
  audioContext: AudioContext | null
}

export default function StepPlayback({ route, index, onIndexChange, bpm, audioContext }: StepPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPending, startTransition] = useTransition()
  const timerRef = useRef<number | null>(null)

  const playClick = useCallback(() => {
    if (!audioContext) return
    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(880, audioContext.currentTime)
    gain.gain.setValueAtTime(0, audioContext.currentTime)
    gain.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.01)
    gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1)
    osc.connect(gain)
    gain.connect(audioContext.destination)
    osc.start()
    osc.stop(audioContext.currentTime + 0.1)
  }, [audioContext])

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      return
    }
    const spb = 60 / Math.max(1, bpm)
    timerRef.current = window.setTimeout(() => {
      if (!route || route.waypoints.length === 0) {
        setIsPlaying(false)
        return
      }
      const next = index + 1
      if (next >= route.waypoints.length) {
        setIsPlaying(false)
        return
      }
      startTransition(() => onIndexChange(next))
      playClick()
    }, spb * 1000)
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPlaying, bpm, index, route, startTransition, onIndexChange, playClick])

  const handleStart = () => {
    if (!route || route.waypoints.length === 0) return
    if (audioContext && audioContext.state === "suspended") {
      audioContext.resume().catch(() => {})
    }
    setIsPlaying(true)
    playClick()
  }

  const handleStop = () => {
    setIsPlaying(false)
  }

  useEffect(() => {
    if (!route) {
      setIsPlaying(false)
    }
  }, [route])

  return (
    <div className="flex items-center gap-2">
      <Button onClick={isPlaying ? handleStop : handleStart} size="sm" variant="outline" disabled={!route}>
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <span className="text-xs text-muted-foreground" aria-live="polite">
        {isPending ? "…" : isPlaying ? "Playing" : "Stopped"}
      </span>
    </div>
  )
}

