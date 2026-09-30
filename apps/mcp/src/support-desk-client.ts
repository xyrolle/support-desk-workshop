import {
  type Comment,
  commentSchema,
  errorResponseSchema,
  type Project,
  projectSchema,
  type TicketDetail,
  type TicketEvent,
  type TicketPage,
  type TicketStatus,
  ticketDetailSchema,
  ticketEventSchema,
  ticketPageSchema,
} from "@support-desk/shared";
import type { z } from "zod";

/** The API answered with an error body. The message is the API's own. */
export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

/** Nothing accepted the connection, so the API process is not up. */
export class ApiUnavailableError extends Error {
  constructor() {
    super("The Support Desk API is not running. Start it with npm run dev.");
    this.name = "ApiUnavailableError";
  }
}

/**
 * Read-only client for the Support Desk HTTP API.
 * Every call is a GET, so a later write route cannot be reached from here.
 */
export class SupportDeskClient {
  private readonly apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl.replace(/\/$/, "");
  }

  searchTickets(projectId: string, query: string, status?: TicketStatus): Promise<TicketPage> {
    const params = new URLSearchParams({ q: query });
    if (status) {
      params.set("status", status);
    }
    return this.get(this.ticketCollectionPath(projectId, params), ticketPageSchema);
  }

  getTicket(projectId: string, ticketId: string): Promise<TicketDetail> {
    return this.get(this.ticketPath(projectId, ticketId), ticketDetailSchema);
  }

  listComments(projectId: string, ticketId: string): Promise<Comment[]> {
    return this.get(`${this.ticketPath(projectId, ticketId)}/comments`, commentSchema.array());
  }

  listActivity(projectId: string, ticketId: string): Promise<TicketEvent[]> {
    return this.get(`${this.ticketPath(projectId, ticketId)}/activity`, ticketEventSchema.array());
  }

  listProjects(): Promise<Project[]> {
    return this.get("/projects", projectSchema.array());
  }

  listAtRiskTickets(projectId: string, page: number): Promise<TicketPage> {
    const params = new URLSearchParams({ sla: "at_risk", page: String(page) });
    return this.get(this.ticketCollectionPath(projectId, params), ticketPageSchema);
  }

  private ticketCollectionPath(projectId: string, params: URLSearchParams): string {
    return `${this.projectPath(projectId)}/tickets?${params}`;
  }

  private ticketPath(projectId: string, ticketId: string): string {
    return `${this.projectPath(projectId)}/tickets/${encodeURIComponent(ticketId)}`;
  }

  private projectPath(projectId: string): string {
    return `/projects/${encodeURIComponent(projectId)}`;
  }

  private async get<Schema extends z.ZodType>(
    path: string,
    schema: Schema,
  ): Promise<z.infer<Schema>> {
    let response: Response;
    try {
      response = await fetch(`${this.apiUrl}${path}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
    } catch {
      throw new ApiUnavailableError();
    }

    const body = await readJson(response);
    if (!response.ok) {
      throw new ApiError(messageFromErrorBody(response.status, body));
    }
    return schema.parse(body);
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function messageFromErrorBody(status: number, body: unknown): string {
  const parsed = errorResponseSchema.safeParse(body);
  if (parsed.success) {
    return parsed.data.error.message;
  }
  return `The API responded with status ${status}.`;
}
