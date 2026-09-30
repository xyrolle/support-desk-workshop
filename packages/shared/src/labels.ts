import { z } from "zod";

export const labelColors = [
  "gray",
  "red",
  "orange",
  "amber",
  "green",
  "teal",
  "blue",
  "indigo",
  "violet",
  "pink",
] as const;

export const labelColorSchema = z.enum(labelColors);

export type LabelColor = z.infer<typeof labelColorSchema>;

/** A tag on tickets. Every project has its own set of labels. */
export const labelSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  color: labelColorSchema,
});

export type Label = z.infer<typeof labelSchema>;
