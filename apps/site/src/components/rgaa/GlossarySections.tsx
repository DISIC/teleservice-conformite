"use client";

import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { tss } from "tss-react";
import type { GlossaryLetter } from "~/lib/rgaa-data";
import { glossaryLetterId } from "./GlossaryAlphabet";
import { renderMarkdown, toPlainText } from "./helpers/markdown";
import { useNumberedHeadingStyles } from "./helpers/styles";

interface GlossarySectionsProps {
	letters: GlossaryLetter[];
}

export default function GlossarySections({ letters }: GlossarySectionsProps) {
	const { classes } = useStyles();
	const { classes: headingClasses } = useNumberedHeadingStyles();

	return (
		<>
			{letters.map(({ letter, terms }) => (
				<section key={letter} className={classes.section}>
					<h2 id={glossaryLetterId(letter)} className={classes.letter}>
						{letter}
					</h2>
					{terms.map(({ slug, title, definition }) => (
						<div key={slug} className={classes.term}>
							<h3 id={slug} className={classes.termTitle}>
								{title}
								<Button
									iconId="fr-icon-links-fill"
									title={`Lien vers ${toPlainText(title)}`}
									priority="tertiary no outline"
									linkProps={{ href: `#${slug}` }}
									className={headingClasses.link}
								/>
							</h3>
							<div className={classes.definition}>
								{renderMarkdown(definition)}
							</div>
						</div>
					))}
				</section>
			))}
		</>
	);
}

const useStyles = tss.withName(GlossarySections.name).create({
	section: {
		marginTop: fr.spacing("10v"),
	},
	letter: {
		backgroundColor: fr.colors.decisions.background.alt.grey.default,
		paddingBlock: fr.spacing("4v"),
		paddingInline: fr.spacing("6v"),
		marginBottom: fr.spacing("8v"),
	},
	term: {
		marginBottom: fr.spacing("10v"),
	},
	termTitle: {
		display: "flex",
		alignItems: "center",
		marginBottom: fr.spacing("4v"),
		"&&": {
			fontSize: "1.375rem",
			lineHeight: "1.75rem",
		},
	},
	definition: {
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
		padding: fr.spacing("6v"),
		"& > :last-child": {
			marginBottom: 0,
		},
	},
});
