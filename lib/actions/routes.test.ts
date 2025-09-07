import { describe, it, expect, beforeEach } from "vitest";
import type { MarchingRoute } from "@/schemas/routeSchema";
import { createRoute, listRoutes, deleteRoute } from "./routes";

const baseRoute = (): MarchingRoute => ({
  id: crypto.randomUUID(),
  name: "Test Route",
  description: "",
  duration: 0,
  formations: [],
  waypoints: [],
});

describe("route actions (in-memory)", () => {
  beforeEach(async () => {
    const routes = await listRoutes();
    for (const r of routes) {
      await deleteRoute(r.id);
    }
  });

  it("creates and lists routes", async () => {
    const route = baseRoute();
    await createRoute(route);
    const routes = await listRoutes();
    expect(routes).toHaveLength(1);
    expect(routes[0]).toMatchObject({ id: route.id, name: route.name });
  });

  it("deletes routes", async () => {
    const route = baseRoute();
    await createRoute(route);
    await deleteRoute(route.id);
    const routes = await listRoutes();
    expect(routes.find((r) => r.id === route.id)).toBeUndefined();
  });
});
