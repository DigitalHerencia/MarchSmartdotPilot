import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import SettingsPanel from "@/features/practice/SettingsPanel"
import { getShows } from "@/lib/fetchers/shows"

export default async function SettingsPage() {
  const user = await currentUser()
  if (!user) redirect("/sign-in")
  const shows = await getShows()

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      <p className="text-gray-600">User: {user.emailAddresses?.[0]?.emailAddress ?? user.id}</p>
      <div className="mt-6">
        <SettingsPanel shows={shows} />
      </div>
    </div>
  )
}
