"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Route, Star, Circle, Square, Triangle } from "lucide-react"
import type { MarchingRoute, Waypoint } from "../types/marching-band"

interface RouteManagerProps {
  currentRoute: MarchingRoute | null
  onRouteChange: (route: MarchingRoute | null) => void
}

export default function RouteManager({ currentRoute, onRouteChange }: RouteManagerProps) {
  const [routeName, setRouteName] = useState("")
  const [routeDescription, setRouteDescription] = useState("")
  const [newWaypoint, setNewWaypoint] = useState({ x: 60, y: 26.67 })

  const createNewRoute = () => {
    if (!routeName.trim()) return

    const route: MarchingRoute = {
      id: Date.now().toString(),
      name: routeName,
      description: routeDescription,
      waypoints: [],
      duration: 0,
      formations: [],
    }

    onRouteChange(route)
    setRouteName("")
    setRouteDescription("")
  }

  const addWaypoint = () => {
    if (!currentRoute) return

    const waypoint: Waypoint = {
      id: Date.now().toString(),
      x: newWaypoint.x,
      y: newWaypoint.y,
      timestamp: currentRoute.waypoints.length * 4000,
      formation: `Formation ${currentRoute.waypoints.length + 1}`,
    }

    const updatedRoute = {
      ...currentRoute,
      waypoints: [...currentRoute.waypoints, waypoint],
    }

    onRouteChange(updatedRoute)
  }

  const removeWaypoint = (waypointId: string) => {
    if (!currentRoute) return

    const updatedRoute = {
      ...currentRoute,
      waypoints: currentRoute.waypoints.filter((wp) => wp.id !== waypointId),
    }

    onRouteChange(updatedRoute)
  }

  const loadPresetRoute = (routeType: "parade" | "halftime" | "drill" | "circle" | "star" | "line") => {
    const presetRoutes: Record<string, MarchingRoute> = {
      parade: {
        id: "preset-parade",
        name: "Parade Formation",
        description: "Standard parade marching formation",
        waypoints: [
          { id: "1", x: 10, y: 26.67, timestamp: 0, formation: "Starting Block" },
          { id: "2", x: 60, y: 26.67, timestamp: 8000, formation: "Center Field" },
          { id: "3", x: 110, y: 26.67, timestamp: 16000, formation: "End Zone" },
        ],
        duration: 16000,
        formations: ["Block Formation", "Straight Line"],
      },
      halftime: {
        id: "preset-halftime",
        name: "Halftime Show",
        description: "Complex halftime show with multiple formations",
        waypoints: [
          { id: "1", x: 60, y: 10, timestamp: 0, formation: "Opening Formation" },
          { id: "2", x: 40, y: 26.67, timestamp: 4000, formation: "Left Wing" },
          { id: "3", x: 60, y: 26.67, timestamp: 8000, formation: "Center Star" },
          { id: "4", x: 80, y: 26.67, timestamp: 12000, formation: "Right Wing" },
          { id: "5", x: 60, y: 43.33, timestamp: 16000, formation: "Closing Formation" },
        ],
        duration: 16000,
        formations: ["Star", "Wings", "Circle"],
      },
      drill: {
        id: "preset-drill",
        name: "Marching Drill",
        description: "Basic marching drill patterns",
        waypoints: [
          { id: "1", x: 20, y: 20, timestamp: 0, formation: "Start Position" },
          { id: "2", x: 40, y: 20, timestamp: 4000, formation: "Forward March" },
          { id: "3", x: 40, y: 33.33, timestamp: 8000, formation: "Right Turn" },
          { id: "4", x: 20, y: 33.33, timestamp: 12000, formation: "About Face" },
          { id: "5", x: 20, y: 20, timestamp: 16000, formation: "Return" },
        ],
        duration: 16000,
        formations: ["Line", "Column", "Box"],
      },
      circle: {
        id: "preset-circle",
        name: "Circle Formation",
        description: "Circular formation pattern",
        waypoints: [
          { id: "1", x: 60, y: 26.67, timestamp: 0, formation: "Center" },
          { id: "2", x: 75, y: 26.67, timestamp: 2000, formation: "East" },
          { id: "3", x: 60, y: 40, timestamp: 4000, formation: "South" },
          { id: "4", x: 45, y: 26.67, timestamp: 6000, formation: "West" },
          { id: "5", x: 60, y: 13.33, timestamp: 8000, formation: "North" },
          { id: "6", x: 60, y: 26.67, timestamp: 10000, formation: "Center Return" },
        ],
        duration: 10000,
        formations: ["Circle"],
      },
      star: {
        id: "preset-star",
        name: "Star Formation",
        description: "Five-point star pattern",
        waypoints: [
          { id: "1", x: 60, y: 15, timestamp: 0, formation: "Top Point" },
          { id: "2", x: 75, y: 35, timestamp: 2000, formation: "Right Point" },
          { id: "3", x: 45, y: 25, timestamp: 4000, formation: "Left Inner" },
          { id: "4", x: 75, y: 25, timestamp: 6000, formation: "Right Inner" },
          { id: "5", x: 45, y: 35, timestamp: 8000, formation: "Left Point" },
          { id: "6", x: 60, y: 26.67, timestamp: 10000, formation: "Center" },
        ],
        duration: 10000,
        formations: ["Star"],
      },
      line: {
        id: "preset-line",
        name: "Line Formation",
        description: "Straight line across field",
        waypoints: [
          { id: "1", x: 20, y: 26.67, timestamp: 0, formation: "Left End" },
          { id: "2", x: 40, y: 26.67, timestamp: 2000, formation: "Left Center" },
          { id: "3", x: 60, y: 26.67, timestamp: 4000, formation: "Center" },
          { id: "4", x: 80, y: 26.67, timestamp: 6000, formation: "Right Center" },
          { id: "5", x: 100, y: 26.67, timestamp: 8000, formation: "Right End" },
        ],
        duration: 8000,
        formations: ["Line"],
      },
    }

    onRouteChange(presetRoutes[routeType])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          Route Manager
          {currentRoute && (
            <Badge variant="outline" className="ml-auto">
              {currentRoute.waypoints.length} points
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!currentRoute ? (
          <div className="space-y-6">
            {/* Create New Route */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Create New Route</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="routeName">Route Name</Label>
                  <Input
                    id="routeName"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    placeholder="Enter route name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="routeDescription">Description</Label>
                  <Textarea
                    id="routeDescription"
                    value={routeDescription}
                    onChange={(e) => setRouteDescription(e.target.value)}
                    placeholder="Describe the marching route"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <Button onClick={createNewRoute} className="w-full h-11">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Route
                </Button>
              </div>
            </div>

            {/* Preset Routes */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Preset Formations</h3>
              <div className="grid grid-cols-1 gap-3">
                <Button variant="outline" onClick={() => loadPresetRoute("parade")} className="h-12 justify-start">
                  <Square className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Parade Formation</div>
                    <div className="text-xs text-gray-500">Straight line marching</div>
                  </div>
                </Button>

                <Button variant="outline" onClick={() => loadPresetRoute("halftime")} className="h-12 justify-start">
                  <Star className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Halftime Show</div>
                    <div className="text-xs text-gray-500">Complex multi-formation</div>
                  </div>
                </Button>

                <Button variant="outline" onClick={() => loadPresetRoute("circle")} className="h-12 justify-start">
                  <Circle className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Circle Formation</div>
                    <div className="text-xs text-gray-500">Circular movement pattern</div>
                  </div>
                </Button>

                <Button variant="outline" onClick={() => loadPresetRoute("star")} className="h-12 justify-start">
                  <Star className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Star Formation</div>
                    <div className="text-xs text-gray-500">Five-point star pattern</div>
                  </div>
                </Button>

                <Button variant="outline" onClick={() => loadPresetRoute("drill")} className="h-12 justify-start">
                  <Triangle className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Marching Drill</div>
                    <div className="text-xs text-gray-500">Basic drill patterns</div>
                  </div>
                </Button>

                <Button variant="outline" onClick={() => loadPresetRoute("line")} className="h-12 justify-start">
                  <Square className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Line Formation</div>
                    <div className="text-xs text-gray-500">Straight line across field</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Route Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">{currentRoute.name}</h3>
              <p className="text-sm text-blue-700 mt-1">{currentRoute.description}</p>
              <div className="flex gap-2 mt-3">
                <Badge variant="secondary">{currentRoute.waypoints.length} waypoints</Badge>
                <Badge variant="secondary">{(currentRoute.duration / 1000).toFixed(1)}s duration</Badge>
              </div>
            </div>

            {/* Add Waypoint */}
            <div className="space-y-4">
              <h4 className="font-medium">Add Waypoint</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="waypointX" className="text-sm">
                    X Position (yards)
                  </Label>
                  <Input
                    id="waypointX"
                    type="number"
                    value={newWaypoint.x}
                    onChange={(e) => setNewWaypoint((prev) => ({ ...prev, x: Number(e.target.value) }))}
                    min={0}
                    max={120}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="waypointY" className="text-sm">
                    Y Position (yards)
                  </Label>
                  <Input
                    id="waypointY"
                    type="number"
                    value={newWaypoint.y}
                    onChange={(e) => setNewWaypoint((prev) => ({ ...prev, y: Number(e.target.value) }))}
                    min={0}
                    max={53.33}
                    className="mt-1"
                  />
                </div>
              </div>
              <Button onClick={addWaypoint} className="w-full h-10">
                <Plus className="h-4 w-4 mr-2" />
                Add Waypoint
              </Button>
            </div>

            {/* Waypoints List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Waypoints</h4>
                <Badge variant="outline">{currentRoute.waypoints.length} total</Badge>
              </div>

              {currentRoute.waypoints.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Route className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No waypoints yet</p>
                  <p className="text-xs">Add waypoints above or click on the field</p>
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {currentRoute.waypoints.map((waypoint, index) => (
                    <div key={waypoint.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? "bg-green-500 text-white" : "bg-blue-500 text-white"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            ({waypoint.x.toFixed(1)}, {waypoint.y.toFixed(1)})
                          </div>
                          <div className="text-xs text-gray-500">{waypoint.formation}</div>
                        </div>
                      </div>
                      <Button
                        onClick={() => removeWaypoint(waypoint.id)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Route Actions */}
            <div className="flex gap-2">
              <Button onClick={() => onRouteChange(null)} variant="outline" className="flex-1">
                Clear Route
              </Button>
            </div>

            {/* Tips */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Tips</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Click "Add Points" on the field view to add waypoints by clicking</li>
                <li>• First waypoint (green) is the starting position</li>
                <li>• Waypoints are connected in order to show the path</li>
                <li>• Use preset formations as starting points for custom routes</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
