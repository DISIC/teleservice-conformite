import { expect, test } from "./support/fixtures";

test("a seeded Brouillon shows in Mes déclarations", async ({ page, seed }) => {
	const declaration = await seed.declaration("brouillon-ready");
	await page.goto("/dashboard/declarations");
	const row = page.getByRole("row").filter({ hasText: declaration.name });
	await expect(row).toContainText("Brouillon");
});
