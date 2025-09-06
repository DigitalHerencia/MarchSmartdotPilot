"use client"

import { useState, useEffect, useRef } from "react"
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
  const [countIn, setCountIn] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  useEffect(() => {
    if (audioContext && isReady) {
      const gainNode = audioContext.createGain()
      gainNode.connect(audioContext.destination)
      gainNode.gain.value = volume[0]
      gainNodeRef.current = gainNode
    }
  }, [audioContext, isReady, volume])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const playClick = (isDownbeat = false) => {
    if (!audioContext || !gainNodeRef.current) return

    const oscillator = audioContext.createOscillator()
    const clickGain = audioContext.createGain()

    oscillator.connect(clickGain)
    clickGain.connect(gainNodeRef.current)

    // Different frequencies for downbeat vs regular beat
    oscillator.frequency.setValueAtTime(isDownbeat ? 1000 : 800, audioContext.currentTime)
    oscillator.type = "square"

    // Short click envelope
    clickGain.gain.setValueAtTime(0, audioContext.currentTime)
    clickGain.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.01)
    clickGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
  }

  const startMetronome = () => {
    if (!isReady) return

    setIsPlaying(true)
    setCurrentBeat(0)

    const interval = 60000 / bpm[0] // Convert BPM to milliseconds

    intervalRef.current = setInterval(() => {
      setCurrentBeat((prev) => {
        const nextBeat = (prev + 1) % beats
        playClick(nextBeat === 0) // Downbeat on beat 1
        return nextBeat
      })
    }, interval)

    // Play first beat immediately
    playClick(true)
  }

  const stopMetronome = () => {
    setIsPlaying(false)
    setCurrentBeat(0)

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const handleBpmChange = (newBpm: number[]) => {
    setBpm(newBpm)

    // Restart metronome with new tempo if currently playing
    if (isPlaying) {
      stopMetronome()
      setTimeout(() => startMetronome(), 100)
    }
  }

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume)
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume[0]
    }
  }

  const adjustBpm = (delta: number) => {
    const newBpm = Math.max(40, Math.min(200, bpm[0] + delta))
    setBpm([newBpm])

    if (isPlaying) {
      stopMetronome()
      setTimeout(() => startMetronome(), 100)
    }
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
    <Card>
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
          <div className="text-4xl font-bold text-blue-600">{bpm[0]}</div>
          <div className="text-sm text-gray-600">{getTempoMarking(bpm[0])}</div>
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

          <div className="text-center text-sm text-gray-600">40 - 200 BPM</div>
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

        {/* Volume Control */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            <label className="text-sm font-medium">Volume</label>
            <span className="text-sm text-gray-500 ml-auto">{Math.round(volume[0] * 100)}%</span>
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
