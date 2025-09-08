import MusicPanel from "@/features/music/MusicPanel";

export default async function Page({ params }: { params: Promise<Record<string, never>> }) {
  await params;
  return <MusicPanel />;
}
