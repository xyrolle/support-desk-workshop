import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "mcp",
    environment: "node",
    restoreMocks: true,
    unstubGlobals: true,
  },
});
