"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Clock, Volume2, Minus, Plus } from "lucide-react"

interface MetronomeProps {
  audioContext: AudioContext | null
  isReady: boolean
}

export default function Metronome({ audioContext, isReady }: MetronomeProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBpm] = useState([120])
  const [beats, setBeats] = useState(4)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [volume, setVolume] = useState([0.5])
  const [countIn] = useState(false)

  // Audio graph
  const masterGainRef = useRef<GainNode | null>(null)

  // Scheduler state
  const lookaheadRef = useRef<number>(25) // ms between scheduler ticks
  const scheduleAheadTimeRef = useRef<number>(0.2) // seconds to schedule ahead
  const nextNoteTimeRef = useRef<number>(0) // AudioContext time for next note
  const nextBeatIndexRef = useRef<number>(0)
  const schedulerTimerRef = useRef<number | null>(null)

  // Visual pulse canvas
  const pulseCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (audioContext && isReady) {
      // Initialize (or update) master gain
      if (!masterGainRef.current) {
        masterGainRef.current = audioContext.createGain()
        masterGainRef.current.connect(audioContext.destination)
      }
      masterGainRef.current.gain.value = volume[0]
    }
  }, [audioContext, isReady, volume])

  useEffect(() => {
    return () => {
      // Cleanup timers/raf
      if (schedulerTimerRef.current) {
        window.clearInterval(schedulerTimerRef.current)
        schedulerTimerRef.current = null
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [])
  const scheduleClick = useCallback(
    (time: number, isDownbeat = false) => {
      if (!audioContext || !masterGainRef.current) return
      const osc = audioContext.createOscillator()
      const clickGain = audioContext.createGain()
      osc.connect(clickGain)
      clickGain.connect(masterGainRef.current)
      osc.type = "square"
      const freq = isDownbeat ? 1000 : 800
      osc.frequency.setValueAtTime(freq, time)
      // envelope
      clickGain.gain.setValueAtTime(0, time)
      clickGain.gain.linearRampToValueAtTime(0.4, time + 0.01)
      clickGain.gain.linearRampToValueAtTime(0, time + 0.08)
      osc.start(time)
      osc.stop(time + 0.1)
    },
    [audioContext],
  )

  const schedulerTick = useCallback(() => {
    if (!audioContext || !isPlaying) return
    const secondsPerBeat = 60.0 / bpm[0]
    while (nextNoteTimeRef.current < audioContext.currentTime + scheduleAheadTimeRef.current) {
      const isDownbeat = nextBeatIndexRef.current % beats === 0
      scheduleClick(nextNoteTimeRef.current, isDownbeat)
      // advance to next
      nextNoteTimeRef.current += secondsPerBeat
      nextBeatIndexRef.current = (nextBeatIndexRef.current + 1) % beats
    }
  }, [audioContext, isPlaying, bpm, beats, scheduleClick])

  const startVisualPulse = useCallback(() => {
    if (!audioContext) return
    const canvas = pulseCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const render = () => {
      const width = canvas.width
      const height = canvas.height
      ctx.clearRect(0, 0, width, height)

      // progress within current beat [0,1)
      const spb = 60.0 / bpm[0]
      const now = audioContext.currentTime
      // Find the time of the last scheduled tick in the past
      // Using nextNoteTimeRef gives the time of the next beat; compute last
      const nextTime = nextNoteTimeRef.current
      const lastTime = nextTime - spb
      const phase = Math.min(1, Math.max(0, (now - lastTime) / spb))

      // Draw bar background
      ctx.fillStyle = "#e5e7eb"
      ctx.fillRect(0, height - 6, width, 6)

      // Draw progress
      ctx.fillStyle = "#3b82f6"
      ctx.fillRect(0, height - 6, width * phase, 6)

      // Beat circles pulse
      const count = beats
      const margin = 8
      const circleAreaW = width - margin * 2
      const step = circleAreaW / count
      for (let i = 0; i < count; i++) {
        const isDown = i === 0
        const cx = margin + step * i + step / 2
        const cy = height / 2
        const baseR = 8
        const pulse = i === ((nextBeatIndexRef.current - 1 + count) % count) ? 1 : 0
        const r = baseR + pulse * 6
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fillStyle = isDown ? "#ef4444" : "#60a5fa"
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(render)
    }
    // Kick off
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(render)
  }, [audioContext, bpm, beats])

  const startMetronome = () => {
    if (!isReady || !audioContext) return
    // Resume audio context on user gesture if needed
    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {})
    }
    setIsPlaying(true)
    setCurrentBeat(0)
    nextBeatIndexRef.current = 0
    nextNoteTimeRef.current = audioContext.currentTime + 0.05 // small delay to start
    // Start scheduler
    if (schedulerTimerRef.current) window.clearInterval(schedulerTimerRef.current)
    schedulerTimerRef.current = window.setInterval(() => {
      schedulerTick()
      // Derive UI beat index from audio schedule for display
      setCurrentBeat((prev) => nextBeatIndexRef.current === 0 ? beats - 1 : nextBeatIndexRef.current - 1)
    }, lookaheadRef.current) as unknown as number
    // Start visual pulse
    startVisualPulse()
  }

  const stopMetronome = () => {
    setIsPlaying(false)
    setCurrentBeat(0)
    if (schedulerTimerRef.current) {
      window.clearInterval(schedulerTimerRef.current)
      schedulerTimerRef.current = null
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  const handleBpmChange = (newBpm: number[]) => {
    setBpm(newBpm)
  }

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume)
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = newVolume[0]
    }
  }

  const adjustBpm = (delta: number) => {
    const newBpm = Math.max(40, Math.min(200, bpm[0] + delta))
    setBpm([newBpm])
  }

  const getTempoMarking = (bpm: number): string => {
    if (bpm < 60) return "Largo"
    if (bpm < 76) return "Adagio"
    if (bpm < 108) return "Andante"
    if (bpm < 120) return "Moderato"
    if (bpm < 168) return "Allegro"
    if (bpm < 200) return "Presto"
    return "Prestissimo"
  }

  return (
    <Card className="card-surface elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Metronome
          <Badge variant={isPlaying ? "default" : "secondary"} className="ml-auto">
            {isPlaying ? "Active" : "Stopped"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* BPM Display */}
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold text-primary">{bpm[0]}</div>
          <div className="text-sm text-muted-foreground">{getTempoMarking(bpm[0])}</div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={startMetronome}
            disabled={!isReady || isPlaying}
            size="lg"
            className="h-12 w-12 p-0 rounded-full"
          >
            <Play className="h-5 w-5" />
          </Button>
          <Button
            onClick={stopMetronome}
            disabled={!isPlaying}
            variant="outline"
            size="lg"
            className="h-12 w-12 p-0 rounded-full"
          >
            <Pause className="h-5 w-5" />
          </Button>
        </div>

        {/* BPM Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button onClick={() => adjustBpm(-5)} size="sm" variant="outline" className="h-8 w-8 p-0">
              <Minus className="h-3 w-3" />
            </Button>
            <div className="flex-1">
              <Slider value={bpm} onValueChange={handleBpmChange} max={200} min={40} step={1} className="w-full" />
            </div>
            <Button onClick={() => adjustBpm(5)} size="sm" variant="outline" className="h-8 w-8 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">40 - 200 BPM</div>
        </div>

        {/* Time Signature */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Time Signature</label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={beats}
              onChange={(e) => setBeats(Math.max(1, Math.min(12, Number.parseInt(e.target.value) || 4)))}
              min={1}
              max={12}
              className="w-16 h-10 text-center"
            />
            <span className="text-lg font-medium">/4</span>
            <div className="text-sm text-gray-600 ml-auto">{beats} beats per measure</div>
          </div>
        </div>

        {/* Visual Pulse Canvas */}
        <div className="w-full">
          <canvas
            ref={pulseCanvasRef}
            width={560}
            height={60}
            className="w-full h-16 rounded-md bg-card border"
          />
        </div>

        {/* Volume Control */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            <label className="text-sm font-medium">Volume</label>
            <span className="text-sm text-muted-foreground ml-auto">{Math.round(volume[0] * 100)}%</span>
          </div>
          <Slider value={volume} onValueChange={handleVolumeChange} max={1} min={0} step={0.1} className="w-full" />
        </div>

        {/* Beat Indicator */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Beat Indicator</label>
          <div className="flex justify-center gap-2">
            {Array.from({ length: beats }, (_, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-100 ${
                  i === currentBeat && isPlaying
                    ? "bg-blue-500 text-white border-blue-500 scale-110 shadow-lg"
                    : i === 0
                      ? "border-red-400 text-red-400 bg-red-50"
                      : "border-gray-300 text-gray-500 bg-gray-50"
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

  {/* Status */}
        <div className="text-center">
          <Badge variant={isPlaying ? "default" : "secondary"} className="text-sm">
            {isPlaying ? `Beat ${currentBeat + 1} of ${beats}` : "Ready to start"}
          </Badge>
        </div>

        {/* Quick Tempo Presets */}
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={() => handleBpmChange([80])} variant="outline" size="sm" disabled={isPlaying}>
            Slow (80)
          </Button>
          <Button onClick={() => handleBpmChange([120])} variant="outline" size="sm" disabled={isPlaying}>
            Medium (120)
          </Button>
          <Button onClick={() => handleBpmChange([140])} variant="outline" size="sm" disabled={isPlaying}>
            Fast (140)
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
