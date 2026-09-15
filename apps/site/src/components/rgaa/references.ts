import { fr } from "@codegouvfr/react-dsfr";
import type { PictogramId } from "./Pictogram";

export const REFERENCE_IDS = ["web", "mobile", "bureautique"] as const;

export type ReferenceId = (typeof REFERENCE_IDS)[number];

export type Reference = {
	id: ReferenceId;
	title: string;
	pageTitle: string;
	description: string;
	iconId: string;
	pictogram: PictogramId;
	href: string;
	background: string;
	circleBackground: string;
	badgeColor: string;
	badgeBackgroundColor: string;
};

export const REFERENCES: Reference[] = [
	{
		id: "web",
		title: "Référentiel web",
		pageTitle: "Référentiel Web",
		description:
			"Domaine d’application du référentiel Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
		iconId: "ri-search-line",
		pictogram: "search",
		href: "/rgaa/web",
		background: fr.colors.decisions.background.alt.pinkMacaron.default,
		circleBackground: fr.colors.decisions.background.alt.pinkMacaron.active,
		badgeColor: fr.colors.decisions.text.label.purpleGlycine.default,
		badgeBackgroundColor:
			fr.colors.decisions.background.contrast.pinkMacaron.default,
	},
	{
		id: "mobile",
		title: "Référentiel application mobile",
		pageTitle: "Référentiel application mobile",
		description:
			"Domaine d’application du référentiel Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
		iconId: "ri-smartphone-line",
		pictogram: "application",
		href: "/rgaa/mobile",
		background: fr.colors.decisions.background.alt.yellowTournesol.default,
		circleBackground: fr.colors.decisions.background.alt.yellowTournesol.active,
		badgeColor: fr.colors.decisions.text.label.yellowTournesol.default,
		badgeBackgroundColor:
			fr.colors.decisions.background.actionLow.yellowTournesol.default,
	},
	{
		id: "bureautique",
		title: "Référentiel bureautique",
		pageTitle: "Référentiel bureautique",
		description:
			"Domaine d’application du référentiel Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
		iconId: "ri-file-text-line",
		pictogram: "document-search",
		href: "/rgaa/bureautique",
		background: fr.colors.decisions.background.alt.greenEmeraude.default,
		circleBackground: fr.colors.decisions.background.alt.greenEmeraude.active,
		badgeColor: fr.colors.decisions.text.label.greenEmeraude.default,
		badgeBackgroundColor:
			fr.colors.decisions.background.contrast.greenEmeraude.default,
	},
];

export const getReference = (id: ReferenceId): Reference =>
	REFERENCES.find((reference) => reference.id === id)!;
