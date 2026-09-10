import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { tss } from "tss-react";
import { StatusBadge } from "~/components/declaration/StatusBadge";
import {
	formatRate,
	getConformityStatus,
} from "~/domain/declaration/conformity";
import { getDeclarationStatus } from "~/domain/declaration/status";
import { copyToClipboard } from "~/lib/clipboard";
import { appKindOptions } from "~/payload/selectOptions";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

const columnHelper = createColumnHelper<PopulatedDeclaration>();

const publicUrl = (declaration: PopulatedDeclaration) =>
	`/declarations/${declaration.id}/publish`;

export function useDeclarationColumns() {
	const { classes } = useStyles();

	return useMemo(() => buildColumns(classes), [classes]);
}

function buildColumns(classes: Record<"name" | "rate" | "actions", string>) {
	const nameColumn = (options: { rowLink: boolean }) =>
		columnHelper.accessor("name", {
			header: "Nom de la déclaration",
			meta: { styles: { maxWidth: 240 }, rowLink: options.rowLink },
			cell: (info) => <span className={classes.name}>{info.getValue()}</span>,
		});

	const appKindColumn = columnHelper.accessor("app_kind", {
		header: "Type de service",
		cell: (info) => (
			<Tag small>
				{appKindOptions.find((option) => option.value === info.getValue())
					?.label ?? "—"}
			</Tag>
		),
	});

	const statusColumn = columnHelper.accessor(
		(row) => getDeclarationStatus(row),
		{
			id: "status",
			header: "Statut",
			cell: (info) => <StatusBadge declaration={info.row.original} />,
		},
	);

	const conformityRateColumn = columnHelper.accessor((row) => row.audit?.rate, {
		id: "rate",
		header: "Taux de conformité",
		cell: (info) => {
			const rate = info.getValue();
			if (rate == null) return "—";
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
		withPreview: boolean;
	}) =>
		columnHelper.display({
			id: "actions",
			cell: (info) => {
				const declaration = info.row.original;
				if (getDeclarationStatus(declaration) !== "published") return null;
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
						{options.withPreview && (
							<Button
								iconId="fr-icon-eye-line"
								priority="secondary"
								size="small"
								title={`Voir la déclaration ${declaration.name}, nouvelle fenêtre`}
								linkProps={{
									href: publicUrl(declaration),
									target: "_blank",
									rel: "noopener noreferrer",
								}}
							/>
						)}
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
