import { Fragment, type ReactNode } from "react";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import {
	getPrevNextSections,
	getVisibleSections,
	type SectionSlug,
	sectionHref,
} from "~/utils/declaration/sections";
import { AuditSection } from "./items/Audit";
import { ContactSection } from "./items/Contact";
import { InfosSection } from "./items/Infos";
import { SchemaSection } from "./items/Schema";

export type DeclarationChangeFn = (
	updater: (prev: PopulatedDeclaration) => PopulatedDeclaration,
) => void;

type SectionRenderProps = {
	declaration: PopulatedDeclaration;
	onDeclarationChange: DeclarationChangeFn;
	prevHref: string | null;
	nextHref: string | null;
};

type SectionRenderer = (props: SectionRenderProps) => ReactNode;

/**
 * Maps each SectionSlug to its rendered component. Audit sub-sections all
 * point at `AuditSection`, each binding its sub-section slug at definition
 * time so the dispatch stays a pure lookup.
 */
const SECTION_RENDERERS: Record<SectionSlug, SectionRenderer> = {
	infos: (props) => <InfosSection {...props} />,
	"audit-realisation": (props) => (
		<AuditSection {...props} currentSubSection="audit-realisation" />
	),
	"audit-outils": (props) => (
		<AuditSection {...props} currentSubSection="audit-outils" />
	),
	"audit-contenus": (props) => (
		<AuditSection {...props} currentSubSection="audit-contenus" />
	),
	"audit-non-conformites": (props) => (
		<AuditSection {...props} currentSubSection="audit-non-conformites" />
	),
	schema: (props) => <SchemaSection {...props} />,
	contact: (props) => <ContactSection {...props} />,
};

type SectionContentProps = {
	declaration: PopulatedDeclaration;
	currentSection: SectionSlug;
	onDeclarationChange: DeclarationChangeFn;
};

/**
 * Dispatches to the right Section component based on `currentSection`. The
 * keyed Fragment forces a fresh mount per slug — by design, since Q7 blocks
 * navigation in edit mode and switching while read-only should always land
 * in read-only.
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

	return (
		<Fragment key={currentSection}>
			{SECTION_RENDERERS[currentSection]({
				declaration,
				onDeclarationChange,
				prevHref,
				nextHref,
			})}
		</Fragment>
	);
}
