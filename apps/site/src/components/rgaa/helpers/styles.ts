import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";

// Shared by every numbered heading (topic, criterium, test) that pairs a number with a "link to anchor" button.
export const useNumberedHeadingStyles = tss.withName("NumberedHeading").create({
	link: {
		"&&": {
			color: fr.colors.decisions.text.mention.grey.default,
			backgroundColor: "transparent",
			"--hover-tint": "transparent",
			"--active-tint": "transparent",

			"&:hover, &:active": {
				color: fr.colors.decisions.text.title.grey.default,
			},
		},
	},
	number: {
		marginRight: fr.spacing("3v"),
	},
});
