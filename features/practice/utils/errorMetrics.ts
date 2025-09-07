export type Vec2 = { x: number; y: number }

export function yardsToSteps(yards: number, stepSizeYards: number) {
  return yards / Math.max(0.0001, stepSizeYards)
}

export function stepsToYards(steps: number, stepSizeYards: number) {
  return steps * stepSizeYards
}

export function distanceYards(a: Vec2, b: Vec2) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.hypot(dx, dy)
}

export function directionVector(from: Vec2, to: Vec2) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy) || 1
  return { x: dx / len, y: dy / len }
}

export function nextWaypointIndex(route: { waypoints: Vec2[] } | null, currentIndex: number) {
  if (!route || route.waypoints.length === 0) return 0
  return Math.min(currentIndex + 1, route.waypoints.length - 1)
}

export function errorComponentsYards(current: Vec2, target: Vec2) {
  // Field axes: x (sideline to sideline), y (goal to goal); interpret longitudinal as along x for simplicity
  const dx = target.x - current.x
  const dy = target.y - current.y
  return { lateralYards: dy, longitudinalYards: dx }
}

export function errorInSteps(current: Vec2, target: Vec2, stepSizeYards: number) {
  const dist = distanceYards(current, target)
  const steps = yardsToSteps(dist, stepSizeYards)
  return { yards: dist, steps }
}

export function errorComponentsSteps(current: Vec2, target: Vec2, stepSizeYards: number) {
  const { lateralYards, longitudinalYards } = errorComponentsYards(current, target)
  return {
    lateralSteps: yardsToSteps(lateralYards, stepSizeYards),
    longitudinalSteps: yardsToSteps(longitudinalYards, stepSizeYards),
  }
}

export function isOffTarget(current: Vec2, target: Vec2, stepSizeYards: number, thresholdSteps = 0.5) {
  const { steps } = errorInSteps(current, target, stepSizeYards)
  return steps > thresholdSteps
}
