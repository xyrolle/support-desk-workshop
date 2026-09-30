import { z } from "zod";

export const avatarColors = [
  "amber",
  "emerald",
  "indigo",
  "rose",
  "sky",
  "teal",
  "violet",
] as const;

export const avatarColorSchema = z.enum(avatarColors);

export type AvatarColor = z.infer<typeof avatarColorSchema>;

/** A teammate: someone on the product team who works on tickets. */
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  initials: z.string(),
  email: z.email(),
  avatarColor: avatarColorSchema,
});

export type User = z.infer<typeof userSchema>;
