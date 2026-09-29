import { type ChildProcess, spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

type CheckResult = { ok: boolean; detail: string };

type Check = {
  name: string;
  run: () => CheckResult | Promise<CheckResult>;
};

const REQUIRED_NODE_MAJOR = 24;
const HEALTH_CHECK_PORT = 8789;
const HEALTH_CHECK_TIMEOUT_MS = 10_000;
const REQUIRED_PACKAGES = [
  "hono",
  "drizzle-orm",
  "better-sqlite3",
  "react",
  "vite",
  "@playwright/test",
];

const repoRoot = path.join(import.meta.dirname, "..");

const checks: Check[] = [
  { name: "Node version", run: checkNodeVersion },
  { name: "Install", run: checkInstall },
  { name: "Database seed", run: checkDatabaseSeed },
  { name: "API health", run: checkApiHealth },
  { name: "Playwright browser", run: checkPlaywrightBrowser },
];

function pass(detail: string): CheckResult {
  return { ok: true, detail };
}

function fail(detail: string): CheckResult {
  return { ok: false, detail };
}

function checkNodeVersion(): CheckResult {
  const version = process.versions.node;
  const major = Number(version.split(".")[0]);
  if (major < REQUIRED_NODE_MAJOR) {
    return fail(`v${version}, but Node ${REQUIRED_NODE_MAJOR} is required (run "nvm use").`);
  }
  return pass(`v${version}`);
}

async function checkInstall(): Promise<CheckResult> {
  const missing = REQUIRED_PACKAGES.filter(
    (name) => !existsSync(path.join(repoRoot, "node_modules", name, "package.json")),
  );
  if (missing.length > 0) {
    return fail(`missing ${missing.join(", ")}. Run "npm ci".`);
  }

  const { default: Database } = await import("better-sqlite3");
  new Database(":memory:").close();
  return pass("all packages present, prebuilt SQLite driver loads");
}

function checkDatabaseSeed(): CheckResult {
  const result = spawnSync("npm run --silent db:seed", {
    cwd: repoRoot,
    shell: true,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    return fail(`"npm run db:seed" failed:\n${result.stderr}`);
  }
  return pass(result.stdout.trim());
}

async function checkApiHealth(): Promise<CheckResult> {
  const url = `http://localhost:${HEALTH_CHECK_PORT}/api/health`;
  const server = startApi(HEALTH_CHECK_PORT);

  try {
    const healthy = await waitUntilHealthy(url);
    if (!healthy) {
      return fail(`${url} did not answer within ${HEALTH_CHECK_TIMEOUT_MS / 1000}s.`);
    }
    return pass(`${url} answered ok`);
  } finally {
    server.kill();
  }
}

function startApi(port: number): ChildProcess {
  return spawn(process.execPath, ["apps/api/src/server.ts"], {
    cwd: repoRoot,
    env: { ...process.env, PORT: String(port) },
    stdio: "ignore",
  });
}

async function waitUntilHealthy(url: string): Promise<boolean> {
  const deadline = Date.now() + HEALTH_CHECK_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (await isHealthy(url)) {
      return true;
    }
    await delay(250);
  }
  return false;
}

async function isHealthy(url: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

async function checkPlaywrightBrowser(): Promise<CheckResult> {
  const { chromium } = await import("@playwright/test");
  if (!existsSync(chromium.executablePath())) {
    return fail('Chromium is not installed. Run "npx playwright install chromium".');
  }
  return pass("Chromium is installed");
}

async function runCheck(check: Check): Promise<CheckResult> {
  try {
    return await check.run();
  } catch (error) {
    return fail(error instanceof Error ? error.message : String(error));
  }
}

let failures = 0;
for (const check of checks) {
  const result = await runCheck(check);
  const label = result.ok ? "PASS" : "FAIL";
  console.log(`${label}  ${check.name.padEnd(20)} ${result.detail}`);
  if (!result.ok) {
    failures += 1;
  }
}

if (failures > 0) {
  console.log(`\n${failures} check(s) failed. Fix them before the session starts.`);
  process.exitCode = 1;
} else {
  console.log("\nAll checks passed. Start the app with: npm run dev");
}
