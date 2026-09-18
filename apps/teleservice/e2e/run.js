import { spawn } from "node:child_process";
import { PostgreSqlContainer } from "@testcontainers/postgresql";

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

try {
	const migrated = await run("payload", ["migrate"]);
	// Production mode keeps the seeder's Payload from pushing schema or regenerating types.
	process.exitCode =
		migrated === 0
			? await run("playwright", ["test", ...process.argv.slice(2)], {
					NODE_ENV: "production",
				})
			: migrated;
} finally {
	await container.stop();
}
