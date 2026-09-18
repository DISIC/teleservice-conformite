import { register } from "node:module";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import { STORAGE_STATE } from "./e2e/support/identity";

// Every Playwright process loads this file before any test, so the hook covers the seeder's imports.
register(new URL("./e2e/support/extensionless-hooks.js", import.meta.url));

const CI = Boolean(process.env.CI);
const PROD = CI || Boolean(process.env.E2E_PROD);
const PORT = Number(process.env.E2E_PORT ?? 3000);
const baseURL = `http://localhost:${PORT}`;

// The database is the throwaway container started by e2e/run.js, never a developer's.
if (!process.env.E2E_DATABASE_URL)
	throw new Error(
		"E2E_DATABASE_URL is missing: run the suite through `pnpm e2e`.",
	);

const browser = (name: string, device: keyof typeof devices) => ({
	name,
	use: { ...devices[device], storageState: STORAGE_STATE },
	dependencies: ["setup"],
});

export default defineConfig({
	testDir: path.join(import.meta.dirname, "e2e"),
	// Walkthroughs chain several autosave debounces and, locally, on-demand page compiles.
	timeout: 60_000,
	fullyParallel: true,
	forbidOnly: CI,
	retries: CI ? 1 : 0,
	workers: CI ? 2 : undefined,
	reporter: [["list"], ["html", { open: CI ? "never" : "on-failure" }]],
	use: { baseURL, trace: "on-first-retry" },
	// Browsers first: UI mode opens on the first project and skips dependency projects (run.js signs in for it).
	projects: [
		browser("chromium", "Desktop Chrome"),
		browser("firefox", "Desktop Firefox"),
		browser("webkit", "Desktop Safari"),
		{
			name: "setup",
			testMatch: /auth\.setup\.ts/,
			timeout: 90_000,
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: {
		command: PROD ? `next start -p ${PORT}` : `next dev -p ${PORT}`,
		url: baseURL,
		reuseExistingServer: false,
		timeout: 180_000,
		env: {
			POSTGRESQL_ADDON_URI: process.env.E2E_DATABASE_URL,
			NEXT_PUBLIC_BETTER_AUTH_URL: baseURL,
			NODE_ENV: PROD ? "production" : "development",
			// The production build is served from its own `.next`; only the dev server needs a separate one.
			...(PROD ? {} : { NEXT_DIST_DIR: ".next-e2e" }),
		},
	},
});
