"use client"

import type { MarchingRoute } from "@/schemas/routeSchema"
import { enqueueChange, installOnlineSync } from "@/lib/routes/offlineStore"
import { upsertRoute as upsertRouteAction, deleteRoute as deleteRouteAction } from "@/lib/actions/routes"

export function initRouteSync() {
  installOnlineSync(async (items) => {
    for (const i of items) {
      try {
        if (i.type === "upsert" && i.route) {
          await upsertRouteAction(i.route as MarchingRoute)
        } else if (i.type === "delete" && i.routeId) {
          await deleteRouteAction(i.routeId)
        }
      } catch {
        // If it fails while online, it will be re-enqueued by caller or user retry
      }
    }
  })
}

export async function upsertRouteOfflineAndQueue(route: MarchingRoute) {
  await enqueueChange({ type: "upsert", route, at: Date.now() })
}

export async function deleteRouteOfflineAndQueue(routeId: string) {
  await enqueueChange({ type: "delete", routeId, at: Date.now() })
}
