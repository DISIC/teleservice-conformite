import { fr } from "@codegouvfr/react-dsfr";
import type { ReferenceId } from "../references";

export const colors: Record<
	ReferenceId,
	{
		topicAccordionBackgroundColor: string;
		criteriaAccordionBackgroundColor: string;
	}
> = {
	web: {
		topicAccordionBackgroundColor:
			fr.colors.decisions.background.actionLow.pinkMacaron.default,
		criteriaAccordionBackgroundColor:
			fr.colors.decisions.background.contrast.pinkMacaron.default,
	},
	mobile: {
		topicAccordionBackgroundColor:
			fr.colors.decisions.background.actionLow.yellowTournesol.default,
		criteriaAccordionBackgroundColor:
			fr.colors.decisions.background.contrast.yellowTournesol.default,
	},
	bureautique: {
		topicAccordionBackgroundColor:
			fr.colors.decisions.background.alt.greenEmeraude.default,
		criteriaAccordionBackgroundColor:
			fr.colors.decisions.background.alt.greenEmeraude.default,
	},
};
