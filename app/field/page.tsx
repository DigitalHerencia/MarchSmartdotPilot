import { fetchRoutes } from "@/lib/fetchers/routes";
import { getPreferences } from "@/lib/actions/preferences";
import { FieldView } from "@/features/field";

export default async function Page({ params }: { params: Promise<Record<string, never>> }) {
  await params;
  const [routes, prefs] = await Promise.all([fetchRoutes(), getPreferences()]);
  const route = routes[0] ?? null;
  const stepSize = prefs?.stepSizeYards ?? 0.75;
  return (
    <div className="p-4">
      <FieldView students={[]} route={route} isTracking={false} stepSizeYards={stepSize} />
    </div>
  );
}
