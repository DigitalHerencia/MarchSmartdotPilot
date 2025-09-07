"use client"

import { useSyncExternalStore } from "react"

export type GpsSnapshot = {
  isTracking: boolean
  accuracy: number | null
  averageAccuracy: number | null
  bestAccuracy: number | null
}

const state: GpsSnapshot = {
  isTracking: false,
  accuracy: null,
  averageAccuracy: null,
  bestAccuracy: null,
}

const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

export const gpsStore = {
  subscribe(cb: () => void) {
    listeners.add(cb)
    return () => listeners.delete(cb)
  },
  getSnapshot(): GpsSnapshot {
    return state
  },
  set(partial: Partial<GpsSnapshot>) {
    Object.assign(state, partial)
    emit()
  },
}

export function useGpsSnapshot() {
  return useSyncExternalStore(gpsStore.subscribe, gpsStore.getSnapshot, gpsStore.getSnapshot)
}
