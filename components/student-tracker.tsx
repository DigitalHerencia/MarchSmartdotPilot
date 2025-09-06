"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Users, MapPin, Wifi, WifiOff, Target, AlertTriangle, CheckCircle2 } from "lucide-react"
import type { Student } from "../types/marching-band"

interface StudentTrackerProps {
  students: Student[]
  currentStudentId: string
  onStudentChange: (studentId: string) => void
  position: GeolocationPosition | null
  accuracy?: number
}

export default function StudentTracker({
  students,
  currentStudentId,
  onStudentChange,
  position,
  accuracy,
}: StudentTrackerProps) {
  const currentStudent = students.find((s) => s.id === currentStudentId)

  const formatCoordinates = (pos: GeolocationPosition) => {
    return `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`
  }

  const getInstrumentColor = (instrument: string): string => {
    const colors: Record<string, string> = {
      trumpet: "bg-yellow-100 text-yellow-800 border-yellow-300",
      trombone: "bg-red-100 text-red-800 border-red-300",
      tuba: "bg-amber-100 text-amber-800 border-amber-300",
      saxophone: "bg-orange-100 text-orange-800 border-orange-300",
      clarinet: "bg-blue-100 text-blue-800 border-blue-300",
      flute: "bg-pink-100 text-pink-800 border-pink-300",
      percussion: "bg-green-100 text-green-800 border-green-300",
      default: "bg-gray-100 text-gray-800 border-gray-300",
    }
    return colors[instrument] || colors.default
  }

  const getSectionIcon = (section: string) => {
    const icons: Record<string, string> = {
      brass: "🎺",
      woodwind: "🎷",
      percussion: "🥁",
      colorguard: "🏃‍♀️",
    }
    return icons[section] || "🎵"
  }

  const getAccuracyColor = (accuracy: number | undefined) => {
    if (!accuracy) return "text-gray-500"
    if (accuracy < 3) return "text-green-600"
    if (accuracy < 10) return "text-amber-600"
    return "text-red-600"
  }

  const getAccuracyBadgeColor = (accuracy: number | undefined) => {
    if (!accuracy) return "secondary"
    if (accuracy < 3) return "success"
    if (accuracy < 10) return "warning"
    return "destructive"
  }

  const getAccuracyDescription = (accuracy: number | undefined) => {
    if (!accuracy) return "Unknown"
    if (accuracy < 3) return "High Precision"
    if (accuracy < 10) return "Medium Precision"
    return "Low Precision"
  }

  const getAccuracyIcon = (accuracy: number | undefined) => {
    if (!accuracy) return <AlertTriangle className="h-4 w-4" />
    if (accuracy < 3) return <CheckCircle2 className="h-4 w-4" />
    if (accuracy < 10) return <Target className="h-4 w-4" />
    return <AlertTriangle className="h-4 w-4" />
  }

  const getAccuracyPercentage = (accuracy: number | undefined) => {
    if (!accuracy) return 0
    // Convert accuracy to a percentage (0-100)
    // Lower accuracy value means higher precision
    // 0m = 100%, 20m = 0%
    return Math.max(0, Math.min(100, 100 - (accuracy / 20) * 100))
  }

  const calculateFieldErrorInYards = (accuracy: number | undefined) => {
    if (!accuracy) return "N/A"
    // Convert meters to yards (1m ≈ 1.09361 yards)
    return (accuracy * 1.09361).toFixed(1)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Student Tracker
          <Badge variant="outline" className="ml-auto">
            {students.length} members
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* GPS Status with Enhanced Accuracy Information */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              GPS Status
            </h4>
            <Badge variant={position ? "default" : "destructive"}>{position ? "Connected" : "Disconnected"}</Badge>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              {position ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
              <span className="font-medium">{position ? "GPS Signal Active" : "No GPS Signal"}</span>
            </div>

            {position && (
              <>
                {/* Accuracy Visualization */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span className="text-sm font-medium">Position Accuracy</span>
                    </div>
                    <Badge variant={getAccuracyBadgeColor(accuracy) as any}>{getAccuracyDescription(accuracy)}</Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <Progress value={getAccuracyPercentage(accuracy)} className="h-2" />
                    <span className={`text-sm font-medium ${getAccuracyColor(accuracy)}`}>
                      ±{accuracy?.toFixed(1) || "N/A"}m
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div className="bg-white p-2 rounded border">
                      <div className="text-xs text-gray-500">Field Error (approx)</div>
                      <div className={`font-medium ${getAccuracyColor(accuracy)}`}>
                        ±{calculateFieldErrorInYards(accuracy)} yards
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <div className="text-xs text-gray-500">Confidence</div>
                      <div className={`font-medium ${getAccuracyColor(accuracy)}`}>
                        {accuracy ? `${Math.max(0, Math.min(99, 100 - accuracy * 5)).toFixed(0)}%` : "Unknown"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* GPS Details */}
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coordinates:</span>
                    <span className="font-mono text-xs">{formatCoordinates(position)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Altitude:</span>
                    <span>{position.coords.altitude?.toFixed(1) || "N/A"}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Speed:</span>
                    <span>{position.coords.speed?.toFixed(1) || "0"} m/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Heading:</span>
                    <span>{position.coords.heading?.toFixed(1) || "N/A"}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Update:</span>
                    <span>{new Date(position.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Current Student Position */}
        {currentStudent && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Current Position
            </h4>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">{getSectionIcon(currentStudent.section)}</div>
                <div>
                  <div className="font-medium">{currentStudent.name}</div>
                  <Badge className={getInstrumentColor(currentStudent.instrument)}>{currentStudent.instrument}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Field X:</span>
                  <div className="font-bold text-lg">{currentStudent.position.x.toFixed(1)} yds</div>
                </div>
                <div>
                  <span className="text-gray-600">Field Y:</span>
                  <div className="font-bold text-lg">{currentStudent.position.y.toFixed(1)} yds</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Band Members List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Band Members</h4>
            <Badge variant="outline">{students.filter((s) => s.isActive).length} active</Badge>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {students.map((student) => (
              <Button
                key={student.id}
                variant={student.id === currentStudentId ? "default" : "outline"}
                className={`w-full h-auto p-4 justify-start ${
                  student.id === currentStudentId ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => onStudentChange(student.id)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="text-xl">{getSectionIcon(student.section)}</div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{student.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className={`text-xs ${getInstrumentColor(student.instrument)}`}>
                        {student.instrument}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {student.section}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`w-3 h-3 rounded-full mb-1 ${student.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                    <div className="text-xs text-gray-500 font-mono">
                      ({student.position.x.toFixed(1)}, {student.position.y.toFixed(1)})
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Section Summary */}
        <div className="space-y-3">
          <h4 className="font-medium">Section Summary</h4>
          <div className="grid grid-cols-2 gap-2">
            {["brass", "woodwind", "percussion", "colorguard"].map((section) => {
              const sectionStudents = students.filter((s) => s.section === section)
              const activeCount = sectionStudents.filter((s) => s.isActive).length

              return (
                <div key={section} className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-lg mb-1">{getSectionIcon(section)}</div>
                  <div className="text-sm font-medium capitalize">{section}</div>
                  <div className="text-xs text-gray-600">
                    {activeCount}/{sectionStudents.length} active
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* GPS Accuracy Tips */}
        <div className="bg-amber-50 p-4 rounded-lg">
          <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            GPS Accuracy Tips
          </h4>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• Stand in open areas away from buildings for best accuracy</li>
            <li>• Wait 30-60 seconds after enabling GPS for accuracy to improve</li>
            <li>• Hold device with clear view of the sky</li>
            <li>• Accuracy below 3m is excellent for marching precision</li>
            <li>• Consider using an external GPS receiver for competition-level accuracy</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
