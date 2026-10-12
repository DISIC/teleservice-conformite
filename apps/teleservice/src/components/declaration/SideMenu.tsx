import { fr } from "@codegouvfr/react-dsfr";
import {
	SideMenu as DsfrSideMenu,
	type SideMenuProps as DsfrSideMenuProps,
} from "@codegouvfr/react-dsfr/SideMenu";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { tss } from "tss-react";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { SectionBadge } from "~/components/declaration/SectionBadge";
import { useShowToComplete } from "~/components/declaration/ToCompleteGuidance";
import type { BadgeVariant } from "~/domain/declaration/state";
import {
	isAuditSubSection,
	isAuditToComplete,
	isAuditToVerify,
	isSectionNotApplicable,
	isSectionToComplete,
	isSectionToVerify,
	SECTION_SLUGS,
	SECTION_TITLES,
	type SectionSlug,
	sectionHref,
} from "~/domain/declaration/sections";

type SideMenuProps = {
	declaration: PopulatedDeclaration;
	currentSection: SectionSlug;
};

export function SideMenu({ declaration, currentSection }: SideMenuProps) {
	const showToComplete = useShowToComplete();
	const { classes } = useStyles();
	const declarationId = declaration.id;
	const isAuditCurrent = isAuditSubSection(currentSection);
	const visibleAuditSubSections = SECTION_SLUGS.filter(isAuditSubSection);

	// Answering the audit question flips the sub-section badges out of sight of
	// screen reader users; announce the change, never the initial state.
	const auditNotApplicable = isSectionNotApplicable(
		declaration,
		"audit-outils",
	);
	const previousAuditNotApplicable = useRef(auditNotApplicable);
	const [announcement, setAnnouncement] = useState("");
	useEffect(() => {
		if (previousAuditNotApplicable.current === auditNotApplicable) return;
		previousAuditNotApplicable.current = auditNotApplicable;
		setAnnouncement(
			auditNotApplicable
				? "Les étapes de l’audit sont désormais marquées comme non applicables."
				: "Les étapes de l’audit ne sont plus marquées comme non applicables.",
		);
	}, [auditNotApplicable]);

	const renderLabel = (label: string, variants: BadgeVariant[]): ReactNode => (
		<span className={classes.itemLabel}>
			<span>{label}</span>
			{variants.map((variant) => (
				<SectionBadge key={variant} variant={variant} />
			))}
		</span>
	);

	const sectionBadges = (slug: SectionSlug): BadgeVariant[] => {
		const variants: BadgeVariant[] = [];
		if (showToComplete && isSectionToComplete(declaration, slug))
			variants.push("to-complete");
		if (isSectionToVerify(declaration, slug)) variants.push("to-verify");
		if (isSectionNotApplicable(declaration, slug))
			variants.push("not-applicable");
		return variants;
	};

	const sectionItem = (slug: SectionSlug): DsfrSideMenuProps.Item.Link => ({
		text: renderLabel(SECTION_TITLES[slug], sectionBadges(slug)),
		linkProps: {
			href: sectionHref(declarationId, slug),
			scroll: false,
			shallow: true,
		},
		isActive: currentSection === slug,
	});

	const items: DsfrSideMenuProps.Item[] = [
		sectionItem("infos"),
		{
			text: renderLabel("Audit", [
				...(showToComplete && isAuditToComplete(declaration)
					? (["to-complete"] as const)
					: []),
				...(isAuditToVerify(declaration) ? (["to-verify"] as const) : []),
			]),
			linkProps: {
				href: sectionHref(declarationId, "audit-general"),
				scroll: false,
				shallow: true,
			},
			isActive: isAuditCurrent,
			expandedByDefault: isAuditCurrent,
			items: visibleAuditSubSections.map(sectionItem),
		},
		sectionItem("schema"),
		sectionItem("contact"),
	];

	return (
		<>
			<output aria-live="polite" className={fr.cx("fr-sr-only")}>
				{announcement}
			</output>
			<DsfrSideMenu
				align="left"
				sticky
				burgerMenuButtonText="Sections de la déclaration"
				{...{ "aria-label": "Sections de la déclaration" }}
				items={items}
				classes={{ root: classes.root }}
			/>
		</>
	);
}

const useStyles = tss.withName(SideMenu.name).create({
	root: {
		marginTop: 0,
		[fr.breakpoints.up("md")]: {
			top: fr.spacing("16v"),
		},
	},
	itemLabel: {
		display: "inline-flex",
		alignItems: "center",
		gap: fr.spacing("2v"),
		flexWrap: "wrap",
	},
});
