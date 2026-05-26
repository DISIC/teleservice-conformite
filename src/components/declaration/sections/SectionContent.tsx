import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { tss } from "tss-react";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import {
	getPrevNextSections,
	getVisibleSections,
	SECTION_TITLES,
	type SectionSlug,
	sectionHref,
} from "~/utils/declaration/sections";

type SectionContentProps = {
	declaration: PopulatedDeclaration;
	currentSection: SectionSlug;
};

/**
 * Dispatches to the right section component based on `currentSection`.
 * For slice 3, every section renders a stub. Real section components are wired
 * in follow-up slices, one per Section/Sub-section.
 */
export function SectionContent({
	declaration,
	currentSection,
}: SectionContentProps) {
	const { classes } = useStyles();
	const visible = getVisibleSections(declaration);
	const { prev, next } = getPrevNextSections(currentSection, visible);

	return (
		<div className={classes.root}>
			<h2 className={classes.title}>{SECTION_TITLES[currentSection]}</h2>
			<Alert
				severity="info"
				small
				title="Section non encore migrée"
				description={`La section « ${SECTION_TITLES[currentSection]} » sera branchée dans une prochaine itération. En attendant, utilisez l'ancien parcours.`}
			/>
			<div className={classes.debug}>
				<p className={fr.cx("fr-text--sm", "fr-mb-1v")}>
					<strong>Slug :</strong> {currentSection}
				</p>
				<p className={fr.cx("fr-text--sm", "fr-mb-1v")}>
					<strong>Précédent :</strong>{" "}
					{prev
						? `${SECTION_TITLES[prev]} (${sectionHref(declaration.id, prev)})`
						: "—"}
				</p>
				<p className={fr.cx("fr-text--sm", "fr-mb-0")}>
					<strong>Suivant :</strong>{" "}
					{next
						? `${SECTION_TITLES[next]} (${sectionHref(declaration.id, next)})`
						: "—"}
				</p>
			</div>
		</div>
	);
}

const useStyles = tss.withName(SectionContent.name).create({
	root: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("4v"),
	},
	title: {
		margin: 0,
	},
	debug: {
		backgroundColor: fr.colors.decisions.background.alt.grey.default,
		padding: fr.spacing("4v"),
		borderRadius: 4,
	},
});
