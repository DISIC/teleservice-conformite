import { test as base } from "@playwright/test";
import type { Payload } from "payload";
import { expectAccessible } from "./a11y";
import {
	connectPayload,
	seedDeclaration,
	type SeededDeclaration,
	type SeedState,
} from "./seed";

type Fixtures = {
	/** Names carry the project and the retry so parallel runs of one test never share a row. */
	uniqueName: (label: string) => string;
	seed: {
		declaration: (
			state: SeedState,
			label?: string,
		) => Promise<SeededDeclaration>;
	};
	/** Axe checkpoint on the current page state; Chromium only, other engines give the same answer. */
	a11y: { check: (checkpoint: string) => Promise<void> };
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
	// oxlint-disable-next-line no-empty-pattern
	uniqueName: async ({}, use, testInfo) => {
		const retry = testInfo.retry ? ` r${testInfo.retry}` : "";
		await use(
			(label) =>
				`${label} · ${testInfo.project.name}${retry} · ${testInfo.testId.slice(-6)}`,
		);
	},
	a11y: async ({ page, browserName }, use, testInfo) => {
		await use({
			check: (checkpoint) =>
				browserName === "chromium"
					? expectAccessible(page, testInfo, checkpoint)
					: Promise.resolve(),
		});
	},
	seed: async ({ payload, uniqueName }, use) => {
		await use({
			declaration: (state, label = "Déclaration e2e") =>
				seedDeclaration(payload, state, uniqueName(label)),
		});
	},
});

export { expect } from "@playwright/test";
