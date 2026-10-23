import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { tss } from "tss-react";
import { ObsolescenceLine } from "~/components/declaration/ObsolescenceLine";
import { StatusBadge } from "~/components/declaration/StatusBadge";
import { EmptyValue } from "~/components/ui/EmptyValue";
import {
	formatRate,
	getConformityStatus,
} from "~/domain/declaration/conformity";
import { getDeclarationStatus } from "~/domain/declaration/status";
import { copyToClipboard } from "~/lib/clipboard";
import { appKindOptions } from "~/payload/selectOptions";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { newTabLinkProps, newTabTitle } from "~/lib/newTabLink";

const columnHelper = createColumnHelper<PopulatedDeclaration>();

const publicUrl = (declaration: PopulatedDeclaration) =>
	`/declarations/${declaration.id}/publish`;

const hasPublicPage = (declaration: PopulatedDeclaration) =>
	getDeclarationStatus(declaration) === "published";

/** The actions column is left out when no listed declaration has one. */
export const hasPublicActions = (declarations: PopulatedDeclaration[]) =>
	declarations.some(hasPublicPage);

export function useDeclarationColumns() {
	const { classes } = useStyles();

	return useMemo(() => buildColumns(classes), [classes]);
}

function buildColumns(
	classes: Record<"name" | "status" | "rate" | "actions", string>,
) {
	const nameColumn = (options: { rowLink: boolean }) =>
		columnHelper.accessor("name", {
			header: "Nom de la déclaration",
			meta: { styles: { maxWidth: 240 }, rowLink: options.rowLink },
			cell: (info) => <span className={classes.name}>{info.getValue()}</span>,
		});

	const appKindColumn = columnHelper.accessor("app_kind", {
		header: "Type de service",
		cell: (info) => {
			const label = appKindOptions.find(
				(option) => option.value === info.getValue(),
			)?.label;
			return label ? <Tag small>{label}</Tag> : <EmptyValue />;
		},
	});

	const statusColumn = columnHelper.accessor(
		(row) => getDeclarationStatus(row),
		{
			id: "status",
			header: "Statut",
			cell: (info) => (
				<div className={classes.status}>
					<StatusBadge declaration={info.row.original} />
					<ObsolescenceLine declaration={info.row.original} underBadge />
				</div>
			),
		},
	);

	const conformityRateColumn = columnHelper.accessor((row) => row.audit?.rate, {
		id: "rate",
		header: "Taux de conformité",
		cell: (info) => {
			const rate = info.getValue();
			if (rate == null) return <EmptyValue />;
			const conformity = getConformityStatus(rate);
			return (
				<div className={classes.rate}>
					<Badge noIcon small severity={conformity.severity}>
						{formatRate(rate)}
					</Badge>
					<span className={fr.cx("fr-text--xs", "fr-mb-0")}>
						{conformity.label}
					</span>
				</div>
			);
		},
	});

	// Public actions only exist once a public page does.
	const publicActionsColumn = (options: {
		onCopySuccess: (declarationName: string) => void;
	}) =>
		columnHelper.display({
			id: "actions",
			header: () => <span className={fr.cx("fr-sr-only")}>Actions</span>,
			cell: (info) => {
				const declaration = info.row.original;
				if (!hasPublicPage(declaration))
					return (
						<span className={fr.cx("fr-sr-only")}>
							Aucune action disponible
						</span>
					);
				const copyTitle = `Copier le lien public de la déclaration ${declaration.name}`;
				return (
					<div className={classes.actions}>
						<Button
							iconId="fr-icon-link"
							priority="secondary"
							size="small"
							title={copyTitle}
							nativeButtonProps={{ "aria-label": copyTitle }}
							onClick={() =>
								copyToClipboard(
									`${process.env.NEXT_PUBLIC_FRONT_URL}${publicUrl(declaration)}`,
									() => options.onCopySuccess(declaration.name || ""),
								)
							}
						/>
						<Button
							iconId="fr-icon-eye-line"
							priority="secondary"
							size="small"
							title={newTabTitle(`Voir la déclaration ${declaration.name}`)}
							linkProps={{
								href: publicUrl(declaration),
								...newTabLinkProps(`Voir la déclaration ${declaration.name}`),
							}}
						/>
					</div>
				);
			},
		});

	return {
		nameColumn,
		appKindColumn,
		statusColumn,
		conformityRateColumn,
		publicActionsColumn,
	};
}

const useStyles = tss.withName("TableColumns").create({
	name: {
		fontWeight: 500,
	},
	status: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		gap: fr.spacing("1v"),
	},
	rate: {
		display: "flex",
		flexDirection: "column",
	},
	actions: {
		display: "flex",
		justifyContent: "flex-end",
		gap: fr.spacing("2v"),
	},
});
