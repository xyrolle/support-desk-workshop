import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SupportDeskClient } from "./support-desk-client.ts";
import { registerGetTicket } from "./tools/get-ticket.ts";
import { registerListSlaRisks } from "./tools/list-sla-risks.ts";
import { registerSearchTickets } from "./tools/search-tickets.ts";

/** The three read-only tools. Tests connect this server without stdio. */
export function createMcpServer(options: { apiUrl: string }): McpServer {
  const client = new SupportDeskClient(options.apiUrl);
  const server = new McpServer({ name: "support-desk", version: "0.1.0" });
  registerSearchTickets(server, client);
  registerGetTicket(server, client);
  registerListSlaRisks(server, client);
  return server;
}
