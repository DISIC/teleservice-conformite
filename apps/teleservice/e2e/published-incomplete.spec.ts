import { SECTION_BADGE } from "~/domain/declaration/state";
import { declarationPath, stateNotice } from "./support/declarationPage";
import { expect, test } from "./support/fixtures";

test("published-incomplete: notice, À compléter badge, publish refused by the server", async ({
	page,
	seed,
	a11y,
}) => {
	const declaration = await seed.declaration("published-incomplete");
	await page.goto(declarationPath(declaration.id));

	await expect(stateNotice(page, "published-incomplete")).toBeVisible();
	await expect(page.getByRole("link", { name: /^Contact/ })).toContainText(
		SECTION_BADGE["to-complete"].label,
	);
	// Only the way back is offered: completing or reverting, never publishing.
	await expect(
		page.getByRole("button", { name: "Annuler les modifications" }),
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Prévisualiser et publier" }),
	).toHaveCount(0);
	await a11y.check("details page with the published-incomplete notice");

	// The gate is enforced server-side: a direct publish from the preview is refused.
	await page.goto(`${declarationPath(declaration.id)}/preview`);
	await page.getByRole("button", { name: "Publier la déclaration" }).click();
	await expect(page.getByText("Publication impossible")).toBeVisible();
	await a11y.check("preview with the refused publication alert");
	await page.getByRole("link", { name: "Retournez à la déclaration" }).click();
	await expect(stateNotice(page, "published-incomplete")).toBeVisible();
});
