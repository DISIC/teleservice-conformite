import { SECTION_TITLES } from "~/domain/declaration/sections";
import { SECTION_BADGE } from "~/domain/declaration/state";
import { declarationPath, stateNotice } from "./support/declarationPage";
import { expect, test } from "./support/fixtures";

test("deposited-incomplete: notice, À compléter badge, deposit refused by the server", async ({
	page,
	seed,
	a11y,
}) => {
	const declaration = await seed.declaration("deposited-incomplete");
	await page.goto(declarationPath(declaration.id));

	await expect(stateNotice(page, "deposited-incomplete")).toBeVisible();
	await expect(
		page.getByRole("link", { name: SECTION_TITLES.contact }),
	).toContainText(SECTION_BADGE["to-complete"].label);
	// Only the way back is offered: completing or reverting, never depositing.
	await expect(
		page.getByRole("button", { name: "Annuler les modifications" }),
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Prévisualiser la déclaration" }),
	).toHaveCount(0);
	await a11y.check("details page with the deposited-incomplete notice");

	// The gate is enforced server-side: a direct deposit from the preview is refused.
	await page.goto(`${declarationPath(declaration.id)}/preview`);
	await page.getByRole("button", { name: "Déposer la déclaration" }).click();
	await expect(page.getByText("Dépôt impossible")).toBeVisible();
	await a11y.check("preview with the refused deposit alert");
	await page.getByRole("link", { name: "Retournez à la déclaration" }).click();
	await expect(stateNotice(page, "deposited-incomplete")).toBeVisible();
});
