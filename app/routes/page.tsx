import RouteList from "@/features/routes/RouteList";

export default async function Page({ params }: { params: Promise<Record<string, never>> }) {
  await params;
  return (
    <div className="p-4">
      <RouteList />
    </div>
  );
}
