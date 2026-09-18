import { test as setup } from "@playwright/test";
import { STORAGE_STATE } from "./support/identity";
import { signInWithProConnect } from "./support/proconnect";

setup(
	"signs in through the ProConnect integration environment",
	async ({ page }) => {
		await signInWithProConnect(page);
		await page.context().storageState({ path: STORAGE_STATE });
	},
);
