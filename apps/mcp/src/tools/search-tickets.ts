import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type TicketListItem, ticketStatusSchema } from "@support-desk/shared";
import { z } from "zod";
import type { SupportDeskClient } from "../support-desk-client.ts";
import { toolResult } from "../tool-result.ts";

const searchTicketsInput = z.object({
  projectId: z.string().min(1),
  query: z.string().trim().min(1).max(100),
  status: ticketStatusSchema.optional(),
});

type SearchTicketsInput = z.infer<typeof searchTicketsInput>;

export function registerSearchTickets(server: McpServer, client: SupportDeskClient) {
  server.registerTool(
    "search_tickets",
    {
      description: "Search one project's tickets and return the first page.",
      inputSchema: searchTicketsInput,
    },
    (input: SearchTicketsInput) => toolResult(() => searchTickets(client, input)),
  );
}

async function searchTickets(
  client: SupportDeskClient,
  input: SearchTicketsInput,
): Promise<string> {
  const page = await client.searchTickets(input.projectId, input.query, input.status);
  return JSON.stringify(page.items.map(searchHit));
}

function searchHit(ticket: TicketListItem) {
  return {
    id: ticket.id,
    title: ticket.title,
    status: ticket.status,
    priority: ticket.priority,
    assignee: ticket.assignee,
    snippet: ticket.snippet ?? [],
  };
}
