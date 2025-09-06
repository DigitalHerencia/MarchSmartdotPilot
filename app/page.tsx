"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Users, Route, Music, Target, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import FieldView from "../components/field-view"
import MusicPlayer from "../components/music-player"
import Metronome from "../components/metronome"
import RouteManager from "../components/route-manager"
import StudentTracker from "../components/student-tracker"
import { useGPSTracking } from "../hooks/use-gps-tracking"
import { useAudioContext } from "../hooks/use-audio-context"
import type { Student, MarchingRoute, Position } from "../types/marching-band"

export default function MarchingBandApp() {
  const [students, setStudents] = useState<Student[]>([])
  const [currentRoute, setCurrentRoute] = useState<MarchingRoute | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [currentStudentId, setCurrentStudentId] = useState<string>("")
  const [activeTab, setActiveTab] = useState("field")
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [calibrationProgress, setCalibrationProgress] = useState(0)
  const [calibrationSamples, setCalibrationSamples] = useState<number[]>([])
  const [calibratedAccuracy, setCalibratedAccuracy] = useState<number | null>(null)

  // Get GPS tracking data from the hook
  const gpsTracking = useGPSTracking()
  const { position, accuracy, isLocationEnabled, requestLocation } = gpsTracking

  const { audioContext, isAudioReady } = useAudioContext()

  useEffect(() => {
    // Initialize with sample student data
    const sampleStudents: Student[] = [
      {
        id: "1",
        name: "Current Student",
        instrument: "trumpet",
        section: "brass",
        position: { x: 60, y: 26.67, timestamp: Date.now() },
        isActive: true,
      },
      {
        id: "2",
        name: "Sarah Johnson",
        instrument: "clarinet",
        section: "woodwind",
        position: { x: 50, y: 20, timestamp: Date.now() },
        isActive: true,
      },
      {
        id: "3",
        name: "Mike Chen",
        instrument: "trombone",
        section: "brass",
        position: { x: 70, y: 33, timestamp: Date.now() },
        isActive: true,
      },
    ]
    setStudents(sampleStudents)
    setCurrentStudentId("1")
  }, [])

  useEffect(() => {
    if (position && currentStudentId) {
      // Convert GPS coordinates to field coordinates
      const fieldPosition = convertGPSToFieldCoordinates(position)

      setStudents((prev) =>
        prev.map((student) => (student.id === currentStudentId ? { ...student, position: fieldPosition } : student)),
      )
    }
  }, [position, currentStudentId])

  useEffect(() => {
    // Handle calibration process
    if (isCalibrating && position && accuracy) {
      // Add current accuracy to samples
      setCalibrationSamples((prev) => [...prev, accuracy])

      // Update progress
      const progress = Math.min(100, (calibrationSamples.length / 10) * 100)
      setCalibrationProgress(progress)

      // If we have enough samples, complete calibration
      if (calibrationSamples.length >= 10) {
        // Calculate average accuracy from samples
        const avgAccuracy = calibrationSamples.reduce((sum, val) => sum + val, 0) / calibrationSamples.length
        setCalibratedAccuracy(avgAccuracy)
        setIsCalibrating(false)
      }
    }
  }, [isCalibrating, position, accuracy, calibrationSamples])

  const convertGPSToFieldCoordinates = (gpsPos: GeolocationPosition): Position => {
    // Convert GPS coordinates to field coordinates (simplified conversion)
    const fieldX = (gpsPos.coords.longitude + 180) * (120 / 360)
    const fieldY = (gpsPos.coords.latitude + 90) * (53.33 / 180)

    return {
      x: Math.max(0, Math.min(120, fieldX)),
      y: Math.max(0, Math.min(53.33, fieldY)),
      timestamp: Date.now(),
    }
  }

  const handleStartTracking = async () => {
    if (!isLocationEnabled) {
      await requestLocation()
    }
    setIsTracking(true)
  }

  const handleStopTracking = () => {
    setIsTracking(false)
  }

  const startCalibration = async () => {
    if (!isLocationEnabled) {
      await requestLocation()
    }
    setCalibrationSamples([])
    setCalibrationProgress(0)
    setIsCalibrating(true)
  }

  const cancelCalibration = () => {
    setIsCalibrating(false)
    setCalibrationSamples([])
    setCalibrationProgress(0)
  }

  const getAccuracyDescription = (accuracy: number | undefined | null) => {
    if (accuracy === null || accuracy === undefined) return "Unknown"
    if (accuracy < 3) return "High"
    if (accuracy < 10) return "Medium"
    return "Low"
  }

  const getAccuracyColor = (accuracy: number | undefined | null) => {
    if (accuracy === null || accuracy === undefined) return "text-gray-600"
    if (accuracy < 3) return "text-green-600"
    if (accuracy < 10) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Marching Band Studio</h1>
              <p className="text-sm md:text-base text-gray-600">Real-time GPS tracking and practice</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isTracking ? "default" : "secondary"} className="text-xs md:text-sm px-3 py-1">
                {isTracking ? "GPS Active" : "GPS Inactive"}
              </Badge>
              {accuracy && (
                <Badge
                  variant={accuracy < 3 ? "success" : accuracy < 10 ? "warning" : "destructive"}
                  className="text-xs"
                >
                  ±{accuracy.toFixed(1)}m
                </Badge>
              )}
              <Button
                size="sm"
                variant="outline"
                className="hidden md:flex items-center gap-1"
                onClick={startCalibration}
              >
                <Target className="h-3 w-3" />
                Calibrate GPS
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-12">
              <TabsTrigger value="field" className="flex flex-col gap-1 text-xs">
                <Route className="h-4 w-4" />
                Field
              </TabsTrigger>
              <TabsTrigger value="music" className="flex flex-col gap-1 text-xs">
                <Music className="h-4 w-4" />
                Music
              </TabsTrigger>
              <TabsTrigger value="routes" className="flex flex-col gap-1 text-xs">
                <Route className="h-4 w-4" />
                Routes
              </TabsTrigger>
              <TabsTrigger value="students" className="flex flex-col gap-1 text-xs">
                <Users className="h-4 w-4" />
                Students
              </TabsTrigger>
            </TabsList>

            <TabsContent value="field" className="mt-4">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between text-lg">
                    Football Field
                    <div className="flex gap-2">
                      <Button onClick={handleStartTracking} disabled={isTracking} size="sm" className="h-10 px-4">
                        {isTracking ? "Tracking" : "Start GPS"}
                      </Button>
                      {isTracking && (
                        <Button onClick={handleStopTracking} variant="outline" size="sm" className="h-10 px-4">
                          Stop
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FieldView
                    students={students}
                    route={currentRoute}
                    isTracking={isTracking}
                    accuracy={accuracy || undefined}
                    onRouteChange={setCurrentRoute}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="music" className="mt-4 space-y-4">
              <MusicPlayer audioContext={audioContext} isReady={isAudioReady} />
              <Metronome audioContext={audioContext} isReady={isAudioReady} />
            </TabsContent>

            <TabsContent value="routes" className="mt-4">
              <RouteManager currentRoute={currentRoute} onRouteChange={setCurrentRoute} />
            </TabsContent>

            <TabsContent value="students" className="mt-4">
              <StudentTracker
                students={students}
                currentStudentId={currentStudentId}
                onStudentChange={setCurrentStudentId}
                position={position}
                accuracy={accuracy || undefined}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* GPS Accuracy Info Card (Mobile) */}
        <div className="lg:hidden">
          {accuracy && (
            <Card
              className={`border-l-4 ${
                accuracy < 3 ? "border-l-green-500" : accuracy < 10 ? "border-l-amber-500" : "border-l-red-500"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span className="font-medium">GPS Accuracy</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={startCalibration}>
                    Calibrate
                  </Button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={(1 - Math.min(accuracy, 20) / 20) * 100} className="h-2 flex-1" />
                  <span className={`text-sm font-medium ${getAccuracyColor(accuracy)}`}>
                    {getAccuracyDescription(accuracy)} (±{accuracy.toFixed(1)}m)
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {/* Main Field View */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Football Field - Overhead View
                  <div className="flex gap-3">
                    <Button
                      onClick={handleStartTracking}
                      disabled={isTracking}
                      variant={isTracking ? "secondary" : "default"}
                      className="h-10 px-6"
                    >
                      {isTracking ? "GPS Tracking Active" : "Start GPS Tracking"}
                    </Button>
                    {isTracking && (
                      <Button onClick={handleStopTracking} variant="outline" className="h-10 px-6">
                        Stop Tracking
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FieldView
                  students={students}
                  route={currentRoute}
                  isTracking={isTracking}
                  accuracy={accuracy || undefined}
                  onRouteChange={setCurrentRoute}
                />
              </CardContent>
            </Card>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            <Tabs defaultValue="music" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-12">
                <TabsTrigger value="music" className="text-sm">
                  Music
                </TabsTrigger>
                <TabsTrigger value="routes" className="text-sm">
                  Routes
                </TabsTrigger>
                <TabsTrigger value="students" className="text-sm">
                  Students
                </TabsTrigger>
              </TabsList>

              <TabsContent value="music" className="space-y-4 mt-4">
                <MusicPlayer audioContext={audioContext} isReady={isAudioReady} />
                <Metronome audioContext={audioContext} isReady={isAudioReady} />
              </TabsContent>

              <TabsContent value="routes" className="mt-4">
                <RouteManager currentRoute={currentRoute} onRouteChange={setCurrentRoute} />
              </TabsContent>

              <TabsContent value="students" className="mt-4">
                <StudentTracker
                  students={students}
                  currentStudentId={currentStudentId}
                  onStudentChange={setCurrentStudentId}
                  position={position}
                  accuracy={accuracy || undefined}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* GPS Calibration Dialog */}
      <Dialog open={isCalibrating} onOpenChange={cancelCalibration}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Calibrating GPS Accuracy</DialogTitle>
            <DialogDescription>
              Please remain stationary while we collect GPS samples to improve accuracy.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                <div
                  className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent"
                  style={{
                    transform: `rotate(${calibrationProgress * 3.6}deg)`,
                    transition: "transform 0.5s ease",
                  }}
                ></div>
                <div className="text-2xl font-bold text-blue-700">{Math.round(calibrationProgress)}%</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Samples collected:</span>
                <span className="font-medium">{calibrationSamples.length}/10</span>
              </div>
              <Progress value={calibrationProgress} className="h-2" />
            </div>

            {accuracy && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Current Reading</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Accuracy:</span>
                    <div className={`font-medium ${getAccuracyColor(accuracy)}`}>±{accuracy.toFixed(1)}m</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Quality:</span>
                    <div className={`font-medium ${getAccuracyColor(accuracy)}`}>
                      {getAccuracyDescription(accuracy)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertCircle className="h-4 w-4" />
              <span>For best results, stand in an open area away from buildings.</span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={cancelCalibration}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Calibration Results Dialog */}
      <Dialog open={calibratedAccuracy !== null} onOpenChange={() => setCalibratedAccuracy(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>GPS Calibration Complete</DialogTitle>
            <DialogDescription>We&apos;ve analyzed your GPS signal quality based on multiple samples.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div
              className={`p-6 rounded-lg text-center ${
                calibratedAccuracy && calibratedAccuracy < 3
                  ? "bg-green-50"
                  : calibratedAccuracy && calibratedAccuracy < 10
                    ? "bg-amber-50"
                    : "bg-red-50"
              }`}
            >
              <div className={`text-4xl font-bold mb-2 ${getAccuracyColor(calibratedAccuracy)}`}>
                ±{calibratedAccuracy?.toFixed(1) || "?"}m
              </div>
              <div className={`text-lg font-medium ${getAccuracyColor(calibratedAccuracy)}`}>
                {getAccuracyDescription(calibratedAccuracy)} Precision
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">What this means:</h4>
              {calibratedAccuracy && calibratedAccuracy < 3 ? (
                <p className="text-sm text-gray-600">
                  Your GPS accuracy is excellent! You can expect precise position tracking suitable for
                  competition-level marching.
                </p>
              ) : calibratedAccuracy && calibratedAccuracy < 10 ? (
                <p className="text-sm text-gray-600">
                  Your GPS accuracy is acceptable for practice sessions. For better precision, try moving to a more open
                  area.
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Your GPS accuracy is limited. Consider moving to an open area away from buildings or using an external
                  GPS receiver for better results.
                </p>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Field Position Impact</h4>
              <p className="text-sm text-blue-800">
                With your current GPS accuracy of ±{calibratedAccuracy?.toFixed(1) || "?"}m, expect field positions to
                be accurate within approximately ±{calibratedAccuracy ? (calibratedAccuracy * 1.09361).toFixed(1) : "?"}{" "}
                yards.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setCalibratedAccuracy(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
