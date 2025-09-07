import { describe, it, expect } from "vitest"
import { yardsToSteps, stepsToYards, distanceYards, errorComponentsYards, errorInSteps, isOffTarget } from "./errorMetrics"

describe("errorMetrics", () => {
  it("converts yards to steps and back", () => {
    const yards = 3
    const step = 0.75
    const steps = yardsToSteps(yards, step)
    expect(stepsToYards(steps, step)).toBeCloseTo(yards, 6)
  })

  it("computes distance in yards", () => {
    expect(distanceYards({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
  })

  it("computes error components and steps", () => {
    const current = { x: 10, y: 10 }
    const target = { x: 11, y: 12 }
    const comps = errorComponentsYards(current, target)
    expect(comps.longitudinalYards).toBeCloseTo(1)
    expect(comps.lateralYards).toBeCloseTo(2)
    const { yards, steps } = errorInSteps(current, target, 0.75)
    expect(yards).toBeCloseTo(Math.hypot(1, 2))
    expect(steps).toBeCloseTo(yards / 0.75)
  })

  it("checks off-target threshold", () => {
    const current = { x: 0, y: 0 }
    const target = { x: 0.375, y: 0 }
    // 0.5 steps threshold with 0.75 yard step => 0.375 yards
    expect(isOffTarget(current, target, 0.75, 0.5)).toBe(false)
    const target2 = { x: 0.5, y: 0 }
    expect(isOffTarget(current, target2, 0.75, 0.5)).toBe(true)
  })
})
