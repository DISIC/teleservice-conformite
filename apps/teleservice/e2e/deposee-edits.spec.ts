import { CONTACT } from "./support/seed";
import {
	declarationPath,
	depositFromPreview,
	stateNotice,
	waitForSave,
} from "./support/declarationPage";
import { expect, test } from "./support/fixtures";

const NEW_EMAIL = "autre-referent@example.fr";

async function editContactEmail(
	page: import("@playwright/test").Page,
	email: string,
) {
	await page.getByRole("button", { name: "Modifier" }).click();
	await page.getByLabel("Email de contact").fill(email);
	await Promise.all([
		waitForSave(page, "contact.upsert", email),
		page.getByRole("button", { name: "Enregistrer" }).click(),
	]);
}

test("Déposée: an edit makes it Modifiée, revert restores it, redeposit clears it", async ({
	page,
	seed,
	a11y,
}) => {
	const declaration = await seed.declaration("deposee");
	await page.goto(declarationPath(declaration.id, "contact"));

	// A clean Déposée row shows no notice and edits Section by Section.
	await expect(stateNotice(page, "deposited-modified")).toHaveCount(0);
	await editContactEmail(page, NEW_EMAIL);
	await expect(stateNotice(page, "deposited-modified")).toBeVisible();
	await a11y.check("standalone details page with the Modifiée notice");

	// Revert restores the deposited version; the page reloads with the old value.
	await page.getByRole("button", { name: "Annuler les modifications" }).click();
	const dialog = page.getByRole("dialog", {
		name: "Annuler les modifications",
	});
	await expect(dialog).toBeVisible();
	await a11y.check("revert confirmation dialog");
	await Promise.all([
		waitForSave(page, "declaration.revertToDeposited"),
		dialog.getByRole("button", { name: "Annuler les modifications" }).click(),
	]);
	await expect(page.getByText(CONTACT.email)).toBeVisible();
	await expect(stateNotice(page, "deposited-modified")).toHaveCount(0);

	// Redepositing a Modifiée row deposits the new content and clears the notice.
	await editContactEmail(page, NEW_EMAIL);
	await expect(stateNotice(page, "deposited-modified")).toBeVisible();
	await page
		.getByRole("button", { name: "Prévisualiser la déclaration" })
		.click();
	await depositFromPreview(page);

	await page.goto(`/dashboard/declarations/${declaration.id}`);
	await expect(stateNotice(page, "deposited-modified")).toHaveCount(0);

	await page.goto(`/declarations/${declaration.id}/publish`);
	await expect(page.getByText(NEW_EMAIL)).toBeVisible();
});
