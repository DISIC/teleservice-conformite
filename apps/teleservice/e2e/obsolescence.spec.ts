import {
	deadlineOf,
	declarationPath,
	obsolescenceNotice,
	rowOf,
} from "./support/declarationPage";
import { expect, test } from "./support/fixtures";

test("Obsolescence: list, header, interstitial, notice and public page", async ({
	page,
	seed,
	a11y,
}) => {
	const [expiring, obsolete] = await Promise.all([
		seed.declaration("bientot-obsolete", "Bientôt obsolète"),
		seed.declaration("obsolete", "Obsolète"),
	]);

	// Bientôt obsolète keeps Publiée and adds the deadline; Obsolète replaces the badge.
	await page.goto("/dashboard/declarations");
	const expiringRow = rowOf(page, expiring.name);
	await expect(expiringRow).toContainText("Publiée");
	await expect(expiringRow).toContainText(
		`Obsolète le ${deadlineOf(expiring)}`,
	);
	const obsoleteRow = rowOf(page, obsolete.name);
	await expect(obsoleteRow).toContainText(`Depuis le ${deadlineOf(obsolete)}`);
	await expect(obsoleteRow).not.toContainText("Publiée");
	await a11y.check("list with obsolescence rows");

	// An unchanged Obsolète row opens on the interstitial; updating reveals the editor.
	await page.goto(declarationPath(obsolete.id));
	await expect(
		page.getByRole("heading", { level: 2, name: /est obsolète\.$/ }),
	).toBeVisible();
	await a11y.check("obsolescence interstitial");
	await page
		.getByRole("button", { name: "Mettre à jour ma déclaration" })
		.click();
	await expect(obsolescenceNotice(page, "obsolete")).toBeVisible();
	await expect(
		page.getByText(`Obsolète depuis le ${deadlineOf(obsolete)}`),
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Prévisualiser et publier" }),
	).toBeVisible();
	await a11y.check("details page with the obsolete notice");

	await page.goto(declarationPath(expiring.id));
	await page
		.getByRole("button", { name: "Mettre à jour ma déclaration" })
		.click();
	await expect(obsolescenceNotice(page, "expiring")).toBeVisible();
	await expect(
		page.getByText(`Obsolète le ${deadlineOf(expiring)}`),
	).toBeVisible();

	// Citizens see the obsolete notice and a Non conforme badge; the content itself is untouched.
	await page.goto(`/declarations/${obsolete.id}/publish`);
	await expect(page.getByText("Cette déclaration est obsolète.")).toBeVisible();
	await expect(
		page.getByText("Non conforme", { exact: true }).first(),
	).toBeVisible();
	await a11y.check("public page of an Obsolète declaration");
});
