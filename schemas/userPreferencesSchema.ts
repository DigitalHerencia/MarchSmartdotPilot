import { z } from "zod";

export const UserPreferencesSchema = z.object({
  userId: z.string().optional(),
  stepSizeYards: z.number().positive().default(2.5),
  fieldType: z.enum(["high-school", "college"]).default("high-school"),
  notationStyle: z.enum(["yardline", "steps-off"]).default("yardline"),
  showId: z.string().optional(),
  partId: z.string().optional(),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
