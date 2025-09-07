import type { MarchingRoute } from "@/schemas/routeSchema";

// Simple in-memory store. Non-persistent; swap to DB in Phase 4.
const routes = new Map<string, MarchingRoute>();

export function putRoute(route: MarchingRoute) {
  routes.set(route.id, route);
}

export function getRoute(id: string) {
  return routes.get(id);
}

export function getRoutes() {
  return Array.from(routes.values());
}

export function removeRoute(id: string) {
  routes.delete(id);
}
