import { fr } from "@codegouvfr/react-dsfr";
import Contract from "@codegouvfr/react-dsfr/picto/Contract";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react";
import { tss } from "tss-react";
import { useDeclarationColumns } from "~/components/declaration/tableColumns";
import { PageHeading } from "~/components/layout/PageHeading";
import EmptyState, { type FaqItem } from "~/components/ui/EmptyState";
import Table from "~/components/ui/Table";
import type { Entity } from "~/payload/payload-types";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { loadEntityForPage } from "~/lib/server-guards";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { pageTitle } from "~/lib/serviceName";
import { type CreateDeclarationModalActions } from "~/components/modal/CreateDeclarationModal";
import { useRouter } from "next/router";

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
	const router = useRouter();

	const alertRef = useRef<HTMLDivElement>(null);
	const [alertMessage, setAlertMessage] = useState<string | null>(null);

	const [createModalActions] = useState<CreateDeclarationModalActions>({});

	const emptyStateFaq: FaqItem[] = [
		{
			question:
				"Je n’ai pas fait d’audit d’accessibilité, dois-je quand même utiliser le téléservice de déclaration d’accessibilité numérique ?",
			answer: (
				<p>
					Oui, tous les sites et applications mobiles en production doivent être
					référencés sur le téléservice de déclaration,
					<span className={classes.bold}>
						y compris ceux qui n’ont pas encore fait l’objet d’un audit
						d’accessibilité.
					</span>
				</p>
			),
		},
		{
			question:
				"Quels documents faut-il préparer avant d’utiliser le téléservice de déclaration d’accessibilité numérique ?",
			answer: (
				<>
					<p>Si vous les possédez, pensez à préparer :</p>
					<br />
					<ul>
						<li>votre déclaration d’accessibilité existante,</li>
						<li>l’URL du schéma pluriannuel,</li>
						<li>l’URL du ou des plans d’actions.</li>
					</ul>
				</>
			),
		},
	];

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

	// Entry point for "Déposer une déclaration" from outside the list, where the modal cannot live.
	useEffect(() => {
		if (router.query.create !== "true") return;

		createModalActions.open?.();
		const { create: _create, ...query } = router.query;
		router.replace({ query }, undefined, { shallow: true });
	}, [router, createModalActions]);

	const columns = useDeclarationColumns({
		declarations,
		rowLink: false,
		onCopySuccess,
	});

	return (
		<>
			<Head>
				<title>{pageTitle("Toutes les déclarations de l’organisation")}</title>
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
							caption="Liste des déclarations d’accessibilité de l’organisation"
							columns={columns}
							data={declarations}
							numberPerPage={NUMBER_PER_PAGE}
						/>
					) : (
						<EmptyState
							pictogram={<Contract fontSize="3rem" />}
							title="Votre organisation n’a déposé aucune déclaration"
							description={`Retrouvez ici toutes les déclarations créées dans votre organisation ${entity.name}`}
							faq={emptyStateFaq}
							ctaProps={{
								onClick: () => createModalActions.open?.(),
								children: "Déposer une déclaration",
								iconId: "ri-download-line",
							}}
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
	bold: {
		fontWeight: 700,
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
