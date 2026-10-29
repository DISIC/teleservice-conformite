import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import DataVisualization from "@codegouvfr/react-dsfr/picto/DataVisualization";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useState } from "react";
import { tss } from "tss-react";
import { EditActionProvider, Part } from "~/components/form/Part";
import { PageHeading } from "~/components/layout/PageHeading";
import { ItemActions } from "~/components/library/ItemActions";
import {
	ConfirmationModal,
	type ConfirmationModalActions,
} from "~/components/modal/ConfirmationModal";
import {
	LibrarySchemaModal,
	type LibrarySchemaModalActions,
} from "~/components/modal/LibrarySchemaModal";
import EmptyState, { type FaqItem } from "~/components/ui/EmptyState";
import { Loader } from "~/components/ui/Loader";
import { useFocusAfterDelete } from "~/hooks/useFocusAfterDelete";
import type { Entity, Schema } from "~/payload/payload-types";
import { api } from "~/lib/api";
import { newTabLinkProps } from "~/lib/newTabLink";
import { loadEntityForPage } from "~/lib/server-guards";
import { pageTitle } from "~/lib/serviceName";

export default function SchemasPage({
	entity,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { classes } = useStyles();
	const utils = api.useUtils();

	const [schemaModalActions] = useState<LibrarySchemaModalActions>({});
	const [confirmationModalActions] = useState<ConfirmationModalActions>({});
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const emptyStateFaq: FaqItem[] = [
		{
			question: "Qu’est-ce qu’un schéma pluriannuel ?",
			answer: (
				<>
					C’est une feuille de route d'une durée maximale de 3 ans : elle
					définit la politique d'accessibilité de l'entité et s'appuie sur des
					plans d'actions annuels.
					<br />
					Il est obligatoire pour les services de l’État, les collectivités
					territoriales, les établissements publics et certaines entreprises
					privées.
					<br />
					<br />
					<a
						href="https://accessibilite.numerique.gouv.fr/obligations/schema-pluriannuel/"
						{...newTabLinkProps("En savoir plus sur le schéma pluriannuel")}
						className={classes.link}
					>
						En savoir plus sur le schéma pluriannuel
					</a>
				</>
			),
		},
	];

	const {
		data: schemas = [],
		isLoading,
		isFetching,
	} = api.library.listSchemas.useQuery();
	const { addButtonId, deleteButtonId, deleteItem } = useFocusAfterDelete({
		itemName: "schema",
		isFetching,
		deleteMutation: api.library.deleteSchema.useMutation({
			onSuccess: () => utils.library.listSchemas.invalidate(),
			onError: (e) => setErrorMessage(e.message),
		}),
	});

	const confirmDelete = (schema: Schema) =>
		confirmationModalActions.open?.({
			title: "Supprimer le schéma pluriannuel",
			confirmLabel: "Supprimer",
			confirmIconId: "fr-icon-delete-fill",
			description: (
				<>
					<p>
						Êtes-vous sûr de vouloir supprimer le schéma{" "}
						<strong>{schema.name}</strong> et ses plans d'action associés ?
						Cette action est irréversible.
					</p>
					<p>
						Les déclarations liées à ce schéma conservent les informations déjà
						renseignées, mais ne seront plus mises à jour depuis votre
						bibliothèque.
					</p>
				</>
			),
			onConfirm: () => deleteItem(schema.id),
		});

	const openCreate = () => schemaModalActions.open?.();

	return (
		<>
			<Head>
				<title>
					{pageTitle("Mes schémas pluriannuels et plans d’actions")}
				</title>
			</Head>
			<PageHeading
				title="Mes schémas pluriannuels et plans d’actions"
				pictogram={<DataVisualization fontSize="3.5rem" />}
				entityName={entity.name}
				actions={
					<Button
						iconId="fr-icon-add-line"
						onClick={openCreate}
						nativeButtonProps={{ id: addButtonId }}
					>
						Ajouter un schéma pluriannuel
					</Button>
				}
			/>
			<div className={fr.cx("fr-container")}>
				<div className={classes.main}>
					{errorMessage && (
						<Alert
							small
							severity="error"
							description={errorMessage}
							closable
							onClose={() => setErrorMessage(null)}
						/>
					)}
					{isLoading || isFetching ? (
						<Loader />
					) : schemas.length === 0 ? (
						<EmptyState
							pictogram={<DataVisualization fontSize="3rem" />}
							title="Vous n’avez aucun schéma pluriannuel enregistré"
							description="Centralisez et gérez les schémas pluriannuels et plans d’actions nécessaires à vos déclarations d’accessibilité."
							ctaProps={{
								children: "Ajouter un schéma",
								onClick: openCreate,
								iconId: "fr-icon-add-line",
							}}
							faq={emptyStateFaq}
						/>
					) : (
						<>
							<h2 id="schemas-list-title" className={fr.cx("fr-sr-only")}>
								Liste de mes schémas pluriannuels
							</h2>
							<ul
								className={classes.schemaList}
								aria-labelledby="schemas-list-title"
							>
								{schemas.map((schema) => (
									<li key={schema.id}>
										<EditActionProvider
											value={
												<ItemActions
													label={schema.name}
													onEdit={() => schemaModalActions.open?.(schema)}
													onDelete={() => confirmDelete(schema)}
													deleteButtonId={deleteButtonId(schema.id)}
													withLabels
												/>
											}
										>
											<Part readOnly grid={false}>
												<div className={classes.header}>
													<h3 className={fr.cx("fr-h6", "fr-mb-0")}>
														{schema.name}
													</h3>
													{schema.url && (
														<a href={schema.url} className={classes.link}>
															{schema.url}
														</a>
													)}
												</div>
												<dl className={classes.entries}>
													<div className={classes.entry}>
														<dt className={classes.entryLabel}>
															Plans d’actions associés
														</dt>
														<dd className={classes.entryValue}>
															{schema.actionPlanUrls?.length ? (
																<ul className={classes.planList}>
																	{schema.actionPlanUrls.map((plan, index) => (
																		<li key={plan.id ?? index}>
																			<span>
																				{plan.name ||
																					`Plan d’actions ${index + 1}`}
																			</span>
																			{plan.url && (
																				<a href={plan.url}>{plan.url}</a>
																			)}
																		</li>
																	))}
																</ul>
															) : (
																"Non"
															)}
														</dd>
													</div>
												</dl>
											</Part>
										</EditActionProvider>
									</li>
								))}
							</ul>
						</>
					)}
				</div>
			</div>
			<LibrarySchemaModal actions={schemaModalActions} />
			<ConfirmationModal actions={confirmationModalActions} />
		</>
	);
}

const useStyles = tss.withName(SchemasPage.name).create({
	main: {
		paddingBlock: fr.spacing("12v"),
	},
	schemaList: {
		listStyle: "none",
		padding: 0,
		margin: 0,
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("6v"),
		"& > li": {
			margin: 0,
			padding: 0,
		},
		"& > li > div, & dl": {
			gap: fr.spacing("8v"),
		},
	},
	entry: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("2v"),
	},
	entryLabel: {
		fontWeight: 700,
		color: fr.colors.decisions.text.label.grey.default,
	},
	entryValue: {
		margin: 0,
		paddingLeft: 0,
		color: fr.colors.decisions.text.label.grey.default,
		"& a": {
			color: fr.colors.decisions.text.actionHigh.blueFrance.default,
		},
	},
	header: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
	},
	entries: {
		margin: 0,
		padding: 0,
	},
	planList: {
		margin: 0,
		"& > li": {
			width: "fit-content",
			paddingBottom: 0,
		},
		"& > li > a": {
			display: "block",
			width: "fit-content",
		},
		"& > li + li": {
			marginTop: fr.spacing("4v"),
		},
	},
	link: {
		color: fr.colors.decisions.text.actionHigh.blueFrance.default,
	},
});

export const getServerSideProps = (async (context) => {
	const { session, entity } = await loadEntityForPage(context);

	if (!session) return { redirect: { destination: "/", permanent: false } };
	if (!entity)
		return {
			redirect: { destination: "/dashboard/declarations", permanent: false },
		};

	return { props: { entity } };
}) satisfies GetServerSideProps<{ entity: Entity }>;
