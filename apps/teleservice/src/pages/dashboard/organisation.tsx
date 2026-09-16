import { fr } from "@codegouvfr/react-dsfr";
import Contract from "@codegouvfr/react-dsfr/picto/Contract";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { tss } from "tss-react";
import { useDeclarationColumns } from "~/components/declaration/tableColumns";
import { PageHeading } from "~/components/layout/PageHeading";
import EmptyState from "~/components/ui/EmptyState";
import Table from "~/components/ui/Table";
import type { Entity } from "~/payload/payload-types";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { loadEntityForPage } from "~/lib/server-guards";
import { Alert } from "@codegouvfr/react-dsfr/Alert";

interface EntityDeclarationsPageProps {
	entity: Entity;
	declarations: PopulatedDeclaration[];
}

const NUMBER_PER_PAGE = 10;

export default function EntityDeclarationsPage({
	entity,
	declarations,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { classes } = useStyles();
	const {
		nameColumn,
		appKindColumn,
		statusColumn,
		conformityRateColumn,
		publicActionsColumn,
	} = useDeclarationColumns();

	const alertRef = useRef<HTMLDivElement>(null);
	const [alertMessage, setAlertMessage] = useState<string | null>(null);

	const onCopySuccess = useCallback(
		(declarationName: string) =>
			setAlertMessage(
				`Lien de la déclaration ${declarationName} copié dans le presse-papier`,
			),
		[],
	);

	useEffect(() => {
		if (alertMessage) alertRef.current?.focus();
	}, [alertMessage]);

	const columns = useMemo(
		() => [
			nameColumn({ rowLink: false }),
			appKindColumn,
			statusColumn,
			conformityRateColumn,
			publicActionsColumn({ onCopySuccess, withPreview: true }),
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

	return (
		<>
			<Head>
				<title>
					Toutes les déclarations de l’organisation - Téléservice Conformité
				</title>
			</Head>
			<PageHeading
				title="Toutes les déclarations de l’organisation"
				pictogram={<Contract fontSize="3.5rem" />}
				entityName={entity.name}
			/>
			<div className={fr.cx("fr-container")}>
				<div className={classes.main}>
					{alertMessage && (
						<div className={classes.alertWrapper} ref={alertRef} tabIndex={-1}>
							<Alert
								small
								severity="success"
								description={alertMessage}
								closable
								onClose={() => setAlertMessage(null)}
							/>
						</div>
					)}
					{declarations.length ? (
						<Table
							columns={columns}
							data={declarations}
							numberPerPage={NUMBER_PER_PAGE}
						/>
					) : (
						<EmptyState
							pictogram={<Contract fontSize="3rem" />}
							title="Il n’y a aucune déclaration d’accessibilité."
							description={`Retrouvez ici toutes les déclarations créées dans votre organisation ${entity.name}`}
						/>
					)}
				</div>
			</div>
		</>
	);
}

const useStyles = tss.withName(EntityDeclarationsPage.name).create({
	main: {
		paddingBlock: fr.spacing("12v"),
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("6v"),
	},
	alertWrapper: {
		width: "100%",
		display: "flex",
		"& div": { width: "100%" },
		animation: "fadeIn 0.25s ease-in-out",
	},
});

export const getServerSideProps = (async (context) => {
	const { payload, session, entity } = await loadEntityForPage(context);

	if (!session) return { redirect: { destination: "/", permanent: false } };
	if (!entity)
		return {
			redirect: { destination: "/dashboard/declarations", permanent: false },
		};

	const result = await payload.find({
		collection: "declarations",
		depth: 1,
		where: {
			entity: { equals: entity.id },
		},
		limit: 1000,
	});

	const declarations = (result?.docs ?? []).map(
		(doc) => doc as PopulatedDeclaration,
	);

	return { props: { entity, declarations } };
}) satisfies GetServerSideProps<EntityDeclarationsPageProps>;
