import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";

/** Cursor files a tool under Writes unless these hints say it only reads. */
export const readOnlyToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const satisfies ToolAnnotations;
