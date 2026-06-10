import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import {
	SideMenu as DsfrSideMenu,
	type SideMenuProps as DsfrSideMenuProps,
} from "@codegouvfr/react-dsfr/SideMenu";
import type { ReactNode } from "react";
import { tss } from "tss-react";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { SECTION_BADGE } from "~/utils/declaration/state";
import {
	getVisibleSections,
	isAuditSubSection,
	isAuditToVerify,
	isSectionToComplete,
	isSectionToVerify,
	SECTION_TITLES,
	type SectionSlug,
	sectionHref,
} from "~/utils/declaration/sections";

type SideMenuProps = {
	declaration: PopulatedDeclaration;
	currentSection: SectionSlug;
};

export function SideMenu({ declaration, currentSection }: SideMenuProps) {
	const { classes } = useStyles();
	const declarationId = declaration.id;
	const auditMissing = !declaration.audit;
	const isAuditCurrent = isAuditSubSection(currentSection);
	const visibleAuditSubSections =
		getVisibleSections(declaration).filter(isAuditSubSection);

	const renderLabel = (
		label: string,
		opts: { toComplete?: boolean; toVerify?: boolean } = {},
	): ReactNode => (
		<span className={classes.itemLabel}>
			<span>{label}</span>
			{opts.toComplete && (
				<Badge
					small
					noIcon
					style={{
						color: SECTION_BADGE["to-complete"].color,
						backgroundColor: SECTION_BADGE["to-complete"].bgColor,
					}}
				>
					{SECTION_BADGE["to-complete"].label}
				</Badge>
			)}
			{opts.toVerify && (
				<Badge
					small
					noIcon
					style={{
						color: SECTION_BADGE["to-verify"].color,
						backgroundColor: SECTION_BADGE["to-verify"].bgColor,
					}}
				>
					{SECTION_BADGE["to-verify"].label}
				</Badge>
			)}
		</span>
	);

	const sectionItem = (slug: SectionSlug): DsfrSideMenuProps.Item.Link => ({
		text: renderLabel(SECTION_TITLES[slug], {
			toComplete: isSectionToComplete(declaration, slug),
			toVerify: isSectionToVerify(declaration, slug),
		}),
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
			text: renderLabel("Audit", {
				toComplete: auditMissing,
				toVerify: isAuditToVerify(declaration),
			}),
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
		<DsfrSideMenu
			align="left"
			burgerMenuButtonText="Sections de la déclaration"
			items={items}
			classes={{ root: classes.root }}
		/>
	);
}

const useStyles = tss.withName(SideMenu.name).create({
	root: {
		marginTop: 0,
	},
	itemLabel: {
		display: "inline-flex",
		alignItems: "center",
		gap: fr.spacing("2v"),
		flexWrap: "wrap",
	},
});
