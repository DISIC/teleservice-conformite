import { fr } from "@codegouvfr/react-dsfr";
import type { ReferentielId } from "@rgaa/content";
import type { PictogramId } from "./Pictogram";

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

export type ReferentielInfos = {
	id: ReferentielId;
	title: string;
	description: string;
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
			fr.colors.decisions.background.actionLow.pinkMacaron.default,
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
			fr.colors.decisions.background.actionLow.yellowTournesol.default,
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
			fr.colors.decisions.background.contrast.greenEmeraude.default,
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
