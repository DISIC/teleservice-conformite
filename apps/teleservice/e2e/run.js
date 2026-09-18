import { spawn } from "node:child_process";
import { rmSync } from "node:fs";
import { PostgreSqlContainer } from "@testcontainers/postgresql";

// A new database knows no session: a saved one would only log the tests out.
rmSync(new URL("./.auth/user.json", import.meta.url), { force: true });

// The app's .env supplies the secrets locally; CI sets them in the job. Existing variables win.
try {
	process.loadEnvFile(".env");
} catch (error) {
	if (!(error instanceof Error && "code" in error && error.code === "ENOENT"))
		throw error;
}

// One throwaway Postgres per run, migrated with the app's own CLI, gone when Playwright exits.
const container = await new PostgreSqlContainer("postgres:16-alpine").start();
const env = {
	...process.env,
	E2E_DATABASE_URL: container.getConnectionUri(),
	POSTGRESQL_ADDON_URI: container.getConnectionUri(),
};

/** @param {string} command @param {string[]} args @param {Record<string, string>} [extra] */
const run = (command, args, extra = {}) =>
	new Promise((resolve) => {
		spawn(command, args, { stdio: "inherit", env: { ...env, ...extra } }).on(
			"exit",
			(code) => resolve(code ?? 1),
		);
	});

// Production mode keeps the seeder's Payload from pushing schema or regenerating types.
const playwright = (/** @type {string[]} */ args) =>
	run("playwright", ["test", ...args], { NODE_ENV: "production" });

try {
	const args = process.argv.slice(2);
	let code = await run("payload", ["migrate"]);
	// UI mode never runs dependency projects: sign in through the setup project before opening it.
	if (code === 0 && args.includes("--ui"))
		code = await playwright(["--project=setup"]);
	if (code === 0) code = await playwright(args);
	process.exitCode = code;
} finally {
	await container.stop();
}
