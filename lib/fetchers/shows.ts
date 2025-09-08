import "server-only"
import { prisma } from "@/lib/db"
import { ShowSchema, type Show } from "@/schemas"

export async function getShows(): Promise<Show[]> {
  const shows = await prisma.show.findMany({ include: { parts: true } })
  return ShowSchema.array().parse(shows)
}
