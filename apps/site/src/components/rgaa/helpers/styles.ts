import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";

// Set by each topic on its block: anchors inside it must clear its sticky heading.
export const belowStickyTopicHeading = `calc(var(--topic-heading-height, 0px) + ${fr.spacing("2w")})`;

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
	title: {
		display: "flex",
		// The anchor button is taller than a text line: align on the first baseline, not the box top.
		alignItems: "baseline",
	},
});
