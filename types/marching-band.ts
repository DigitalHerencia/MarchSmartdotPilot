export interface Position {
  x: number // Field coordinates (0-120 yards)
  y: number // Field coordinates (0-53.33 yards)
  timestamp: number
}

export interface Student {
  id: string
  name: string
  instrument: string
  section: "brass" | "woodwind" | "percussion" | "colorguard"
  position: Position
  isActive: boolean
}

export interface Waypoint {
  id: string
  x: number
  y: number
  timestamp: number
  formation?: string
}

export interface Formation {
  id: string
  name: string
  description: string
  positions: Record<string, Position> // studentId -> position
  duration: number
}

export interface MarchingRoute {
  id: string
  name: string
  description: string
  waypoints: Waypoint[]
  duration: number // in milliseconds
  formations: string[]
}

export interface MusicNote {
  frequency: number
  duration: number
  velocity?: number
}

export interface MusicSequence {
  id: string
  name: string
  notes: MusicNote[]
  tempo: number // BPM
  timeSignature: [number, number] // [beats, noteValue]
}

export interface Practice {
  id: string
  routeId: string
  musicId?: string
  startTime: number
  endTime?: number
  studentPositions: Record<string, Position[]> // studentId -> position history
  accuracy: number[]
  completed: boolean
}
