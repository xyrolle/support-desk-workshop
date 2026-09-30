import { z } from "zod";
import { ticketFiltersSchema } from "./tickets.ts";

/** A private saved filter, as returned by the views API. */
export const savedViewSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  filters: ticketFiltersSchema,
});

export type SavedView = z.infer<typeof savedViewSchema>;

/** Body of POST /api/projects/:projectId/views. */
export const newSavedViewSchema = z.strictObject({
  name: z.string().trim().min(1).max(60),
  filters: ticketFiltersSchema,
});

export type NewSavedView = z.infer<typeof newSavedViewSchema>;
