"use client";

import Markdown from "markdown-to-jsx";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";
import Download from "@codegouvfr/react-dsfr/Download";
import Button from "@codegouvfr/react-dsfr/Button";

const DECLARATION_EXAMPLE_OVERRIDES = {
	h1: { component: "h4" },
	h2: { component: "h5" },
	h3: { component: "h6" },
} as const;

interface TemplateContentProps {
	declarationExample: string;
}

export default function TemplateContent({
	declarationExample,
}: TemplateContentProps) {
	const { classes } = useStyles();

	return (
		<ul>
			<li>
				<Download
					details="61,88 Ko"
					label="Au format ODT"
					linkProps={{ href: "#" }}
				/>
			</li>
			<li>
				<Download
					details="61,88 Ko"
					label="Au format PDF"
					linkProps={{ href: "#" }}
				/>
			</li>
			<li>
				<p>Au format HTML</p>
				<div className={classes.htmlContent}>
					<Button
						iconId="ri-file-copy-line"
						iconPosition="right"
						priority="secondary"
					>
						Copier le code html
					</Button>
					<div>
						<h3>Exemple de déclaration d’accessibilité</h3>
						<Markdown options={{ overrides: DECLARATION_EXAMPLE_OVERRIDES }}>
							{declarationExample}
						</Markdown>
					</div>
				</div>
			</li>
		</ul>
	);
}

const useStyles = tss.withName(TemplateContent.name).create({
	htmlContent: {
		backgroundColor: fr.colors.decisions.background.default.grey.hover,
		padding: fr.spacing("8v"),
		gap: fr.spacing("6v"),
		display: "flex",
		flexDirection: "column",
		"& highlight": {
			backgroundColor:
				fr.colors.decisions.background.alt.yellowTournesol.default,
			margin: fr.spacing("1v"),
		},
	},
});
