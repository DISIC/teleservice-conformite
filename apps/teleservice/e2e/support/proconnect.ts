import { expect, type Page } from "@playwright/test";
import { E2E_IDENTITY } from "./identity";

/** The ProConnect integration login as a declarant does it: home CTA, email, one click on the test identity provider. */
export async function signInWithProConnect(page: Page) {
	await page.goto("/");
	await page.getByRole("button", { name: "Commencer" }).first().click();
	await page
		.getByRole("textbox", { name: "Email professionnel" })
		.fill(E2E_IDENTITY.email);
	await page.getByRole("button", { name: "Continuer" }).click();
	// The test identity provider needs no password: the identity is prefilled.
	await page.getByRole("button", { name: "Se connecter" }).click();
	await expect(
		page.getByRole("heading", { level: 1, name: /Mes déclarations/ }),
	).toBeVisible({ timeout: 30_000 });
}
