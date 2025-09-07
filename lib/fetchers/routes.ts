import { RouteSchema, type MarchingRoute } from "@/schemas/routeSchema";
import { createRoute, listRoutes, deleteRoute as deleteRouteAction, upsertRoute, getRouteById } from "@/lib/actions/routes";

export async function fetchRoutes(): Promise<MarchingRoute[]> {
  return listRoutes();
}

export async function fetchRoute(id: string): Promise<MarchingRoute | null> {
  return getRouteById(id);
}

export async function saveRoute(route: unknown): Promise<MarchingRoute> {
  const parsed = RouteSchema.parse(route);
  return upsertRoute(parsed);
}

export async function createNewRoute(route: unknown): Promise<MarchingRoute> {
  const parsed = RouteSchema.parse(route);
  return createRoute(parsed);
}

export async function deleteRoute(id: string) {
  return deleteRouteAction(id);
}
