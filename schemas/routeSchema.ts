import { z } from "zod";

export const WaypointSchema = z.object({
  id: z.string(),
  x: z.number().min(0).max(120),
  y: z.number().min(0).max(53.34),
  timestamp: z.number(),
  formation: z.string().optional(),
});

export const RouteSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().default(""),
  waypoints: z.array(WaypointSchema),
  duration: z.number().nonnegative().default(0),
  formations: z.array(z.string()).default([]),
});

export type Waypoint = z.infer<typeof WaypointSchema>;
export type MarchingRoute = z.infer<typeof RouteSchema>;
