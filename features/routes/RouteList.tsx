"use client";

import { useState, useEffect, useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { MarchingRoute } from "@/schemas/routeSchema";
import { createRoute, deleteRoute } from "@/lib/actions/routes";
import { fetchRoutes } from "@/lib/fetchers/routes";

export default function RouteList() {
  const [routes, setRoutes] = useState<MarchingRoute[]>([]);
  const [optimisticRoutes, setOptimisticRoutes] = useOptimistic(
    routes,
    (state, action: { type: "add"; route: MarchingRoute } | { type: "remove"; id: string }) => {
      switch (action.type) {
        case "add":
          return [...state, action.route];
        case "remove":
          return state.filter((r) => r.id !== action.id);
      }
    },
  );
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const initial = await fetchRoutes();
        setRoutes(initial);
      } catch {
        // ignore fetch errors
      }
    })();
  }, []);

  async function handleAdd() {
    if (!name.trim()) return;
    const route: MarchingRoute = {
      id: crypto.randomUUID(),
      name,
      description: "",
      waypoints: [],
      duration: 0,
      formations: [],
    };
    startTransition(async () => {
      setOptimisticRoutes({ type: "add", route });
      setName("");
      try {
        const saved = await createRoute(route);
        setRoutes((prev) => [...prev, saved]);
      } catch {
        // revert on error
        setRoutes((prev) => prev);
      }
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      setOptimisticRoutes({ type: "remove", id });
      try {
        await deleteRoute(id);
        setRoutes((prev) => prev.filter((r) => r.id !== id));
      } catch {
        // refetch on error
        if (typeof fetchRoutes === "function") {
          const refreshed = await fetchRoutes();
          setRoutes(refreshed);
        } // else, do nothing (fetchRoutes not defined)
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Saved Routes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Route name"
            className="flex-1"
          />
          <Button onClick={handleAdd} disabled={isPending} className="shrink-0">
            Add
          </Button>
        </div>
        <ul className="space-y-2">
          {optimisticRoutes.map((r) => (
            <li key={r.id} className="flex items-center justify-between">
              <span className="text-sm">{r.name}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(r.id)}
                disabled={isPending}
              >
                Delete
              </Button>
            </li>
          ))}
          {optimisticRoutes.length === 0 && (
            <li className="text-sm text-muted-foreground">No routes saved</li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
