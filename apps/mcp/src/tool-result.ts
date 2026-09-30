import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/** A tool answer. Failures stay inside the result so the server keeps running. */
export function toolResult(action: () => Promise<string>): Promise<CallToolResult> {
  return action().then(
    (text) => ({ content: [{ type: "text", text }] }),
    (error: unknown) => ({
      content: [{ type: "text", text: messageOf(error) }],
      isError: true,
    }),
  );
}

function messageOf(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }
  return "The Support Desk API request failed.";
}
