import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Tag from "@codegouvfr/react-dsfr/Tag";
import Contract from "@codegouvfr/react-dsfr/picto/Contract";
import { Tooltip } from "@codegouvfr/react-dsfr/Tooltip";
import { createColumnHelper } from "@tanstack/react-table";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { tss } from "tss-react";
import { StatusBadge } from "~/components/declaration/StatusBadge";
import { PageHeading } from "~/components/layout/PageHeading";
import {
	CreateDeclarationModal,
	type CreateDeclarationModalActions,
} from "~/components/modal/CreateDeclarationModal";
import EmptyState from "~/components/ui/EmptyState";
import Table from "~/components/ui/Table";
import { appKindOptions } from "~/payload/selectOptions";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { copyToClipboard } from "~/lib/clipboard";
import { loadEntityForPage } from "~/lib/server-guards";
import { getConformityStatus } from "~/domain/declaration/conformity";
import { getDeclarationStatus } from "~/domain/declaration/status";
import type { Entity } from "~/payload/payload-types";

interface DeclarationsPageProps {
	declarations: PopulatedDeclaration[];
	entity: Entity | null;
}

const NUMBER_PER_PAGE = 10;

const columnHelper = createColumnHelper<PopulatedDeclaration>();

const defaultColumns = [
	columnHelper.accessor("app_kind", {
		header: "Type",
		cell: (info) => (
			<Tag small>
				{appKindOptions.find((option) => option.value === info.getValue())
					?.label ?? "—"}
			</Tag>
		),
	}),
	columnHelper.accessor((row) => getDeclarationStatus(row), {
		id: "status",
		header: "Statut",
		cell: (info) => <StatusBadge declaration={info.row.original} />,
	}),
	columnHelper.accessor("updatedAt", {
		header: "Dernière mise à jour",
		cell: (info) => {
			const date = new Date(info.getValue());
			return date.toLocaleDateString("fr-FR");
		},
	}),
	columnHelper.accessor((row) => row.audit?.rate, {
		header: "Taux de conformité",
		cell: (info) => {
			const rate = info.getValue();

			if (rate === undefined || rate === null) return "-";

			const conformityStatus = getConformityStatus(rate);

			return (
				<Tooltip kind="hover" title={conformityStatus.label}>
					<Badge noIcon small severity={conformityStatus.severity}>
						{`${rate}%`}
					</Badge>
				</Tooltip>
			);
		},
	}),
];

const buildActionsColumn = (onCopySuccess: (declarationName: string) => void) =>
	columnHelper.display({
		id: "actions",
		cell: (info) => {
			const declaration = info.row.original;
			if (getDeclarationStatus(declaration) !== "published") return null;

			return (
				<div style={{ display: "flex", justifyContent: "flex-end" }}>
					<Button
						iconId="fr-icon-link"
						priority="secondary"
						size="small"
						title={`Copier le lien public de la déclaration ${declaration.name}`}
						onClick={() =>
							copyToClipboard(
								`${process.env.NEXT_PUBLIC_FRONT_URL}/declarations/${declaration.id}/publish`,
								() => onCopySuccess(declaration.name || ""),
							)
						}
						nativeButtonProps={{
							"aria-label": `Copier le lien public de la déclaration ${declaration.name}`,
						}}
					/>
				</div>
			);
		},
	});

type AlertDetailsProps = {
	description?: string;
	severity: "info" | "success" | "warning" | "error";
};

export default function DeclarationsPage(props: DeclarationsPageProps) {
	const { declarations, entity } = props;
	const { classes } = useStyles();
	const [createModalActions] = useState<CreateDeclarationModalActions>({});
	const alertRef = useRef<HTMLDivElement>(null);
	const [showAlert, setShowAlert] = useState<boolean>(false);
	const [alertDetails, setAlertDetails] = useState<AlertDetailsProps>({
		description: "",
		severity: "info",
	});

	const showDeclarationAlert = useCallback(
		({ description, severity }: AlertDetailsProps) => {
			setAlertDetails({ description, severity });
			setShowAlert(true);
		},
		[],
	);

	const onCopySuccess = useCallback(
		(declarationName: string) =>
			showDeclarationAlert({
				description: `Lien de la déclaration ${declarationName} copié dans le presse-papier`,
				severity: "success",
			}),
		[showDeclarationAlert],
	);

	const columns = useMemo(
		() => [
			columnHelper.accessor("name", {
				header: "Nom de la déclaration",
				meta: { styles: { maxWidth: 240 }, rowLink: true },
				cell: (info) => (
					<span className={classes.nameLink}>{info.getValue()}</span>
				),
			}),
			...defaultColumns,
			buildActionsColumn(onCopySuccess),
		],
		[onCopySuccess, classes.nameLink],
	);

	useEffect(() => {
		if (showAlert) alertRef.current?.focus();
	}, [showAlert, alertDetails]);

	return (
		<>
			<Head>
				<title>Mes déclarations - Téléservice Conformité</title>
			</Head>
			<PageHeading
				title="Mes déclarations d’accessibilité"
				pictogram={<Contract fontSize="3.5rem" />}
				entityName={entity?.name}
				actions={
					<Button
						iconId="fr-icon-add-line"
						onClick={() => createModalActions.open?.()}
					>
						Ajouter une déclaration
					</Button>
				}
			/>
			<div className={fr.cx("fr-container")}>
				<section id="declarations-page" className={classes.main}>
					{showAlert && (
						<div className={classes.alertWrapper} ref={alertRef} tabIndex={-1}>
							<Alert
								small
								severity={alertDetails.severity}
								description={alertDetails?.description ?? ""}
								closable
								isClosed={!showAlert}
								onClose={() => setShowAlert(false)}
							/>
						</div>
					)}
					{declarations.length ? (
						<Table
							columns={columns}
							data={declarations}
							numberPerPage={NUMBER_PER_PAGE}
							getRowHref={(row) => `/dashboard/declarations/${row.id}`}
						/>
					) : (
						<EmptyState
							title="Ajoutez votre première déclaration d’accessibilité"
							description="Vous devez réaliser une déclaration par service et par type de support."
							pictogram={<Contract fontSize="3rem" />}
							ctaProps={{
								onClick: () => createModalActions.open?.(),
								children: "Ajouter une déclaration",
								iconId: "fr-icon-add-line",
							}}
						>
							<p>
								<strong>Documents à préparer</strong>
								<br />
								Si vous les possédez, pensez à préparer votre déclaration
								d’accessibilité existante, votre grille et rapport d’audit, le
								fichier ou l’URL de votre schéma pluriannuel.
							</p>
							<p className={fr.cx("fr-text--xs", "fr-mb-0")}>
								Durée de complétion estimée : entre 6 et 15 minutes
							</p>
						</EmptyState>
					)}
				</section>
			</div>
			<CreateDeclarationModal actions={createModalActions} entity={entity} />
		</>
	);
}

const useStyles = tss.withName(DeclarationsPage.name).create({
	main: {
		paddingBlock: fr.spacing("12v"),
	},
	alertWrapper: {
		width: "100%",
		display: "flex",
		"& div": {
			width: "100%",
		},
		marginBottom: fr.spacing("6v"),
		animation: "fadeIn 0.25s ease-in-out",
	},
	nameLink: {
		fontWeight: 500,
	},
});

export const getServerSideProps = (async (context) => {
	const { payload, session, entity } = await loadEntityForPage(context);

	if (!session) return { redirect: { destination: "/", permanent: false } };

	const result = await payload.find({
		collection: "declarations",
		depth: 3,
		where: {
			"accessRights.user": { equals: session.user.id },
			"accessRights.status": { equals: "approved" },
		},
	});

	return {
		props: { declarations: result.docs as PopulatedDeclaration[], entity },
	};
}) satisfies GetServerSideProps<DeclarationsPageProps>;
