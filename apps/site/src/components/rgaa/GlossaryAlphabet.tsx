"use client";

import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";

export const glossaryLetterId = (letter: string) =>
	`lettre-${letter.toLowerCase()}`;

interface GlossaryAlphabetProps {
	letters: string[];
}

export default function GlossaryAlphabet({ letters }: GlossaryAlphabetProps) {
	const { classes } = useStyles();

	return (
		<nav aria-label="Index alphabétique du glossaire">
			<ul className={classes.list}>
				{letters.map((letter) => (
					<li key={letter}>
						<a
							className={classes.link}
							href={`#${glossaryLetterId(letter)}`}
							title={`Termes commençant par ${letter}`}
						>
							{letter}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}

const useStyles = tss.withName(GlossaryAlphabet.name).create(() => ({
	list: {
		display: "flex",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: fr.spacing("3v"),
		listStyle: "none",
		margin: 0,
		padding: 0,
	},
	link: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "2rem",
		height: "2rem",
		borderRadius: "50%",
		backgroundColor:
			fr.colors.decisions.background.actionLow.blueFrance.default,
		backgroundImage: "none",
		color: fr.colors.decisions.text.actionHigh.blueFrance.default,
		fontSize: "0.875rem",
		lineHeight: 1,
		"&:hover": {
			backgroundColor:
				fr.colors.decisions.background.actionLow.blueFrance.hover,
		},
	},
}));
