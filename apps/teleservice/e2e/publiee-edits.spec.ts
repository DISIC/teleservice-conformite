import { CONTACT } from "./support/seed";
import {
	declarationPath,
	publishFromPreview,
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

test("Publiée: an edit makes it Modifiée, revert restores it, republish clears it", async ({
	page,
	seed,
}) => {
	const declaration = await seed.declaration("publiee");
	await page.goto(declarationPath(declaration.id, "contact"));

	// A clean Publiée row shows no notice and edits Section by Section.
	await expect(stateNotice(page, "published-modified")).toHaveCount(0);
	await editContactEmail(page, NEW_EMAIL);
	await expect(stateNotice(page, "published-modified")).toBeVisible();

	// Revert restores the published version; the page reloads with the old value.
	await page.getByRole("button", { name: "Annuler les modifications" }).click();
	const dialog = page.getByRole("dialog", {
		name: "Annuler les modifications",
	});
	await Promise.all([
		waitForSave(page, "declaration.revertToPublished"),
		dialog.getByRole("button", { name: "Annuler les modifications" }).click(),
	]);
	await expect(page.getByText(CONTACT.email)).toBeVisible();
	await expect(stateNotice(page, "published-modified")).toHaveCount(0);

	// Republishing a Modifiée row publishes the new content and clears the notice.
	await editContactEmail(page, NEW_EMAIL);
	await expect(stateNotice(page, "published-modified")).toBeVisible();
	await page.getByRole("button", { name: "Prévisualiser et publier" }).click();
	await publishFromPreview(page);
	await expect(stateNotice(page, "published-modified")).toHaveCount(0);

	await page.goto(`/declarations/${declaration.id}/publish`);
	await expect(page.getByText(NEW_EMAIL)).toBeVisible();
});
