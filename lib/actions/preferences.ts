"use server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"

const PrefSchema = z.object({
  stepSizeYards: z.number().positive().max(5),
  fieldType: z.enum(["high-school", "college"]),
  notationStyle: z.enum(["yardline", "steps-off"]),
})

export async function getPreferences() {
  const { userId } = await auth()
  if (!userId) return null
  const pref = await prisma.userPreferences.findUnique({ where: { userId } })
  return pref
}

export async function savePreferences(input: unknown) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  const data = PrefSchema.parse(input)
  // Ensure user exists to satisfy FK
  await prisma.user.upsert({ where: { id: userId }, update: {}, create: { id: userId } })
  const pref = await prisma.userPreferences.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  })
  return pref
}
