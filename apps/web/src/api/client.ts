import {
  commentSchema,
  type ErrorCode,
  errorResponseSchema,
  labelSchema,
  type NewComment,
  type NewProjectMember,
  organizationDetailSchema,
  type ProjectMemberChanges,
  projectMemberSchema,
  projectSchema,
  type TicketChanges,
  type TicketListQuery,
  ticketDetailSchema,
  ticketEventSchema,
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

export function isForbiddenError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 403;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

/** Calls the API and checks the response against the shared zod schema. */
async function request<Schema extends z.ZodType>(
  path: string,
  schema: Schema,
  options?: RequestOptions,
): Promise<z.infer<Schema>> {
  const response = await send(path, options);
  return schema.parse(await readJson(response));
}

/** Calls the API; any answer but 2xx becomes an ApiError with the API's message. */
async function send(path: string, { method = "GET", body }: RequestOptions = {}) {
  const headers: HeadersInit = { Accept: "application/json" };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw toApiError(response.status, await readJson(response));
  }
  return response;
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

function ticketPath(projectId: string, ticketId: string): string {
  return `${projectPath(projectId)}/tickets/${encodeURIComponent(ticketId)}`;
}

function organizationPath(organizationId: string): string {
  return `/organizations/${encodeURIComponent(organizationId)}`;
}

export const api = {
  getCurrentUser() {
    return request("/me", userSchema);
  },

  listUsers() {
    return request("/users", userSchema.array());
  },

  listMyTickets(query: TicketListQuery) {
    return request(`/me/tickets?${toSearchParams(query)}`, ticketPageSchema);
  },

  listProjects() {
    return request("/projects", projectSchema.array());
  },

  getProject(projectId: string) {
    return request(projectPath(projectId), projectSchema);
  },

  listLabels(projectId: string) {
    return request(`${projectPath(projectId)}/labels`, labelSchema.array());
  },

  listMembers(projectId: string) {
    return request(`${projectPath(projectId)}/members`, projectMemberSchema.array());
  },

  addMember(projectId: string, member: NewProjectMember) {
    return request(`${projectPath(projectId)}/members`, projectMemberSchema, {
      method: "POST",
      body: member,
    });
  },

  changeMemberRole(projectId: string, userId: string, changes: ProjectMemberChanges) {
    const path = `${projectPath(projectId)}/members/${encodeURIComponent(userId)}`;
    return request(path, projectMemberSchema, { method: "PATCH", body: changes });
  },

  async removeMember(projectId: string, userId: string) {
    const path = `${projectPath(projectId)}/members/${encodeURIComponent(userId)}`;
    await send(path, { method: "DELETE" });
  },

  listTickets(projectId: string, query: TicketListQuery) {
    const searchParams = toSearchParams(query);
    return request(`${projectPath(projectId)}/tickets?${searchParams}`, ticketPageSchema);
  },

  getTicket(projectId: string, ticketId: string) {
    return request(ticketPath(projectId, ticketId), ticketDetailSchema);
  },

  updateTicket(projectId: string, ticketId: string, changes: TicketChanges) {
    return request(ticketPath(projectId, ticketId), ticketDetailSchema, {
      method: "PATCH",
      body: changes,
    });
  },

  listComments(projectId: string, ticketId: string) {
    return request(`${ticketPath(projectId, ticketId)}/comments`, commentSchema.array());
  },

  addComment(projectId: string, ticketId: string, comment: NewComment) {
    return request(`${ticketPath(projectId, ticketId)}/comments`, commentSchema, {
      method: "POST",
      body: comment,
    });
  },

  listActivity(projectId: string, ticketId: string) {
    return request(`${ticketPath(projectId, ticketId)}/activity`, ticketEventSchema.array());
  },

  getOrganization(organizationId: string) {
    return request(organizationPath(organizationId), organizationDetailSchema);
  },

  listOrganizationTickets(organizationId: string, query: TicketListQuery) {
    const searchParams = toSearchParams(query);
    return request(`${organizationPath(organizationId)}/tickets?${searchParams}`, ticketPageSchema);
  },
};
