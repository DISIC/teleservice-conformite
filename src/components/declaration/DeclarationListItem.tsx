import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import NextLink from "next/link";
import { tss } from "tss-react";

import { StatusBadge } from "~/components/declaration/DeclarationStatusBadge";
import { appKindOptions } from "~/payload/selectOptions";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { copyToClipboard } from "~/utils/declaration-helper";

export default function DeclarationListItem({
	declaration,
	onCopySuccess,
}: {
	declaration: PopulatedDeclaration & { updatedAtFormatted: string };
	onCopySuccess?: (declarationName: string) => void;
}) {
	const { classes, cx } = useStyles();
	const { name } = declaration.entity || {};
	const { rate } = declaration.audit || {};
	const hasPublishedDeclaration = !!declaration?.publishedContent;

	return (
		<div key={declaration.id} className={classes.declarationCard}>
			<div>
				<div className={classes.declarationTitle}>
					<Button
						linkProps={{
							href: `/dashboard/declaration/${declaration.id}`,
						}}
						className={classes.textButton}
					>
						{declaration.name}
					</Button>
					<StatusBadge
						isPublished={declaration?.status === "published"}
						isModified={
							declaration?.status === "unpublished" &&
							!!declaration?.publishedContent
						}
						isDraft={
							declaration?.status !== "published" &&
							!declaration?.publishedContent
						}
					/>
				</div>
				<p className={cx(classes.details, fr.cx("fr-text--sm"))}>{name}</p>
				<p className={cx(classes.details, fr.cx("fr-text--sm"))}>
					{appKindOptions.find(
						(option) => option.value === declaration.app_kind,
					)?.label ?? declaration.app_kind}
					{declaration.url && declaration.app_kind === "website"
						? ` - ${declaration.url}`
						: ""}
				</p>
				<p className={cx(classes.details, fr.cx("fr-text--sm"))}>
					Dernière modification le {declaration.updatedAtFormatted}
				</p>
			</div>
			{hasPublishedDeclaration && (
				<p className={cx(classes.auditRateWrapper, fr.cx("fr-mb-0"))}>
					<span className={cx(classes.auditRateValue)}>
						{rate !== undefined && rate !== null ? `${rate}%` : "N/A"}
					</span>
					<span className={classes.auditRateLabel}>taux conformité</span>
				</p>
			)}

			{hasPublishedDeclaration && (
				<Button
					iconId="ri-file-copy-line"
					priority="tertiary"
					onClick={() =>
						copyToClipboard(
							`${process.env.NEXT_PUBLIC_FRONT_URL}/declaration/${declaration.id}/publish`,
							() => onCopySuccess?.(declaration.name || ""),
						)
					}
					nativeButtonProps={{
						"aria-label": "Copier le lien web de la déclaration publiée",
					}}
				>
					Copier le lien
				</Button>
			)}
		</div>
	);
}

const useStyles = tss.withName(DeclarationListItem.name).create({
	declarationCard: {
		display: "grid",

		alignItems: "center",
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		padding: fr.spacing("4v"),

		"@media (min-width: 768px)": {
			gridTemplateColumns: "2fr 1fr auto",
		},
	},
	declarationTitle: {
		display: "flex",
		gap: fr.spacing("2v"),
		marginBottom: fr.spacing("4v"),
		h2: {
			color: fr.colors.decisions.background.actionHigh.blueFrance.default,
			fontSize: fr.typography[0].style.fontSize,
			lineHeight: fr.typography[0].style.lineHeight,
			overflowWrap: "anywhere",
			wordBreak: "break-word",
			marginBottom: 0,

			"& a": {
				overflowWrap: "anywhere",
				wordBreak: "break-word",
			},
		},
	},
	textButton: {
		padding: 0,
		height: "fit-content",
		minHeight: "fit-content",
		backgroundColor: "inherit",
		color: fr.colors.decisions.background.actionHigh.blueFrance.default,
		fontSize: fr.typography[0].style.fontSize,
		lineHeight: fr.typography[0].style.lineHeight,
		fontWeight: 700,

		"&:hover": {
			textDecoration: "underline",
			textUnderlineOffset: "4px",
			backgroundColor: "inherit !important",
		},
	},
	details: {
		margin: 0,
		color: fr.colors.decisions.text.mention.grey.default,
		overflowWrap: "anywhere",
		wordBreak: "break-word",
	},
	auditRateWrapper: {
		"@media (max-width: 768px)": {
			display: "flex",
			flexDirection: "row-reverse",
			alignItems: "center",
			justifyContent: "flex-end",
			"& > span:last-of-type": {
				marginRight: fr.spacing("2v"),
			},
		},
	},
	auditRateValue: {
		...fr.typography[3].style,
		color: fr.colors.decisions.text.label.grey.default,
		margin: 0,
		display: "block",
	},
	auditRateLabel: {
		color: fr.colors.decisions.text.label.grey.default,
		marginBottom: 0,
	},
	emptyStateContainer: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("5v"),
		justifyContent: "center",
		alignItems: "center",
		marginTop: fr.spacing("25v"),
	},
	emptyStateTitle: {
		fontFamily: "Marianne",
		fontWeight: 700,
		fontSize: fr.typography[22].style.fontSize,
		lineHeight: fr.typography[20].style.lineHeight,
	},
	alertWrapper: {
		width: "100%",
		display: "flex",
		marginTop: fr.spacing("8v"),

		"& div": {
			width: "100%",
		},
	},
});
