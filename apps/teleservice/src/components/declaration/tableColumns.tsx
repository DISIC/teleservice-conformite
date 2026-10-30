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

export type DeclarationAction = "copy" | "view" | "edit";

const ALL_ACTIONS: DeclarationAction[] = ["copy", "view", "edit"];

export function useDeclarationColumns({
	rowLink,
	onCopySuccess,
	actions = ALL_ACTIONS,
}: {
	rowLink: boolean;
	onCopySuccess?: (declarationName: string) => void;
	actions?: DeclarationAction[];
}) {
	const { classes } = useStyles();

	return useMemo(() => {
		const {
			nameColumn,
			appKindColumn,
			statusColumn,
			conformityRateColumn,
			publicActionsColumn,
		} = buildColumns(classes);
		return [
			nameColumn({ rowLink }),
			appKindColumn,
			statusColumn,
			conformityRateColumn,
			publicActionsColumn({ onCopySuccess, actions }),
		];
	}, [classes, rowLink, onCopySuccess, actions]);
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
					<Badge as="span" noIcon small severity={conformity.severity}>
						{formatRate(rate)}
					</Badge>
					<span className={fr.cx("fr-text--xs", "fr-mb-0")}>
						{conformity.label}
					</span>
				</div>
			);
		},
	});

	const publicActionsColumn = (options: {
		onCopySuccess?: (declarationName: string) => void;
		actions: DeclarationAction[];
	}) =>
		columnHelper.display({
			id: "actions",
			header: "Actions",
			meta: { styles: { justifyContent: "flex-end" }, fitContent: true },
			cell: (info) => {
				const declaration = info.row.original;
				const copyTitle = `Copier le lien public de la déclaration ${declaration.name}`;
				const viewLabel = `Voir la déclaration ${declaration.name}`;
				const isPublished = getDeclarationStatus(declaration) === "published";
				const showCopy = isPublished && options.actions.includes("copy");
				const showView = isPublished && options.actions.includes("view");
				const showEdit = options.actions.includes("edit");
				if (!showCopy && !showView && !showEdit)
					return <EmptyValue label="Aucune action disponible" />;
				return (
					<div className={classes.actions}>
						{showCopy && (
							<Button
								iconId="ri-links-line"
								priority="tertiary"
								size="small"
								title={copyTitle}
								onClick={() =>
									copyToClipboard(
										`${process.env.NEXT_PUBLIC_FRONT_URL}${publicUrl(declaration)}`,
										() => options.onCopySuccess?.(declaration.name || ""),
									)
								}
							/>
						)}
						{showView && (
							<Button
								iconId="ri-eye-line"
								priority="tertiary"
								size="small"
								title={newTabTitle(viewLabel)}
								linkProps={{
									href: publicUrl(declaration),
									...newTabLinkProps(viewLabel),
								}}
							/>
						)}
						{showEdit && (
							<Button
								iconId="ri-edit-line"
								priority="tertiary"
								size="small"
								title={`Modifier la déclaration ${declaration.name}`}
								linkProps={{
									href: `/dashboard/declarations/${declaration.id}`,
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
		gap: fr.spacing("4v"),
	},
});
