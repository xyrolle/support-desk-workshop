import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readConfig } from "./config.ts";
import { createMcpServer } from "./mcp-server.ts";

const server = createMcpServer(readConfig());
await server.connect(new StdioServerTransport());
