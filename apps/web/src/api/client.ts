import {
  type ErrorCode,
  errorResponseSchema,
  projectSchema,
  type TicketListQuery,
  ticketPageSchema,
  userSchema,
} from "@support-desk/shared";
import type { z } from "zod";
import { toSearchParams } from "../lib/search-params.ts";

export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCode;

  constructor(status: number, code: ErrorCode, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

/** Calls the API and checks the response against the shared zod schema. */
async function request<Schema extends z.ZodType>(
  path: string,
  schema: Schema,
): Promise<z.infer<Schema>> {
  const response = await fetch(`/api${path}`, { headers: { Accept: "application/json" } });
  const body = await readJson(response);

  if (!response.ok) {
    throw toApiError(response.status, body);
  }
  return schema.parse(body);
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function toApiError(status: number, body: unknown): ApiError {
  const parsed = errorResponseSchema.safeParse(body);
  if (parsed.success) {
    return new ApiError(status, parsed.data.error.code, parsed.data.error.message);
  }
  return new ApiError(status, "internal_error", `The API responded with status ${status}.`);
}

function projectPath(projectId: string): string {
  return `/projects/${encodeURIComponent(projectId)}`;
}

export const api = {
  getCurrentUser() {
    return request("/me", userSchema);
  },

  listProjects() {
    return request("/projects", projectSchema.array());
  },

  getProject(projectId: string) {
    return request(projectPath(projectId), projectSchema);
  },

  listTickets(projectId: string, query: TicketListQuery) {
    const searchParams = toSearchParams(query);
    return request(`${projectPath(projectId)}/tickets?${searchParams}`, ticketPageSchema);
  },
};
