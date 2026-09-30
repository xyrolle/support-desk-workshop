import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listedSlaClock, type SlaClock, type TicketListItem } from "@support-desk/shared";
import { z } from "zod";
import type { SupportDeskClient } from "../support-desk-client.ts";
import { toolResult } from "../tool-result.ts";

const listSlaRisksInput = z.object({
  projectId: z.string().min(1).optional(),
});

type ListSlaRisksInput = z.infer<typeof listSlaRisksInput>;

export function registerListSlaRisks(server: McpServer, client: SupportDeskClient) {
  server.registerTool(
    "list_sla_risks",
    {
      description: "List unresolved tickets that are breached or due within two business hours.",
      inputSchema: listSlaRisksInput,
    },
    (input: ListSlaRisksInput) => toolResult(() => listSlaRisks(client, input.projectId)),
  );
}

async function listSlaRisks(
  client: SupportDeskClient,
  projectId: string | undefined,
): Promise<string> {
  const tickets: TicketListItem[] = [];
  for (const id of await projectIds(client, projectId)) {
    tickets.push(...(await allAtRisk(client, id)));
  }
  tickets.sort(byUrgency);
  return JSON.stringify(tickets.map(riskView));
}

async function projectIds(
  client: SupportDeskClient,
  projectId: string | undefined,
): Promise<string[]> {
  if (projectId) {
    return [projectId];
  }
  const projects = await client.listProjects();
  return projects.map((project) => project.id);
}

/** Every at-risk page. The API pages at 25, and a project can have more. */
async function allAtRisk(client: SupportDeskClient, projectId: string): Promise<TicketListItem[]> {
  const first = await client.listAtRiskTickets(projectId, 1);
  const items = [...first.items];
  for (let page = 2; page <= first.totalPages; page += 1) {
    const next = await client.listAtRiskTickets(projectId, page);
    items.push(...next.items);
  }
  return items;
}

/** Fewest minutes left first, so a breach comes before a ticket that is only due soon. */
function byUrgency(left: TicketListItem, right: TicketListItem): number {
  const byMinutes = minutesLeft(left) - minutesLeft(right);
  if (byMinutes !== 0) {
    return byMinutes;
  }
  return left.id.localeCompare(right.id);
}

function minutesLeft(ticket: TicketListItem): number {
  const clock = listedSlaClock(ticket);
  if (!clock) {
    return Number.POSITIVE_INFINITY;
  }
  return clock.targetMinutes - clock.elapsedMinutes;
}

function riskView(ticket: TicketListItem) {
  const clock = listedSlaClock(ticket);
  return {
    id: ticket.id,
    title: ticket.title,
    status: ticket.status,
    priority: ticket.priority,
    assignee: ticket.assignee,
    projectId: ticket.projectId,
    ...(clock ? { sla: clockView(clock) } : {}),
  };
}

function clockView(clock: SlaClock) {
  return {
    state: clock.state,
    targetMinutes: clock.targetMinutes,
    elapsedMinutes: clock.elapsedMinutes,
  };
}
