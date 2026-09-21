import { STATE_PRESENTATION } from "~/domain/declaration/state";
import {
	checkRadio,
	createManualDeclaration,
	expectPreview,
	footer,
	goToNextSection,
	publishFromPreview,
	openListRow,
	sectionHeading,
	stateNotice,
	waitForSave,
} from "./support/declarationPage";
import { expect, test } from "./support/fixtures";

test("Brouillon to Publiée through the sequential walkthrough", async ({
	page,
	uniqueName,
	a11y,
}) => {
	const name = uniqueName("Service e2e");
	const id = await createManualDeclaration(page, name, () =>
		a11y.check("creation modal"),
	);

	// Sequential mode: every Section is editable in place, nothing to toggle.
	await expect(sectionHeading(page, "infos")).toBeVisible();
	await expect(page.getByRole("button", { name: "Modifier" })).toHaveCount(0);
	// A first pass flags nothing: the guidance waits for the declarant to come back.
	await expect(stateNotice(page, "incomplete")).toHaveCount(0);
	await a11y.check("details page in sequential mode");

	await page.reload();
	await expect(stateNotice(page, "incomplete")).toBeVisible();

	// The sector lives on the entity shared by every UI-created row: always set it.
	await checkRadio(page, /^Site web/);
	await page
		.getByLabel("URL de la page d’accueil du site audité")
		.fill("https://www.example.fr");
	await page
		.getByLabel("Secteur d’activité du service concerné")
		.selectOption({ label: "Protection sociale" });
	await waitForSave(page, "declaration.update", "Protection sociale");

	await goToNextSection(page, "audit-general");
	await page
		.getByRole("radio", { name: "Non", exact: true })
		.check({ force: true });
	await waitForSave(page, "audit.update", '"isRealised":false');

	// The three realised-only Sub-sections show a notice and just advance.
	await goToNextSection(page, "audit-outils");
	await goToNextSection(page, "audit-contenus");
	await goToNextSection(page, "audit-non-conformites");

	await goToNextSection(page, "schema");
	await checkRadio(page, /^Renseigner un schéma pluriannuel plus tard/);
	await waitForSave(page, "schema.skip");

	// Contact without a channel: the one thing left for the gate to catch.
	await goToNextSection(page, "contact");
	await page.getByLabel("Nom du contact").fill("Référent accessibilité");
	await waitForSave(page, "contact.upsert", "Référent accessibilité");

	// The terminal gate validates the whole Declaration and lists what blocks.
	await footer(page)
		.getByRole("button", { name: "Prévisualiser et publier" })
		.click();
	// The "email or URL" rule flags both paths, so the summary counts two fields.
	const summary = page.getByRole("heading", {
		level: 3,
		name: /champs? (doit|doivent) être complétés? avant la publication/,
	});
	await expect(summary).toBeVisible();
	await a11y.check("error summary after a blocked gate");
	await page
		.getByRole("button", { name: /Renseignez au moins un email/ })
		.first()
		.click();
	await page.getByLabel("Email de contact").fill("a11y@example.fr");
	await waitForSave(page, "contact.upsert", "a11y@example.fr");

	// The summary is live: it disappears as soon as the row passes the gate.
	await expect(summary).toHaveCount(0);
	await expect(stateNotice(page, "ready")).toBeVisible();

	await footer(page)
		.getByRole("button", { name: "Prévisualiser et publier" })
		.click();
	await expectPreview(page);
	await a11y.check("preview page");
	await publishFromPreview(page);
	await a11y.check("details page after publishing");

	// Publiée: standalone mode, no notice, public page live, list badge swapped.
	await expect(page.getByText("Publiée", { exact: true })).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Modifier" }).first(),
	).toBeVisible();
	await expect(stateNotice(page, "ready")).toHaveCount(0);

	await page.goto(`/declarations/${id}/publish`);
	await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
	await a11y.check("public page of a Publiée declaration");

	const row = await openListRow(page, name);
	await expect(row).toContainText("Publiée");
	await expect(row).not.toContainText(
		STATE_PRESENTATION.incomplete.badge!.label,
	);
});
