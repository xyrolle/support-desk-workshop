import { defineConfig, devices } from "@playwright/test";

// The end-to-end run starts its own servers on these ports, with a fresh
// in-memory database, so it never touches your dev data.
const API_PORT = 8780;
const WEB_PORT = 5180;

export default defineConfig({
  testDir: "e2e",
  forbidOnly: Boolean(process.env.CI),
  reporter: "list",
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "npm run start -w @support-desk/api",
      url: `http://localhost:${API_PORT}/api/health`,
      env: { PORT: String(API_PORT), DATABASE_FILE: ":memory:" },
    },
    {
      command: `npm run dev -w @support-desk/web -- --port ${WEB_PORT} --strictPort`,
      url: `http://localhost:${WEB_PORT}`,
      env: { API_URL: `http://localhost:${API_PORT}` },
    },
  ],
});
