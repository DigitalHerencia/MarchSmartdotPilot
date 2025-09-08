import PracticeHUD from "@/features/practice/PracticeHUD";
import { fetchRoutes } from "@/lib/fetchers/routes";
import { getPreferences } from "@/lib/actions/preferences";

export default async function Page({ params }: { params: Promise<Record<string, never>> }) {
  await params;
  const [routes, prefs] = await Promise.all([fetchRoutes(), getPreferences()]);
  const route = routes[0] ?? null;
  const stepSize = prefs?.stepSizeYards ?? 0.75;
  const bpm = 120;
  return (
    <div className="p-4 space-y-4">
      <PracticeHUD
        bpm={bpm}
        stepSizeYards={stepSize}
        current={null}
        route={route}
        previewIndex={0}
      />
    </div>
  );
}
