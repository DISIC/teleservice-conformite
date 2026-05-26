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
import { InfosSection } from "./InfosSection";
import { SchemaSection } from "./SchemaSection";

export type DeclarationChangeFn = (
	updater: (prev: PopulatedDeclaration) => PopulatedDeclaration,
) => void;

type SectionContentProps = {
	declaration: PopulatedDeclaration;
	currentSection: SectionSlug;
	onDeclarationChange: DeclarationChangeFn;
};

/**
 * Dispatches to the right section component based on `currentSection`.
 * Sections not yet migrated render a stub placeholder.
 */
export function SectionContent({
	declaration,
	currentSection,
	onDeclarationChange,
}: SectionContentProps) {
	const visible = getVisibleSections(declaration);
	const { prev, next } = getPrevNextSections(currentSection, visible);
	const prevHref = prev ? sectionHref(declaration.id, prev) : null;
	const nextHref = next ? sectionHref(declaration.id, next) : null;

	switch (currentSection) {
		case "infos":
			return (
				<InfosSection
					declaration={declaration}
					onDeclarationChange={onDeclarationChange}
					prevHref={prevHref}
					nextHref={nextHref}
				/>
			);
		case "schema":
			return (
				<SchemaSection
					declaration={declaration}
					onDeclarationChange={onDeclarationChange}
					prevHref={prevHref}
					nextHref={nextHref}
				/>
			);
		default:
			return (
				<StubSection
					declaration={declaration}
					currentSection={currentSection}
					prevHref={prevHref}
					nextHref={nextHref}
				/>
			);
	}
}

type StubSectionProps = {
	declaration: PopulatedDeclaration;
	currentSection: SectionSlug;
	prevHref: string | null;
	nextHref: string | null;
};

function StubSection({
	declaration,
	currentSection,
	prevHref,
	nextHref,
}: StubSectionProps) {
	const { classes } = useStubStyles();
	return (
		<div className={classes.root}>
			<h2 className={classes.title}>{SECTION_TITLES[currentSection]}</h2>
			<Alert
				severity="info"
				small
				title="Section non encore migrée"
				description={`La section « ${SECTION_TITLES[currentSection]} » sera branchée dans une prochaine itération. En attendant, utilisez l'ancien parcours pour modifier son contenu.`}
			/>
			<div className={classes.debug}>
				<p className={fr.cx("fr-text--sm", "fr-mb-1v")}>
					<strong>Slug :</strong> {currentSection}
				</p>
				<p className={fr.cx("fr-text--sm", "fr-mb-1v")}>
					<strong>Précédent :</strong> {prevHref ?? "—"}
				</p>
				<p className={fr.cx("fr-text--sm", "fr-mb-0")}>
					<strong>Suivant :</strong> {nextHref ?? "—"}
				</p>
				<p className={fr.cx("fr-text--xs", "fr-mb-0", "fr-mt-2v")}>
					<em>(Declaration #{declaration.id})</em>
				</p>
			</div>
		</div>
	);
}

const useStubStyles = tss.withName("StubSection").create({
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
