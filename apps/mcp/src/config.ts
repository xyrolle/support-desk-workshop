import { z } from "zod";

const environmentSchema = z.object({
  SUPPORT_DESK_API_URL: z.url().default("http://localhost:8787/api"),
});

/** The HTTP API this server calls. It never opens the database. */
export function readConfig(env: { SUPPORT_DESK_API_URL?: string } = process.env) {
  const environment = environmentSchema.parse({
    SUPPORT_DESK_API_URL: env.SUPPORT_DESK_API_URL,
  });
  return { apiUrl: environment.SUPPORT_DESK_API_URL.replace(/\/$/, "") };
}
