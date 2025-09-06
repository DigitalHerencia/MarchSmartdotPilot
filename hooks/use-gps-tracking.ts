"use client"

import { useState, useCallback } from "react"

interface GPSTrackingState {
  position: GeolocationPosition | null
  accuracy: number | null
  isLocationEnabled: boolean
  error: string | null
  isTracking: boolean
  accuracyHistory: number[]
  averageAccuracy: number | null
  bestAccuracy: number | null
}

export function useGPSTracking() {
  const [state, setState] = useState<GPSTrackingState>({
    position: null,
    accuracy: null,
    isLocationEnabled: false,
    error: null,
    isTracking: false,
    accuracyHistory: [],
    averageAccuracy: null,
    bestAccuracy: null,
  })

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by this browser",
      }))
      return false
    }

    try {
      const permission = await navigator.permissions.query({ name: "geolocation" })

      if (permission.state === "denied") {
        setState((prev) => ({
          ...prev,
          error: "Location access denied. Please enable location services.",
        }))
        return false
      }

      return new Promise<boolean>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setState((prev) => {
              const newAccuracy = position.coords.accuracy
              const newAccuracyHistory = [...prev.accuracyHistory, newAccuracy].slice(-20) // Keep last 20 readings

              // Calculate average and best accuracy
              const avgAccuracy = newAccuracyHistory.reduce((sum, val) => sum + val, 0) / newAccuracyHistory.length
              const bestAccuracy = Math.min(...newAccuracyHistory)

              return {
                ...prev,
                position,
                accuracy: newAccuracy,
                accuracyHistory: newAccuracyHistory,
                averageAccuracy: avgAccuracy,
                bestAccuracy: bestAccuracy,
                isLocationEnabled: true,
                error: null,
              }
            })
            resolve(true)
          },
          (error) => {
            let errorMessage = "Failed to get location"
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = "Location access denied by user"
                break
              case error.POSITION_UNAVAILABLE:
                errorMessage = "Location information unavailable"
                break
              case error.TIMEOUT:
                errorMessage = "Location request timed out"
                break
            }
            setState((prev) => ({
              ...prev,
              error: errorMessage,
              isLocationEnabled: false,
            }))
            resolve(false)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          },
        )
      })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to request location permission",
      }))
      return false
    }
  }, [])

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) return

    setState((prev) => ({ ...prev, isTracking: true }))

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState((prev) => {
          const newAccuracy = position.coords.accuracy
          const newAccuracyHistory = [...prev.accuracyHistory, newAccuracy].slice(-20) // Keep last 20 readings

          // Calculate average and best accuracy
          const avgAccuracy = newAccuracyHistory.reduce((sum, val) => sum + val, 0) / newAccuracyHistory.length
          const bestAccuracy = Math.min(...newAccuracyHistory)

          return {
            ...prev,
            position,
            accuracy: newAccuracy,
            accuracyHistory: newAccuracyHistory,
            averageAccuracy: avgAccuracy,
            bestAccuracy: bestAccuracy,
            error: null,
          }
        })
      },
      (error) => {
        let errorMessage = "Tracking error"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location unavailable"
            break
          case error.TIMEOUT:
            errorMessage = "Location timeout"
            break
        }
        setState((prev) => ({
          ...prev,
          error: errorMessage,
        }))
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 1000,
      },
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
      setState((prev) => ({ ...prev, isTracking: false }))
    }
  }, [])

  // Return all the state properties and functions
  return {
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
  }
}
