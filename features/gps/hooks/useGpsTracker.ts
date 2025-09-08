"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { gpsStore } from "@/lib/gps/store";

interface GPSTrackingState {
  position: GeolocationPosition | null;
  accuracy: number | null;
  isLocationEnabled: boolean;
  error: string | null;
  isTracking: boolean;
  accuracyHistory: number[];
  averageAccuracy: number | null;
  bestAccuracy: number | null;
}

export interface UseGpsOptions {
  hz?: number; // default 2
  smoothing?: boolean; // default true
}

export function useGpsTracker(opts: UseGpsOptions = {}) {
  const [state, setState] = useState<GPSTrackingState>({
    position: null,
    accuracy: null,
    isLocationEnabled: false,
    error: null,
    isTracking: false,
    accuracyHistory: [],
    averageAccuracy: null,
    bestAccuracy: null,
  });

  const hz = opts.hz ?? 2;
  const smoothing = opts.smoothing ?? true;
  const watchIdRef = useRef<number | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setState((p) => ({ ...p, error: "Geolocation is not supported by this browser" }));
      return false;
    }
    try {
      const permission = await navigator.permissions.query({ name: "geolocation" as PermissionName });
      if (permission.state === "denied") {
        setState((p) => ({ ...p, error: "Location access denied. Please enable location services." }));
        return false;
      }
      await new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setState((prev) => ({ ...prev, position, accuracy: position.coords.accuracy, isLocationEnabled: true }));
            resolve();
          },
          () => reject(new Error("Failed to get location")),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        );
      });
      return true;
      } catch {
        setState((p) => ({ ...p, error: "Failed to request location permission" }));
        return false;
      }
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    setState((p) => ({ ...p, isTracking: true }));
  gpsStore.set({ isTracking: true });

    // spin up worker for throttling/smoothing
    try {
      const worker = new Worker(new URL("../../gps/workers/gpsWorker.ts", import.meta.url), { type: "module" });
      workerRef.current = worker;
      worker.postMessage({ type: "init", hz, smoothing });
      worker.onmessage = (ev: MessageEvent<{ type: "tick"; payload: { lat: number; lon: number; accuracy?: number; t: number } }>) => {
        const { payload } = ev.data;
        const workerPosition: GeolocationPosition = {
          coords: {
            latitude: payload.lat,
            longitude: payload.lon,
            altitude: null,
            accuracy: payload.accuracy ?? state.accuracy ?? 0,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: payload.t,
        } as unknown as GeolocationPosition;

        setState((prev) => {
          const newAccuracy = workerPosition.coords.accuracy ?? prev.accuracy ?? 0;
          const accHist = [...prev.accuracyHistory, newAccuracy].slice(-20);
          const avg = accHist.length ? accHist.reduce((s, v) => s + v, 0) / accHist.length : null;
          const best = accHist.length ? Math.min(...accHist) : null;
          gpsStore.set({ accuracy: newAccuracy, averageAccuracy: avg, bestAccuracy: best });
          return { ...prev, position: workerPosition, accuracy: newAccuracy, accuracyHistory: accHist, averageAccuracy: avg, bestAccuracy: best };
        });
      };
    } catch {
      // Worker failed; fallback: no worker
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setState((prev) => ({ ...prev, isLocationEnabled: true }));
        const payload = { lat: position.coords.latitude, lon: position.coords.longitude, accuracy: position.coords.accuracy, t: Date.now() };
        workerRef.current?.postMessage({ type: "position", payload });
        if (typeof payload.accuracy === "number") {
          gpsStore.set({ accuracy: payload.accuracy });
        }
      },
      (error) => {
        let errorMessage = "Tracking error";
        if (error.code === error.PERMISSION_DENIED) errorMessage = "Location access denied";
        else if (error.code === error.POSITION_UNAVAILABLE) errorMessage = "Location unavailable";
        else if (error.code === error.TIMEOUT) errorMessage = "Location timeout";
        setState((prev) => ({ ...prev, error: errorMessage }));
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 1000 },
    );

    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      workerRef.current?.terminate();
      workerRef.current = null;
      setState((p) => ({ ...p, isTracking: false }));
  gpsStore.set({ isTracking: false });
    };
  }, [hz, smoothing, state.accuracy]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    workerRef.current?.terminate();
    workerRef.current = null;
    setState((p) => ({ ...p, isTracking: false }));
  gpsStore.set({ isTracking: false });
  }, []);

  return useMemo(
    () => ({
      position: state.position,
      accuracy: state.accuracy,
      isLocationEnabled: state.isLocationEnabled,
      error: state.error,
      isTracking: state.isTracking,
      accuracyHistory: state.accuracyHistory,
      averageAccuracy: state.averageAccuracy,
      bestAccuracy: state.bestAccuracy,
      requestLocation,
      startTracking,
      stopTracking,
    }),
    [requestLocation, startTracking, stopTracking, state],
  );
}
