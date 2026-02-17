import { useState } from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import NextLink from "next/link";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";

import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { copyToClipboard } from "~/utils/declaration-helper";
import { StatusBadge } from "~/components/declaration/DeclarationStatusBadge";
import { appKindOptions } from "~/payload/selectOptions";

export default function DeclarationListItem({
	declaration,
}: { declaration: PopulatedDeclaration & { updatedAtFormatted: string } }) {
	const { classes, cx } = useStyles();
	const { name } = declaration.entity || {};
	const { rate } = declaration.audit || {};
	const hasPublishedDeclaration = !!declaration?.publishedContent;

	const [showAlert, setShowAlert] = useState<boolean>(false);
	const [alertDetails, setAlertDetails] = useState<{
		title?: string;
		description?: string;
		severity: "info" | "success" | "warning" | "error";
	}>({ title: "", description: "", severity: "info" });

	const showDeclarationAlert = ({
		title,
		description,
		severity,
	}: {
		title?: string;
		description?: string;
		severity: "info" | "success" | "warning" | "error";
	}) => {
		setAlertDetails({ title, description, severity });
		setShowAlert(true);
	};

	return (
		<div key={declaration.id} className={classes.declarationCard}>
			<div>
				<h2 className={classes.declarationTitle}>
					<NextLink href={`/dashboard/declaration/${declaration.id}`}>
						{declaration.name}
					</NextLink>
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
				</h2>
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
			<div
				style={
					hasPublishedDeclaration && rate !== undefined
						? { visibility: "visible" }
						: { visibility: "hidden" }
				}
			>
				<h3 className={cx(classes.auditRateValue)}>{rate}%</h3>
				<p className={classes.auditRateLabel}>taux conformité</p>
			</div>
			{hasPublishedDeclaration && (
				<Button
					iconId="fr-icon-share-line"
					priority="tertiary"
					style={{ width: "100%" }}
					onClick={() =>
						copyToClipboard(
							`${process.env.NEXT_PUBLIC_FRONT_URL}/dashboard/declaration/${declaration.id}`,
							() =>
								showDeclarationAlert({
									description: "Lien copié dans le presse-papier",
									severity: "success",
								}),
						)
					}
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
		gridTemplateColumns: "2fr 1fr auto",
		alignItems: "center",
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		padding: fr.spacing("4v"),
	},
	declarationTitle: {
		marginBottom: fr.spacing("4v"),
		color: fr.colors.decisions.background.actionHigh.blueFrance.default,
		fontSize: fr.typography[0].style.fontSize,
		lineHeight: fr.typography[0].style.lineHeight,

		"& a": {
			marginRight: fr.spacing("2v"),
		},
	},
	details: {
		margin: 0,
		color: fr.colors.decisions.text.mention.grey.default,
	},
	auditRateValue: {
		color: fr.colors.decisions.text.label.grey.default,

		margin: 0,
	},
	auditRateLabel: {
		color: fr.colors.decisions.text.label.grey.default,
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
