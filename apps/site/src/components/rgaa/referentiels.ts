import { fr } from "@codegouvfr/react-dsfr";
import type { PictogramId } from "./Pictogram";

export const REFERENTIELS_IDS = ["web", "mobile", "bureautique"] as const;

export type ReferentielId = (typeof REFERENTIELS_IDS)[number];

export type ReferentielStyle = {
	id: ReferentielId;
	iconId: string;
	pictogram: PictogramId;
	href: string;
	heroPagebackgroundColor: string;
	circleBackgroundColor: string;
	badgeColor: string;
	badgeBackgroundColor: string;
	topicAccordionBackgroundColor: string;
	testAccordionBackgroundColor: string;
};

// The shape both the hero buttons and the méthode cards are built from; each picks its own subset.
// The published identity of a référentiel, read from rgaa/data/ and passed down as props.
export type ReferentielInfos = {
	id: ReferentielId;
	title: string;
	description: string;
};

export type ReferentielCard = {
	id: ReferentielId;
	title: string;
	description: string;
	iconId: string;
	pictogram: PictogramId;
	href: string;
	heroPagebackgroundColor: string;
	circleBackgroundColor: string;
};

export const REFERENTIEL_STYLES: ReferentielStyle[] = [
	{
		id: "web",
		iconId: "ri-search-line",
		pictogram: "search",
		href: "/rgaa/web",
		heroPagebackgroundColor:
			fr.colors.decisions.background.alt.pinkMacaron.default,
		circleBackgroundColor:
			fr.colors.decisions.background.alt.pinkMacaron.active,
		badgeColor: fr.colors.decisions.text.label.purpleGlycine.default,
		badgeBackgroundColor:
			fr.colors.decisions.background.contrast.pinkMacaron.default,
		topicAccordionBackgroundColor:
			fr.colors.decisions.background.actionLow.pinkMacaron.default,
		testAccordionBackgroundColor:
			fr.colors.decisions.background.contrast.pinkMacaron.default,
	},
	{
		id: "mobile",
		iconId: "ri-smartphone-line",
		pictogram: "application",
		href: "/rgaa/mobile",
		heroPagebackgroundColor:
			fr.colors.decisions.background.alt.yellowTournesol.default,
		circleBackgroundColor:
			fr.colors.decisions.background.alt.yellowTournesol.active,
		badgeColor: fr.colors.decisions.text.label.yellowTournesol.default,
		badgeBackgroundColor:
			fr.colors.decisions.background.actionLow.yellowTournesol.default,
		topicAccordionBackgroundColor:
			fr.colors.decisions.background.actionLow.yellowTournesol.default,
		testAccordionBackgroundColor:
			fr.colors.decisions.background.contrast.yellowTournesol.default,
	},
	{
		id: "bureautique",
		iconId: "ri-file-text-line",
		pictogram: "document-search",
		href: "/rgaa/bureautique",
		heroPagebackgroundColor:
			fr.colors.decisions.background.alt.greenEmeraude.default,
		circleBackgroundColor:
			fr.colors.decisions.background.alt.greenEmeraude.active,
		badgeColor: fr.colors.decisions.text.label.greenEmeraude.default,
		badgeBackgroundColor:
			fr.colors.decisions.background.contrast.greenEmeraude.default,
		topicAccordionBackgroundColor:
			fr.colors.decisions.background.alt.greenEmeraude.default,
		testAccordionBackgroundColor:
			fr.colors.decisions.background.alt.greenEmeraude.default,
	},
];

export const getReferentielStyle = (id: ReferentielId): ReferentielStyle =>
	REFERENTIEL_STYLES.find((referentiel) => referentiel.id === id)!;
