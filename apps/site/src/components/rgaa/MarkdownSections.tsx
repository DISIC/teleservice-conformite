"use client";

import { fr } from "@codegouvfr/react-dsfr";
import Markdown from "markdown-to-jsx";
import { tss } from "tss-react";
import type { MarkdownSection } from "~/lib/content";

interface MarkdownSectionsProps {
	sections: MarkdownSection[];
}

export default function MarkdownSections({ sections }: MarkdownSectionsProps) {
	const { classes, cx } = useStyles();

	return (
		<>
			{sections.map(({ id, label, body }) => (
				<section key={id}>
					<h2 id={id} className={classes.heading}>
						{label}
					</h2>
					<Markdown>{body}</Markdown>
					<div className={classes.actions}>
						<a
							href="#contenu"
							className={cx(
								fr.cx("fr-link", "fr-icon-arrow-up-fill", "fr-link--icon-left"),
								classes.topLink,
							)}
						>
							Haut de page
						</a>
					</div>
				</section>
			))}
		</>
	);
}

const useStyles = tss.withName(MarkdownSections.name).create({
	heading: {
		marginBottom: fr.spacing("5w"),
	},
	topLink: {
		textDecoration: "none",
		fontSize: "18px",
		lineHeight: "28px",
		fontWeight: 400,
	},
	actions: {
		display: "flex",
		justifyContent: "flex-end",
		marginBottom: fr.spacing("4w"),
	},
});
