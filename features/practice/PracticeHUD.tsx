"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  distanceYards,
  directionVector,
  yardsToSteps,
  errorComponentsYards,
  errorComponentsSteps,
} from "@/features/practice/utils/errorMetrics";

export default function PracticeHUD({
  bpm,
  stepSizeYards,
  current,
  route,
  previewIndex,
}: {
  bpm: number;
  stepSizeYards: number;
  current: { x: number; y: number } | null;
  route: { waypoints: { x: number; y: number }[] } | null;
  previewIndex: number;
}) {
  const target = useMemo(
    () =>
      route ? route.waypoints[Math.min(previewIndex, (route.waypoints.length || 1) - 1)] : null,
    [route, previewIndex],
  );

  const metrics = useMemo(() => {
    if (!current || !target) return null;
    const distYards = distanceYards(current, target);
    const distSteps = yardsToSteps(distYards, stepSizeYards);
    const dir = directionVector(current, target);
    const compsY = errorComponentsYards(current, target);
    const compsS = errorComponentsSteps(current, target, stepSizeYards);
    return { distYards, distSteps, dir, compsY, compsS };
  }, [current, target, stepSizeYards]);

  return (
    <Card>
      <CardContent className="p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">BPM {bpm}</Badge>
          <Badge variant="outline">Step {previewIndex + 1}</Badge>
          <Badge variant="outline">Step Size {stepSizeYards.toFixed(2)} yd</Badge>
        </div>
        <div className="text-sm sm:text-base">
          {metrics ? (
            <span>
              {metrics.distYards.toFixed(1)} yd ({metrics.distSteps.toFixed(1)} steps)
              <span className="ml-2 text-muted-foreground">
                Lateral {metrics.compsY.lateralYards.toFixed(1)} yards (
                {metrics.compsS.lateralSteps.toFixed(1)} steps), Longitudinal{" "}
                {metrics.compsY.longitudinalYards.toFixed(1)} yards (
                {metrics.compsS.longitudinalSteps.toFixed(1)} steps)
              </span>
              <span className="ml-2 text-muted-foreground">
                → dx {metrics.dir.x.toFixed(2)}, dy {metrics.dir.y.toFixed(2)}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">No target</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
