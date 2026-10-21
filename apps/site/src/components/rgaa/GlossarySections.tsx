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
			{letters.map(({ letter, terms }, index) => (
				<section key={letter} className={classes.section}>
					<div className={classes.letterRow}>
						<h2 id={glossaryLetterId(letter)} className={classes.letter}>
							{letter}
						</h2>
						{/* The first letter sits right under the alphabet: nothing to go back up to. */}
						{index > 0 && (
							<a
								href="#contenu"
								className={fr.cx(
									"fr-link",
									"fr-link--lg",
									"fr-icon-arrow-up-fill",
									"fr-link--icon-left",
								)}
							>
								Haut de page
							</a>
						)}
					</div>
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
	letterRow: {
		display: "flex",
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: "space-between",
		gap: fr.spacing("4v"),
		paddingBottom: fr.spacing("4v"),
		marginBottom: fr.spacing("7v"),
		borderBottom: `1px solid ${fr.colors.decisions.border.default.blueFrance.default}`,
	},
	letter: {
		marginBottom: 0,
	},
	term: {
		marginBottom: fr.spacing("7v"),
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
