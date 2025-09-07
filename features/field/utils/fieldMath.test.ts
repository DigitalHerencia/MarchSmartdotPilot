import { describe, it, expect } from "vitest"
import { solveAffine, applyAffine, rmsError, type Geo, type Field } from "./fieldMath"

describe("fieldMath affine calibration", () => {
  it("returns null when fewer than 3 pairs provided", () => {
    const g: Geo[] = [{ lat: 1, lon: 1 }, { lat: 2, lon: 2 }]
    const f: Field[] = [{ x: 10, y: 10 }, { x: 20, y: 20 }]
    expect(solveAffine(g, f)).toBeNull()
  })

  it("returns null on length mismatch", () => {
    const g: Geo[] = [{ lat: 1, lon: 1 }, { lat: 2, lon: 2 }, { lat: 3, lon: 3 }]
    const f: Field[] = [{ x: 10, y: 10 }, { x: 20, y: 20 }]
    expect(solveAffine(g, f)).toBeNull()
  })

  it("solves a perfect affine mapping with zero RMS error", () => {
    // Define linear mapping: x = 2*lat + 3*lon + 5; y = -1*lat + 4*lon + 7
    const a = 2, b = 3, tx = 5, c = -1, d = 4, ty = 7
    const geo: Geo[] = [
      { lat: 1, lon: 2 },
      { lat: 3, lon: 4 },
      { lat: -2, lon: 5 },
      { lat: 10, lon: -3 },
    ]
    const field: Field[] = geo.map(({ lat, lon }) => ({ x: a * lat + b * lon + tx, y: c * lat + d * lon + ty }))

    const T = solveAffine(geo, field)
    expect(T).not.toBeNull()
    const err = rmsError(T!, geo, field)
    expect(err).toBeLessThan(1e-9)

    // Apply to a new point and verify closeness
    const test: Geo = { lat: 0.5, lon: -1.25 }
    const mapped = applyAffine(T!, test)
    expect(mapped.x).toBeCloseTo(a * test.lat + b * test.lon + tx, 9)
    expect(mapped.y).toBeCloseTo(c * test.lat + d * test.lon + ty, 9)
  })
})
