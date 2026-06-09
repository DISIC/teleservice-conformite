import { Fragment, type ReactNode } from "react";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import {
	getPrevNextSections,
	getVisibleSections,
	type SectionSlug,
	sectionHref,
} from "~/utils/declaration/sections";
import type { EditingMode } from "~/utils/declaration/status";
import {
	AuditContenusSection,
	AuditGeneralSection,
	AuditNonConformitesSection,
	AuditOutilsSection,
} from "./items/Audit";
import { ContactSection } from "./items/Contact";
import { InfosSection } from "./items/Infos";
import { SchemaSection } from "./items/Schema";

export type DeclarationChangeFn = (
	updater: (prev: PopulatedDeclaration) => PopulatedDeclaration,
) => void;

/** Props every Section component receives from {@link SectionContent}. */
export type SectionRenderProps = {
	declaration: PopulatedDeclaration;
	onDeclarationChange: DeclarationChangeFn;
	prevHref: string | null;
	nextHref: string | null;
	mode: EditingMode;
};

type SectionRenderer = (props: SectionRenderProps) => ReactNode;

/**
 * Maps each non-terminal SectionSlug to its rendered component. Each audit
 * Sub-section is its own self-contained form component (ADR-0002), so the
 * dispatch stays a pure lookup. `contact` is the terminal Section and is
 * rendered separately because it alone needs `onPublishAttempt`.
 */
const SECTION_RENDERERS: Record<
	Exclude<SectionSlug, "contact">,
	SectionRenderer
> = {
	infos: (props) => <InfosSection {...props} />,
	"audit-general": (props) => <AuditGeneralSection {...props} />,
	"audit-outils": (props) => <AuditOutilsSection {...props} />,
	"audit-contenus": (props) => <AuditContenusSection {...props} />,
	"audit-non-conformites": (props) => <AuditNonConformitesSection {...props} />,
	schema: (props) => <SchemaSection {...props} />,
};

type SectionContentProps = {
	declaration: PopulatedDeclaration;
	currentSection: SectionSlug;
	onDeclarationChange: DeclarationChangeFn;
	mode: EditingMode;
	/** Flips the page's "publish attempted" flag so the error summary appears. */
	onPublishAttempt: () => void;
};

/**
 * Dispatches to the right Section component based on `currentSection`. The
 * keyed Fragment forces a fresh mount per slug, so a Section never carries edit
 * state across a navigation — switching always lands in read-only.
 */
export function SectionContent({
	declaration,
	currentSection,
	onDeclarationChange,
	mode,
	onPublishAttempt,
}: SectionContentProps) {
	const visible = getVisibleSections(declaration);
	const { prev, next } = getPrevNextSections(currentSection, visible);
	const prevHref = prev ? sectionHref(declaration.id, prev) : null;
	const nextHref = next ? sectionHref(declaration.id, next) : null;
	const renderProps = {
		declaration,
		onDeclarationChange,
		prevHref,
		nextHref,
		mode,
	};

	return (
		<Fragment key={currentSection}>
			{currentSection === "contact" ? (
				<ContactSection {...renderProps} onPublishAttempt={onPublishAttempt} />
			) : (
				SECTION_RENDERERS[currentSection](renderProps)
			)}
		</Fragment>
	);
}
