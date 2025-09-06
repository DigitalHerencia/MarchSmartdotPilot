"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Play, Square, Volume2, Music, SkipBack, SkipForward } from "lucide-react"

interface MusicPlayerProps {
  audioContext: AudioContext | null
  isReady: boolean
}

export default function MusicPlayer({ audioContext, isReady }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState([0.7])
  const [currentTrack, setCurrentTrack] = useState(0)
  const [progress, setProgress] = useState(0)

  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const progressRef = useRef<number>(0)

  // Sample tracks for demonstration
  const tracks = [
    {
      name: "C Major Scale",
      melody: [
        { note: 261.63, duration: 0.5 }, // C4
        { note: 293.66, duration: 0.5 }, // D4
        { note: 329.63, duration: 0.5 }, // E4
        { note: 349.23, duration: 0.5 }, // F4
        { note: 392.0, duration: 0.5 }, // G4
        { note: 440.0, duration: 0.5 }, // A4
        { note: 493.88, duration: 0.5 }, // B4
        { note: 523.25, duration: 1.0 }, // C5
      ],
    },
    {
      name: "Warm-up Sequence",
      melody: [
        { note: 440.0, duration: 1.0 }, // A4
        { note: 493.88, duration: 1.0 }, // B4
        { note: 523.25, duration: 1.0 }, // C5
        { note: 493.88, duration: 1.0 }, // B4
        { note: 440.0, duration: 2.0 }, // A4
      ],
    },
    {
      name: "Marching Cadence",
      melody: [
        { note: 392.0, duration: 0.25 }, // G4
        { note: 392.0, duration: 0.25 }, // G4
        { note: 440.0, duration: 0.5 }, // A4
        { note: 392.0, duration: 0.25 }, // G4
        { note: 392.0, duration: 0.25 }, // G4
        { note: 440.0, duration: 0.5 }, // A4
        { note: 523.25, duration: 1.0 }, // C5
      ],
    },
  ]

  useEffect(() => {
    if (audioContext && isReady) {
      const gainNode = audioContext.createGain()
      gainNode.connect(audioContext.destination)
      gainNode.gain.value = volume[0]
      gainNodeRef.current = gainNode
    }
  }, [audioContext, isReady, volume])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 1
          if (newProgress >= 100) {
            setIsPlaying(false)
            return 0
          }
          return newProgress
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  const playMelody = async () => {
    if (!audioContext || !gainNodeRef.current) return

    const currentMelody = tracks[currentTrack].melody
    setIsPlaying(true)
    setProgress(0)

    let currentTimeOffset = 0
    const totalDuration = currentMelody.reduce((sum, note) => sum + note.duration, 0)

    for (const note of currentMelody) {
      const oscillator = audioContext.createOscillator()
      const noteGain = audioContext.createGain()

      oscillator.connect(noteGain)
      noteGain.connect(gainNodeRef.current)

      oscillator.frequency.setValueAtTime(note.note, audioContext.currentTime + currentTimeOffset)
      oscillator.type = "sine"

      // Envelope for smooth attack and release
      noteGain.gain.setValueAtTime(0, audioContext.currentTime + currentTimeOffset)
      noteGain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + currentTimeOffset + 0.1)
      noteGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + currentTimeOffset + note.duration)

      oscillator.start(audioContext.currentTime + currentTimeOffset)
      oscillator.stop(audioContext.currentTime + currentTimeOffset + note.duration)

      currentTimeOffset += note.duration
    }

    // Stop playing after melody completes
    setTimeout(() => {
      setIsPlaying(false)
      setProgress(0)
    }, currentTimeOffset * 1000)
  }

  const stopPlayback = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop()
      oscillatorRef.current = null
    }
    setIsPlaying(false)
    setProgress(0)
  }

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume)
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume[0]
    }
  }

  const nextTrack = () => {
    if (!isPlaying) {
      setCurrentTrack((prev) => (prev + 1) % tracks.length)
    }
  }

  const prevTrack = () => {
    if (!isPlaying) {
      setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Music Player
          <Badge variant="outline" className="ml-auto">
            {currentTrack + 1}/{tracks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Track Info */}
        <div className="text-center space-y-2">
          <h3 className="font-medium text-lg">{tracks[currentTrack].name}</h3>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button onClick={prevTrack} disabled={isPlaying} size="sm" variant="outline" className="h-10 w-10 p-0">
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            onClick={playMelody}
            disabled={!isReady || isPlaying}
            size="lg"
            className="h-12 w-12 p-0 rounded-full"
          >
            <Play className="h-5 w-5" />
          </Button>

          <Button onClick={stopPlayback} disabled={!isPlaying} variant="outline" size="sm" className="h-10 w-10 p-0">
            <Square className="h-4 w-4" />
          </Button>

          <Button onClick={nextTrack} disabled={isPlaying} size="sm" variant="outline" className="h-10 w-10 p-0">
            <SkipForward className="h-4 w-4" />
          </Button>
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

        {/* Status */}
        <div className="flex items-center justify-between text-sm">
          <Badge variant={isPlaying ? "default" : "secondary"}>{isPlaying ? "Playing" : "Stopped"}</Badge>
          <Badge variant={isReady ? "default" : "destructive"}>{isReady ? "Audio Ready" : "Audio Loading"}</Badge>
        </div>

        {/* Info Panel */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 text-blue-900">Practice Tracks</h4>
          <p className="text-sm text-blue-700">
            Use these practice tracks to synchronize formations with music. Upload your own tracks for custom routines.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
