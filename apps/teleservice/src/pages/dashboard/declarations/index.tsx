import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { keepPreviousData } from "@tanstack/react-query";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Contract from "@codegouvfr/react-dsfr/picto/Contract";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { tss } from "tss-react";
import { useDeclarationColumns } from "~/components/declaration/tableColumns";
import { PageHeading } from "~/components/layout/PageHeading";
import {
	CreateDeclarationModal,
	type CreateDeclarationModalActions,
} from "~/components/modal/CreateDeclarationModal";
import EmptyState from "~/components/ui/EmptyState";
import Table from "~/components/ui/Table";
import { api } from "~/lib/api";
import { loadEntityForPage } from "~/lib/server-guards";
import type { Entity } from "~/payload/payload-types";
import {
	type DeclarationsPage as DeclarationsPageData,
	listOwnedDeclarations,
} from "~/server/api/routers/declaration/service";

interface DeclarationsPageProps {
	firstPage: DeclarationsPageData;
	entity: Entity | null;
}

type AlertDetailsProps = {
	description?: string;
	severity: "info" | "success" | "warning" | "error";
};

export default function DeclarationsPage(props: DeclarationsPageProps) {
	const { firstPage, entity } = props;
	const { classes } = useStyles();
	const [page, setPage] = useState(1);

	const { data } = api.declaration.list.useQuery(
		{ page },
		{ enabled: page > 1, placeholderData: keepPreviousData },
	);
	const declarations = page === 1 ? firstPage : (data ?? firstPage);

	const {
		nameColumn,
		appKindColumn,
		statusColumn,
		conformityRateColumn,
		publicActionsColumn,
	} = useDeclarationColumns();
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
			nameColumn({ rowLink: true }),
			appKindColumn,
			statusColumn,
			conformityRateColumn,
			publicActionsColumn({ onCopySuccess }),
		],
		[
			nameColumn,
			appKindColumn,
			statusColumn,
			conformityRateColumn,
			publicActionsColumn,
			onCopySuccess,
		],
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
					{declarations.totalDocs ? (
						<Table
							columns={columns}
							data={declarations.docs}
							numberPerPage={declarations.limit}
							pagination={{
								pageCount: declarations.totalPages,
								page: declarations.page,
								onPageChange: setPage,
							}}
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
});

export const getServerSideProps = (async (context) => {
	const { payload, session, entity } = await loadEntityForPage(context);

	if (!session) return { redirect: { destination: "/", permanent: false } };

	const firstPage = await listOwnedDeclarations(
		payload,
		Number(session.user.id),
	);

	return { props: { firstPage, entity } };
}) satisfies GetServerSideProps<DeclarationsPageProps>;
