"use server";
import { RouteSchema } from "@/schemas/routeSchema";
import { getRoute, getRoutes, putRoute, removeRoute } from "@/lib/routes/store";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

const useDb = Boolean(process.env.DATABASE_URL);

export async function createRoute(data: unknown) {
  const parsed = RouteSchema.parse(data);
  if (useDb) {
  const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
  // Ensure the owner user row exists to satisfy FK
  await prisma.user.upsert({ where: { id: userId }, update: {}, create: { id: userId } });
    const created = await prisma.route.create({
      data: {
        id: parsed.id,
        name: parsed.name,
        description: parsed.description,
        duration: parsed.duration,
        formations: parsed.formations,
        ownerId: userId,
        waypoints: {
          create: parsed.waypoints.map((w) => ({ id: w.id, x: w.x, y: w.y, timestamp: BigInt(w.timestamp), formation: w.formation ?? null })),
        },
      },
      include: { waypoints: true },
    });
    return {
      id: created.id,
      name: created.name,
      description: created.description,
      duration: created.duration,
      formations: created.formations,
      waypoints: created.waypoints.map((w) => ({ id: w.id, x: w.x, y: w.y, timestamp: Number(w.timestamp), formation: w.formation ?? undefined })),
    };
  } else {
    putRoute(parsed);
    return parsed;
  }
}

export async function upsertRoute(data: unknown) {
  const parsed = RouteSchema.parse(data);
  if (useDb) {
  const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
  // Ensure the owner user row exists to satisfy FK
  await prisma.user.upsert({ where: { id: userId }, update: {}, create: { id: userId } });
    await prisma.waypoint.deleteMany({ where: { routeId: parsed.id } });
    const saved = await prisma.route.upsert({
      where: { id: parsed.id },
      update: {
        name: parsed.name,
        description: parsed.description,
        duration: parsed.duration,
        formations: parsed.formations,
        waypoints: { create: parsed.waypoints.map((w) => ({ id: w.id, x: w.x, y: w.y, timestamp: BigInt(w.timestamp), formation: w.formation ?? null })) },
      },
      create: {
        id: parsed.id,
        name: parsed.name,
        description: parsed.description,
        duration: parsed.duration,
        formations: parsed.formations,
        ownerId: userId,
        waypoints: { create: parsed.waypoints.map((w) => ({ id: w.id, x: w.x, y: w.y, timestamp: BigInt(w.timestamp), formation: w.formation ?? null })) },
      },
      include: { waypoints: true },
    });
    return {
      id: saved.id,
      name: saved.name,
      description: saved.description,
      duration: saved.duration,
      formations: saved.formations,
      waypoints: saved.waypoints.map((w) => ({ id: w.id, x: w.x, y: w.y, timestamp: Number(w.timestamp), formation: w.formation ?? undefined })),
    };
  } else {
    putRoute(parsed);
    return parsed;
  }
}

export async function listRoutes() {
  if (useDb) {
  const { userId } = await auth();
    if (!userId) return [];
    const rows = await prisma.route.findMany({ where: { ownerId: userId }, include: { waypoints: true } });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      duration: r.duration,
      formations: r.formations,
      waypoints: r.waypoints.map((w) => ({ id: w.id, x: w.x, y: w.y, timestamp: Number(w.timestamp), formation: w.formation ?? undefined })),
    }));
  }
  return getRoutes();
}

export async function getRouteById(id: string) {
  if (useDb) {
  const { userId } = await auth();
    if (!userId) return null;
    const r = await prisma.route.findFirst({ where: { id, ownerId: userId }, include: { waypoints: true } });
    if (!r) return null;
    return {
      id: r.id,
      name: r.name,
      description: r.description,
      duration: r.duration,
      formations: r.formations,
      waypoints: r.waypoints.map((w) => ({ id: w.id, x: w.x, y: w.y, timestamp: Number(w.timestamp), formation: w.formation ?? undefined })),
    };
  }
  return getRoute(id) ?? null;
}

export async function deleteRoute(id: string) {
  if (useDb) {
  const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    await prisma.route.deleteMany({ where: { id, ownerId: userId } });
    return { ok: true } as const;
  } else {
    removeRoute(id);
    return { ok: true } as const;
  }
}
