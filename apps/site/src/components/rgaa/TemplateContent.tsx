"use client";

import Markdown from "markdown-to-jsx";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";
import Download from "@codegouvfr/react-dsfr/Download";
import Button from "@codegouvfr/react-dsfr/Button";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { useRef, useState } from "react";

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
	const declarationRef = useRef<HTMLDivElement>(null);
	const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
		"idle",
	);

	const copyHtml = async () => {
		const html = declarationRef.current?.innerHTML;
		if (!html) return;

		try {
			await navigator.clipboard.writeText(html);
			setCopyStatus("copied");
		} catch {
			setCopyStatus("error");
		}
		setTimeout(() => setCopyStatus("idle"), 3000);
	};

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
						onClick={copyHtml}
					>
						Copier le code html
					</Button>
					<div className={classes.copyStatus}>
						{copyStatus === "copied" && (
							<Alert
								small
								severity="success"
								description="Le code html a été copié dans le presse-papiers."
							/>
						)}
						{copyStatus === "error" && (
							<Alert
								small
								severity="error"
								description="La copie du code html a échoué."
							/>
						)}
					</div>
					<div>
						<h3>Exemple de déclaration d’accessibilité</h3>
						<div ref={declarationRef}>
							<Markdown options={{ overrides: DECLARATION_EXAMPLE_OVERRIDES }}>
								{declarationExample}
							</Markdown>
						</div>
					</div>
				</div>
			</li>
		</ul>
	);
}

const useStyles = tss.withName(TemplateContent.name).create({
	// The live region must stay in the DOM to be announced; only its gap is removed while empty.
	copyStatus: {
		"&:empty": {
			position: "absolute",
		},
	},
	htmlContent: {
		backgroundColor: fr.colors.decisions.background.default.grey.hover,
		padding: fr.spacing("8v"),
		gap: fr.spacing("6v"),
		display: "flex",
		flexDirection: "column",
		"& mark": {
			backgroundColor:
				fr.colors.decisions.background.alt.yellowTournesol.default,
			color: "inherit",
			margin: fr.spacing("1v"),
		},
		"& p.fr-badge": {
			marginBottom: fr.spacing("4v"),
		},
	},
});
