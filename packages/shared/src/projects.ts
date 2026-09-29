import { z } from "zod";

export const projectSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string(),
});

export type Project = z.infer<typeof projectSchema>;
