"use client"

import { useEffect, useRef } from "react"

export interface VisualCueLayerProps {
  width: number
  height: number
  bpm: number
  audioContext: AudioContext | null
  visible?: boolean
}

// Renders beat-synced pulses on yard lines; overlay above FieldView. Pointer-events disabled.
export default function VisualCueLayer({ width, height, bpm, audioContext, visible = true }: VisualCueLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      if (!audioContext || !visible) {
        rafRef.current = requestAnimationFrame(render)
        return
      }

      // Phase within current beat [0,1)
      const spb = 60 / Math.max(1, bpm)
      const now = audioContext.currentTime
      const phase = (now / spb) % 1

      // Yard lines (every 5 yards across 120 yards => 25 lines incl. bounds)
      const lines = 25
      for (let i = 0; i <= lines; i++) {
        const x = (i * width) / lines
        // Pulse alpha peaks near phase ~0 (downbeat)
        const intensity = 0.35 + 0.65 * Math.exp(-12 * Math.min(phase, 1 - phase))
        ctx.strokeStyle = `rgba(59,130,246,${intensity.toFixed(3)})`
        ctx.lineWidth = i === Math.floor(lines / 2) ? 3 : 2
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      // Subtle global pulse overlay
      const glow = 0.05 + 0.15 * Math.cos(phase * 2 * Math.PI) ** 2
      ctx.fillStyle = `rgba(59,130,246,${glow.toFixed(3)})`
      ctx.fillRect(0, 0, width, height)

      rafRef.current = requestAnimationFrame(render)
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(render)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [audioContext, bpm, visible, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: "100%", height: "100%", position: "absolute", inset: 0, pointerEvents: "none", opacity: visible ? 1 : 0 }}
    />
  )
}
