import Application from "@codegouvfr/react-dsfr/picto/Application";
import Compass from "@codegouvfr/react-dsfr/picto/Compass";
import Search from "@codegouvfr/react-dsfr/picto/Search";
import type { appKindOptions } from "~/payload/selectOptions";

// Kept out of selectOptions.ts: react-dsfr picto imports break the Payload CLI (plain-Node ESM resolution).
export const appKindPictograms: Record<
	(typeof appKindOptions)[number]["value"],
	typeof Search
> = {
	website: Search,
	mobile_app: Application,
	other: Compass,
};
