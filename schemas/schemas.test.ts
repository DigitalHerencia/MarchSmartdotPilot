import { describe, it, expect } from "vitest"
import { RouteSchema, WaypointSchema } from "./routeSchema"
import { UserPreferencesSchema } from "./userPreferencesSchema"
import { ParsedMusicSchema } from "./musicSchema"

describe("Route & Waypoint schemas", () => {
  it("parses a valid route", () => {
    const route = RouteSchema.parse({
      id: "r1",
      name: "Test",
      description: "",
      waypoints: [
        { id: "w1", x: 10, y: 20, timestamp: 0, formation: "A" },
        { id: "w2", x: 60, y: 26.67, timestamp: 4000 },
      ],
      duration: 4000,
      formations: [],
    })
    expect(route.id).toBe("r1")
    expect(route.waypoints).toHaveLength(2)
  })

  it("rejects out-of-bounds waypoint", () => {
    expect(() => WaypointSchema.parse({ id: "w1", x: 130, y: 20, timestamp: 0 })).toThrow()
  })
})

describe("UserPreferences schema", () => {
  it("applies defaults and validates enums", () => {
    const prefs = UserPreferencesSchema.parse({ stepSizeYards: 0.75 })
    expect(prefs.fieldType).toBe("high-school")
    expect(prefs.notationStyle).toBe("yardline")
  })

  it("rejects non-positive step size", () => {
    expect(() => UserPreferencesSchema.parse({ stepSizeYards: 0 })).toThrow()
  })
})

describe("ParsedMusic schema", () => {
  it("parses minimal valid music payload", () => {
    const m = ParsedMusicSchema.parse({
      title: "Song",
      tempo: 120,
      timeSignature: { beats: 4, beatValue: 4 },
      measures: [{ number: 1, durationBeats: 4 }],
    })
    expect(m.tempo).toBe(120)
  })

  it("rejects invalid time signature", () => {
    expect(() => ParsedMusicSchema.parse({ tempo: 120, timeSignature: { beats: 0, beatValue: 4 }, measures: [] })).toThrow()
  })
})
