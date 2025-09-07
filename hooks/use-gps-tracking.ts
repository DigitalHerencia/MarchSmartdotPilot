"use client";

import { useGpsTracker } from "@/features/gps/hooks/useGpsTracker";

// Backward-compatible shim preserving the existing API
export function useGPSTracking() {
  const tracker = useGpsTracker({ hz: 2, smoothing: true });
  return tracker;
}
