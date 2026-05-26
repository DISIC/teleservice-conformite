import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import {
	getPrevNextSections,
	getVisibleSections,
	isAuditSubSection,
	type SectionSlug,
	sectionHref,
} from "~/utils/declaration/sections";
import { AuditSection } from "./AuditSection";
import { ContactSection } from "./ContactSection";
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
 * Each section is `key`-ed by its slug so its internal state (readOnly, form
 * values) is fresh on every switch — by design, since Q7 blocks navigation in
 * edit mode and switching while read-only should always land in read-only.
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

	if (isAuditSubSection(currentSection)) {
		return (
			<AuditSection
				key={currentSection}
				declaration={declaration}
				onDeclarationChange={onDeclarationChange}
				currentSubSection={currentSection}
				prevHref={prevHref}
				nextHref={nextHref}
			/>
		);
	}

	switch (currentSection) {
		case "infos":
			return (
				<InfosSection
					key={currentSection}
					declaration={declaration}
					onDeclarationChange={onDeclarationChange}
					prevHref={prevHref}
					nextHref={nextHref}
				/>
			);
		case "schema":
			return (
				<SchemaSection
					key={currentSection}
					declaration={declaration}
					onDeclarationChange={onDeclarationChange}
					prevHref={prevHref}
					nextHref={nextHref}
				/>
			);
		case "contact":
			return (
				<ContactSection
					key={currentSection}
					declaration={declaration}
					onDeclarationChange={onDeclarationChange}
					prevHref={prevHref}
					nextHref={nextHref}
				/>
			);
	}
}
