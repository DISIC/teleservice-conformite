import { expect, type Locator, type Page } from "@playwright/test";
import {
	SECTION_TITLES,
	type SectionSlug,
} from "~/domain/declaration/sections";
import {
	OBSOLESCENCE_PRESENTATION,
	obsoleteSince,
} from "~/domain/declaration/obsolescence";
import {
	type DeclarationState,
	STATE_PRESENTATION,
} from "~/domain/declaration/state";

/** DSFR draws radios on the label, which overlays the real input: click through it. */
export const checkRadio = (scope: Page | Locator, name: string | RegExp) =>
	scope.getByRole("radio", { name }).check({ force: true });

/** A save is proven only by its tRPC answer; `carrying` pins the request that held the value. */
export function waitForSave(page: Page, procedure: string, carrying?: string) {
	return page.waitForResponse(
		(response) =>
			response.url().includes(`/api/trpc/${procedure}`) &&
			response.ok() &&
			(carrying === undefined ||
				(response.request().postData() ?? "").includes(carrying)),
	);
}

export const declarationPath = (id: number, section?: SectionSlug) =>
	`/dashboard/declarations/${id}${section ? `?section=${section}` : ""}`;

/** Mes déclarations → creation modal → Manuel path; resolves with the new Declaration's id. */
export async function createManualDeclaration(
	page: Page,
	name: string,
	onModalOpen?: () => Promise<void>,
): Promise<number> {
	await page.goto("/dashboard/declarations");
	// An empty list repeats the CTA in its empty state; the heading's is always there.
	await page
		.getByRole("button", { name: "Ajouter une déclaration" })
		.first()
		.click();
	const dialog = page.getByRole("dialog", { name: "Créer une déclaration" });
	await expect(dialog).toBeVisible();
	await onModalOpen?.();
	await checkRadio(dialog, /Je n’ai pas de déclaration d’accessibilité/);
	await dialog.getByLabel("Nom du service numérique concerné").fill(name);
	await dialog.getByRole("button", { name: "Continuer" }).click();
	await page.waitForURL(/\/dashboard\/declarations\/\d+$/);
	return Number(new URL(page.url()).pathname.split("/").pop());
}

/** Opens Mes déclarations and walks its ten-row pages until the Declaration named `name` shows up. */
export async function openListRow(page: Page, name: string): Promise<Locator> {
	await page.goto("/dashboard/declarations");
	const rows = page.getByRole("row");
	await rows.nth(1).waitFor();
	for (;;) {
		const row = rows.filter({ has: page.getByText(name, { exact: true }) });
		if ((await row.count()) > 0) return row;
		const next = page.getByRole("link", { name: "Page suivante" });
		const lastPage =
			(await next.count()) === 0 ||
			(await next.getAttribute("aria-disabled")) !== null;
		if (lastPage)
			throw new Error(`No row named "${name}" in Mes déclarations.`);
		const firstRow = await rows.nth(1).textContent();
		await next.click();
		await expect(rows.nth(1)).not.toHaveText(firstRow ?? "");
	}
}

export const sectionHeading = (page: Page, slug: SectionSlug) =>
	page.getByRole("heading", { level: 2, name: SECTION_TITLES[slug] });

/** The walkthrough footer; the terminal Section swaps "Suivant" for the publish gate. */
export const footer = (page: Page) => page.locator("section > footer");

export async function goToNextSection(page: Page, expected: SectionSlug) {
	await footer(page).getByRole("link", { name: "Suivant" }).click();
	await expect(sectionHeading(page, expected)).toBeVisible();
}

/** The notice card heading for a Declaration state, straight from the domain copy. */
export const stateNotice = (page: Page, state: DeclarationState) =>
	page.getByText(STATE_PRESENTATION[state].heading);

export async function expectPreview(page: Page) {
	await page.waitForURL(/\/preview$/);
	await expect(
		page.getByRole("heading", { level: 2, name: "Prévisualiser et publier" }),
	).toBeVisible();
}

/** Publishes and asserts the confirmation screen; the caller navigates on from there. */
export async function publishFromPreview(page: Page) {
	await page.getByRole("button", { name: "Publier la déclaration" }).click();
	await expect(
		page.getByRole("heading", {
			level: 2,
			name: "Votre déclaration a été publiée sur le téléservice.",
		}),
	).toBeVisible();
}

export const obsolescenceNotice = (
	page: Page,
	value: "expiring" | "obsolete",
) => page.getByText(OBSOLESCENCE_PRESENTATION[value].heading);

/** The deadline exactly as ObsolescenceLine prints it. */
export const deadlineOf = (declaration: { published_at?: string | null }) =>
	obsoleteSince(new Date(declaration.published_at ?? "")).toLocaleDateString(
		"fr-FR",
		{ timeZone: "UTC" },
	);
