import {
	getPrevNextSections,
	SECTION_SLUGS,
	type SectionSlug,
	sectionHref,
} from "~/domain/declaration/sections";
import type { EditingMode } from "~/domain/declaration/status";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import type {
	AnySectionDefinition,
	DeclarationChangeFn,
} from "./defineSection";
import {
	auditContenusSection,
	auditGeneralSection,
	auditNonConformitesSection,
	auditOutilsSection,
} from "./items/Audit";
import { contactSection } from "./items/Contact";
import { infosSection } from "./items/Infos";
import { schemaSection } from "./items/Schema";
import { Section } from "./Section";

export type { DeclarationChangeFn };

const SECTION_DEFINITIONS: Record<SectionSlug, AnySectionDefinition> = {
	infos: infosSection,
	"audit-general": auditGeneralSection,
	"audit-outils": auditOutilsSection,
	"audit-contenus": auditContenusSection,
	"audit-non-conformites": auditNonConformitesSection,
	schema: schemaSection,
	contact: contactSection,
};

type SectionContentProps = {
	declaration: PopulatedDeclaration;
	currentSection: SectionSlug;
	onDeclarationChange: DeclarationChangeFn;
	mode: EditingMode;
	/** Flips the page's "publish attempted" flag so the error summary appears. */
	onPublishAttempt: () => void;
};

/** Mounts the runtime for the current slug; the key forces a fresh mount per Section. */
export function SectionContent({
	declaration,
	currentSection,
	onDeclarationChange,
	mode,
	onPublishAttempt,
}: SectionContentProps) {
	const { prev, next } = getPrevNextSections(currentSection, SECTION_SLUGS);

	return (
		<Section
			key={currentSection}
			definition={SECTION_DEFINITIONS[currentSection]}
			declaration={declaration}
			onDeclarationChange={onDeclarationChange}
			mode={mode}
			prevHref={prev ? sectionHref(declaration.id, prev) : null}
			nextHref={next ? sectionHref(declaration.id, next) : null}
			onPublishAttempt={onPublishAttempt}
		/>
	);
}
