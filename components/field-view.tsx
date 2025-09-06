"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ZoomIn, ZoomOut, RotateCcw, Plus, Target, AlertCircle } from "lucide-react"
import type { Student, MarchingRoute, Waypoint } from "../types/marching-band"

interface FieldViewProps {
  students: Student[]
  route: MarchingRoute | null
  isTracking: boolean
  accuracy?: number
  onRouteChange?: (route: MarchingRoute | null) => void
}

export default function FieldView({ students, route, isTracking, accuracy, onRouteChange }: FieldViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [isAddingWaypoints, setIsAddingWaypoints] = useState(false)
  const [showAccuracy, setShowAccuracy] = useState(true)
  const [accuracyScale, setAccuracyScale] = useState([1.0])
  const [accuracyThreshold, setAccuracyThreshold] = useState(10) // meters

  useEffect(() => {
    const updateCanvasSize = () => {
      const container = canvasRef.current?.parentElement
      if (container) {
        const width = Math.min(container.clientWidth - 32, 800)
        const height = (width * 53.33) / 120
        setCanvasSize({ width, height })
      }
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)
    return () => window.removeEventListener("resize", updateCanvasSize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Save context for transformations
    ctx.save()

    // Apply zoom and pan
    ctx.translate(pan.x, pan.y)
    ctx.scale(zoom, zoom)

    // Draw football field
    drawFootballField(ctx, canvas.width / zoom, canvas.height / zoom)

    // Draw route if available
    if (route) {
      drawRoute(ctx, route, canvas.width / zoom, canvas.height / zoom)
    }

    // Draw students
    students.forEach((student) => {
      drawStudent(ctx, student, canvas.width / zoom, canvas.height / zoom, accuracy)
    })

    // Restore context
    ctx.restore()

    // Draw UI elements (not affected by zoom/pan)
    if (isTracking) {
      drawTrackingIndicator(ctx, canvas.width, canvas.height)
    }

    if (isAddingWaypoints) {
      drawAddWaypointIndicator(ctx, canvas.width, canvas.height)
    }
  }, [students, route, isTracking, accuracy, canvasSize, zoom, pan, isAddingWaypoints, showAccuracy, accuracyScale])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isAddingWaypoints || !onRouteChange) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left - pan.x) / zoom
    const y = (event.clientY - rect.top - pan.y) / zoom

    // Convert canvas coordinates to field coordinates
    const fieldX = (x / canvas.width) * 120
    const fieldY = (y / canvas.height) * 53.33

    // Ensure coordinates are within field bounds
    const clampedX = Math.max(0, Math.min(120, fieldX))
    const clampedY = Math.max(0, Math.min(53.33, fieldY))

    if (!route) {
      // Create new route
      const newRoute: MarchingRoute = {
        id: Date.now().toString(),
        name: "New Route",
        description: "Click-created route",
        waypoints: [],
        duration: 0,
        formations: [],
      }
      onRouteChange(newRoute)
    }

    // Add waypoint to current route
    const waypoint: Waypoint = {
      id: Date.now().toString(),
      x: clampedX,
      y: clampedY,
      timestamp: route ? route.waypoints.length * 4000 : 0,
      formation: `Position ${(route?.waypoints.length || 0) + 1}`,
    }

    const updatedRoute = {
      ...(route || {
        id: Date.now().toString(),
        name: "New Route",
        description: "Click-created route",
        waypoints: [],
        duration: 0,
        formations: [],
      }),
      waypoints: [...(route?.waypoints || []), waypoint],
    }

    onRouteChange(updatedRoute)
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isAddingWaypoints) return
    setIsDragging(true)
    setLastMousePos({ x: event.clientX, y: event.clientY })
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || isAddingWaypoints) return

    const deltaX = event.clientX - lastMousePos.x
    const deltaY = event.clientY - lastMousePos.y

    setPan((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }))

    setLastMousePos({ x: event.clientX, y: event.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.5))
  }

  const handleResetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const toggleAddWaypoints = () => {
    setIsAddingWaypoints((prev) => !prev)
  }

  const toggleAccuracy = () => {
    setShowAccuracy((prev) => !prev)
  }

  const handleAccuracyScaleChange = (newScale: number[]) => {
    setAccuracyScale(newScale)
  }

  const getAccuracyColor = (accuracy: number | undefined): string => {
    if (!accuracy) return "rgba(255, 165, 0, 0.4)"

    if (accuracy < 3) return "rgba(0, 200, 0, 0.4)" // Good accuracy (green)
    if (accuracy < 10) return "rgba(255, 165, 0, 0.4)" // Medium accuracy (orange)
    return "rgba(255, 0, 0, 0.4)" // Poor accuracy (red)
  }

  const getAccuracyDescription = (accuracy: number | undefined): string => {
    if (!accuracy) return "Unknown"

    if (accuracy < 3) return "High"
    if (accuracy < 10) return "Medium"
    return "Low"
  }

  const drawFootballField = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Field background with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, "#2d5a27")
    gradient.addColorStop(0.5, "#1e4a1e")
    gradient.addColorStop(1, "#2d5a27")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Field border
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 3
    ctx.strokeRect(0, 0, width, height)

    // Yard lines (every 5 yards)
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 2
    for (let i = 0; i <= 24; i++) {
      const x = (i * width) / 24
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Hash marks
    ctx.lineWidth = 1
    for (let i = 1; i < 24; i++) {
      const x = (i * width) / 24
      // Top hash marks
      ctx.beginPath()
      ctx.moveTo(x, height * 0.1)
      ctx.lineTo(x, height * 0.15)
      ctx.stroke()

      // Bottom hash marks
      ctx.beginPath()
      ctx.moveTo(x, height * 0.85)
      ctx.lineTo(x, height * 0.9)
      ctx.stroke()
    }

    // Goal lines
    ctx.strokeStyle = "#ffff00"
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(width * 0.083, 0)
    ctx.lineTo(width * 0.083, height)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(width * 0.917, 0)
    ctx.lineTo(width * 0.917, height)
    ctx.stroke()

    // 50 yard line
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(width / 2, 0)
    ctx.lineTo(width / 2, height)
    ctx.stroke()

    // Yard numbers
    ctx.fillStyle = "#ffffff"
    ctx.font = `bold ${Math.max(14, width / 35)}px Arial`
    ctx.textAlign = "center"

    const yardNumbers = [10, 20, 30, 40, 50, 40, 30, 20, 10]
    yardNumbers.forEach((num, index) => {
      const x = ((index + 2) * width) / 12
      ctx.fillText(num.toString(), x, height * 0.25)
      ctx.fillText(num.toString(), x, height * 0.75)
    })
  }

  const drawRoute = (ctx: CanvasRenderingContext2D, route: MarchingRoute, width: number, height: number) => {
    if (route.waypoints.length < 2) return

    // Draw route path
    ctx.strokeStyle = "#ff4444"
    ctx.lineWidth = 4
    ctx.setLineDash([8, 4])

    ctx.beginPath()
    route.waypoints.forEach((waypoint, index) => {
      const x = (waypoint.x / 120) * width
      const y = (waypoint.y / 53.33) * height

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()
    ctx.setLineDash([])

    // Draw waypoint markers
    route.waypoints.forEach((waypoint, index) => {
      const x = (waypoint.x / 120) * width
      const y = (waypoint.y / 53.33) * height

      // Waypoint circle
      ctx.fillStyle = index === 0 ? "#00ff88" : "#ff4444"
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, 2 * Math.PI)
      ctx.fill()

      // White border
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.stroke()

      // Waypoint number
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 12px Arial"
      ctx.textAlign = "center"
      ctx.fillText((index + 1).toString(), x, y + 4)

      // Formation label
      if (waypoint.formation) {
        ctx.fillStyle = "#000000"
        ctx.font = "10px Arial"
        ctx.fillText(waypoint.formation, x, y - 15)
      }
    })
  }

  const drawStudent = (
    ctx: CanvasRenderingContext2D,
    student: Student,
    width: number,
    height: number,
    accuracy?: number,
  ) => {
    const x = (student.position.x / 120) * width
    const y = (student.position.y / 53.33) * height

    // Draw accuracy circle if available and enabled
    if (showAccuracy && accuracy && accuracy > 0) {
      // Convert GPS accuracy (meters) to field coordinates (yards)
      // Assuming 1 meter ≈ 1.09361 yards and scaling by the accuracy scale factor
      const accuracyInYards = accuracy * 1.09361 * accuracyScale[0]

      // Convert yards to pixels based on field dimensions
      const accuracyRadius = (accuracyInYards / 120) * width

      // Draw accuracy circle with color based on accuracy level
      const accuracyColor = getAccuracyColor(accuracy)

      // Draw outer circle (pulsing effect)
      ctx.strokeStyle = accuracyColor
      ctx.lineWidth = 2
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.arc(x, y, accuracyRadius, 0, 2 * Math.PI)
      ctx.stroke()

      // Fill with translucent color
      ctx.fillStyle = accuracyColor.replace("0.4", "0.1")
      ctx.fill()

      ctx.setLineDash([])

      // Draw inner circle (solid)
      ctx.beginPath()
      ctx.arc(x, y, accuracyRadius * 0.3, 0, 2 * Math.PI)
      ctx.fillStyle = accuracyColor.replace("0.4", "0.2")
      ctx.fill()
    }

    // Draw student marker (larger and more visible)
    const color = getInstrumentColor(student.instrument)
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, 12, 0, 2 * Math.PI)
    ctx.fill()

    // Draw border
    ctx.strokeStyle = student.isActive ? "#ffffff" : "#666666"
    ctx.lineWidth = 3
    ctx.stroke()

    // Draw instrument icon (simplified)
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 10px Arial"
    ctx.textAlign = "center"
    const instrumentIcon = getInstrumentIcon(student.instrument)
    ctx.fillText(instrumentIcon, x, y + 3)

    // Draw student name
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 11px Arial"
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 3
    ctx.strokeText(student.name, x, y - 18)
    ctx.fillText(student.name, x, y - 18)
  }

  const drawTrackingIndicator = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "rgba(76, 175, 80, 0.9)"
    ctx.beginPath()
    ctx.arc(25, 25, 10, 0, 2 * Math.PI)
    ctx.fill()

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 14px Arial"
    ctx.textAlign = "left"
    ctx.fillText("GPS Active", 45, 30)
  }

  const drawAddWaypointIndicator = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "rgba(255, 68, 68, 0.9)"
    ctx.beginPath()
    ctx.arc(25, height - 25, 10, 0, 2 * Math.PI)
    ctx.fill()

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 14px Arial"
    ctx.textAlign = "left"
    ctx.fillText("Click to add waypoint", 45, height - 20)
  }

  const getInstrumentColor = (instrument: string): string => {
    const colors: Record<string, string> = {
      trumpet: "#ffd700",
      trombone: "#ff6347",
      tuba: "#8b4513",
      saxophone: "#daa520",
      clarinet: "#4169e1",
      flute: "#ff69b4",
      percussion: "#32cd32",
      default: "#808080",
    }
    return colors[instrument] || colors.default
  }

  const getInstrumentIcon = (instrument: string): string => {
    const icons: Record<string, string> = {
      trumpet: "🎺",
      trombone: "🎺",
      tuba: "🎺",
      saxophone: "🎷",
      clarinet: "🎵",
      flute: "🎵",
      percussion: "🥁",
      default: "♪",
    }
    return icons[instrument] || icons.default
  }

  return (
    <div className="w-full space-y-4">
      {/* Field Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Button onClick={handleZoomIn} size="sm" variant="outline" className="h-9 w-9 p-0">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button onClick={handleZoomOut} size="sm" variant="outline" className="h-9 w-9 p-0">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button onClick={handleResetView} size="sm" variant="outline" className="h-9 w-9 p-0">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-sm text-gray-600">Zoom: {(zoom * 100).toFixed(0)}%</div>

        <div className="flex items-center gap-2">
          <Button
            onClick={toggleAddWaypoints}
            size="sm"
            variant={isAddingWaypoints ? "default" : "outline"}
            className="h-9"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Points
          </Button>

          <Button onClick={toggleAccuracy} size="sm" variant={showAccuracy ? "default" : "outline"} className="h-9">
            <Target className="h-4 w-4 mr-1" />
            {showAccuracy ? "Hide Accuracy" : "Show Accuracy"}
          </Button>
        </div>
      </div>

      {/* Accuracy Controls (only shown when accuracy is visible) */}
      {showAccuracy && accuracy && accuracy > 0 && (
        <div className="p-3 bg-blue-50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm">GPS Accuracy Visualization</span>
            </div>
            <div className="text-sm">
              <span
                className={`font-medium ${
                  accuracy < 3 ? "text-green-600" : accuracy < 10 ? "text-amber-600" : "text-red-600"
                }`}
              >
                {getAccuracyDescription(accuracy)} Precision (±{accuracy.toFixed(1)}m)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Accuracy Circle Scale:</span>
              <span>{accuracyScale[0].toFixed(1)}x</span>
            </div>
            <Slider
              value={accuracyScale}
              onValueChange={handleAccuracyScaleChange}
              min={0.1}
              max={2}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Smaller</span>
              <span>Actual Size</span>
              <span>Larger</span>
            </div>
          </div>

          <div className="text-xs text-gray-600 flex items-center gap-2">
            <AlertCircle className="h-3 w-3" />
            <span>Circles show estimated position accuracy. Smaller circles mean higher precision.</span>
          </div>
        </div>
      )}

      {/* Field Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="border-2 border-gray-300 rounded-lg w-full cursor-move"
          style={{
            maxWidth: "100%",
            height: "auto",
            cursor: isAddingWaypoints ? "crosshair" : isDragging ? "grabbing" : "grab",
          }}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* Field Info */}
      <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <span>Football Field (120 × 53⅓ yards)</span>
        <span
          className={`font-medium ${
            !accuracy
              ? "text-gray-600"
              : accuracy < 3
                ? "text-green-600"
                : accuracy < 10
                  ? "text-amber-600"
                  : "text-red-600"
          }`}
        >
          GPS Accuracy: {accuracy ? `±${accuracy.toFixed(1)}m` : "N/A"}
        </span>
        <span>Students: {students.length}</span>
        <span>Waypoints: {route?.waypoints.length || 0}</span>
      </div>
    </div>
  )
}
