import { fr } from "@codegouvfr/react-dsfr";
import Application from "@codegouvfr/react-dsfr/picto/Application";
import DocumentSearch from "@codegouvfr/react-dsfr/picto/DocumentSearch";
import Search from "@codegouvfr/react-dsfr/picto/Search";
import type { PictoProps } from "@codegouvfr/react-dsfr/picto/utils/PictoWrapper";
import type { ComponentType } from "react";
import { ROOTPATH } from "~/pages/beta/rgaa5";

export type Reference = {
	id: string;
	title: string;
	description: string;
	iconId: string;
	Picto: ComponentType<PictoProps>;
	background: string;
	circleBackground: string;
	href: string;
};

export const REFERENCES: Reference[] = [
	{
		id: "web",
		title: "Référentiel web",
		description:
			"Domaine d’application du référentiel Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
		iconId: "ri-search-line",
		Picto: Search,
		background: fr.colors.decisions.background.alt.pinkMacaron.default,
		circleBackground: fr.colors.decisions.background.alt.pinkMacaron.active,
		href: `${ROOTPATH}rgaa/web`,
	},
	{
		id: "mobile",
		title: "Référentiel application mobile",
		description:
			"Domaine d’application du référentiel Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
		iconId: "ri-smartphone-line",
		Picto: Application,
		background: fr.colors.decisions.background.alt.yellowTournesol.default,
		circleBackground: fr.colors.decisions.background.alt.yellowTournesol.active,
		href: `${ROOTPATH}rgaa/mobile`,
	},
	{
		id: "bureautique",
		title: "Référentiel bureautique",
		description:
			"Domaine d’application du référentiel Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
		iconId: "ri-file-text-line",
		Picto: DocumentSearch,
		background: fr.colors.decisions.background.alt.greenEmeraude.default,
		circleBackground: fr.colors.decisions.background.alt.greenEmeraude.active,
		href: `${ROOTPATH}rgaa/desktop`,
	},
];
