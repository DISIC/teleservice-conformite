import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { SideMenu, type SideMenuProps } from "@codegouvfr/react-dsfr/SideMenu";
import type { ReactNode } from "react";
import { tss } from "tss-react";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
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

type DeclarationSideMenuProps = {
	declaration: PopulatedDeclaration;
	currentSection: SectionSlug;
};

export function DeclarationSideMenu({
	declaration,
	currentSection,
}: DeclarationSideMenuProps) {
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
				<Badge severity="new" small noIcon>
					À compléter
				</Badge>
			)}
			{opts.toVerify && (
				<Badge severity="new" small noIcon>
					À vérifier
				</Badge>
			)}
		</span>
	);

	const sectionItem = (slug: SectionSlug): SideMenuProps.Item.Link => ({
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

	const items: SideMenuProps.Item[] = [
		sectionItem("infos"),
		{
			text: renderLabel("Audit", {
				toComplete: auditMissing,
				toVerify: isAuditToVerify(declaration),
			}),
			linkProps: {
				href: sectionHref(declarationId, "audit-realisation"),
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
		<SideMenu
			align="left"
			burgerMenuButtonText="Sections de la déclaration"
			items={items}
			classes={{ root: classes.root }}
		/>
	);
}

const useStyles = tss.withName(DeclarationSideMenu.name).create({
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
