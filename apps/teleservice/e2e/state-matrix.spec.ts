import {
	type DeclarationState,
	STATE_PRESENTATION,
} from "~/domain/declaration/state";
import { declarationPath, stateNotice } from "./support/declarationPage";
import { expect, test } from "./support/fixtures";
import type { SeedState } from "./support/seed";

/** Every seeded state and the notice it must show; `null` is the clean Publiée row. */
const MATRIX: [SeedState, DeclarationState | null][] = [
	["brouillon-incomplete", "incomplete"],
	["to-verify", "to-verify"],
	["brouillon-ready", "ready"],
	["publiee", null],
	["modifiee", "published-modified"],
	["published-incomplete", "published-incomplete"],
];

const STATES = Object.keys(STATE_PRESENTATION) as DeclarationState[];

test("Declaration state matrix: each state shows its notice, badge and actions", async ({
	page,
	seed,
	a11y,
}) => {
	const rows = await Promise.all(
		MATRIX.map(([seedState]) => seed.declaration(seedState, seedState)),
	);

	for (const [index, [seedState, state]] of MATRIX.entries()) {
		await page.goto(declarationPath(rows[index]!.id));
		await expect(
			page.getByRole("heading", { level: 1, name: rows[index]!.name }),
		).toBeVisible();

		if (state === null) {
			for (const other of STATES)
				await expect(stateNotice(page, other), seedState).toHaveCount(0);
			continue;
		}

		const { actions, badge } = STATE_PRESENTATION[state];
		await expect(stateNotice(page, state), seedState).toBeVisible();
		if (badge)
			await expect(
				page.getByText(badge.label, { exact: true }).first(),
				seedState,
			).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Annuler les modifications" }),
			seedState,
		).toHaveCount(actions.includes("revert") ? 1 : 0);
		await expect(
			page.getByRole("button", { name: "Prévisualiser et publier" }),
			seedState,
		).toHaveCount(actions.includes("publish") ? 1 : 0);
		await a11y.check(`details page in state ${state}`);
	}
});
