import { test as base } from "@playwright/test";
import type { Payload } from "payload";
import {
	connectPayload,
	seedDeclaration,
	type SeededDeclaration,
	type SeedState,
} from "./seed";

type Fixtures = {
	seed: {
		declaration: (
			state: SeedState,
			label?: string,
		) => Promise<SeededDeclaration>;
	};
};

type WorkerFixtures = { payload: Payload };

export const test = base.extend<Fixtures, WorkerFixtures>({
	payload: [
		// Playwright requires the destructuring pattern even when a fixture depends on nothing.
		// oxlint-disable-next-line no-empty-pattern
		async ({}, use) => {
			const payload = await connectPayload();
			await use(payload);
			await payload.destroy();
		},
		{ scope: "worker" },
	],
	seed: async ({ payload }, use, testInfo) => {
		// Names carry the project and the retry so parallel runs of one test never share a row.
		const uniqueName = (label: string) =>
			`${label} · ${testInfo.project.name}${testInfo.retry ? ` r${testInfo.retry}` : ""} · ${testInfo.testId.slice(-6)}`;
		await use({
			declaration: (state, label = "Déclaration e2e") =>
				seedDeclaration(payload, state, uniqueName(label)),
		});
	},
});

export { expect } from "@playwright/test";
