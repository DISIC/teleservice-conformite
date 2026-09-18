import { expect, test as setup } from "@playwright/test";
import { E2E_IDENTITY, STORAGE_STATE } from "./support/identity";

setup(
	"signs in through the ProConnect integration environment",
	async ({ page }) => {
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
		await page.context().storageState({ path: STORAGE_STATE });
	},
);
