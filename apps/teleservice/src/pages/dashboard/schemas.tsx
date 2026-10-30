import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import DataVisualization from "@codegouvfr/react-dsfr/picto/DataVisualization";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { tss } from "tss-react";
import { EditActionProvider, Part } from "~/components/form/Part";
import { PageHeading } from "~/components/layout/PageHeading";
import { ItemActions } from "~/components/library/ItemActions";
import { LibraryList } from "~/components/library/LibraryList";
import { LinkedDeclarationsTag } from "~/components/library/LinkedDeclarationsTag";
import {
	ConfirmationModal,
	type ConfirmationModalActions,
} from "~/components/modal/ConfirmationModal";
import {
	LibrarySchemaModal,
	type LibrarySchemaModalActions,
} from "~/components/modal/LibrarySchemaModal";
import EmptyState from "~/components/ui/EmptyState";
import { SCHEMA_FAQ } from "~/components/ui/emptyStateFaq";
import { Loader } from "~/components/ui/Loader";
import { UrlText } from "~/components/ui/UrlText";
import { useFocusAfterDelete } from "~/hooks/useFocusAfterDelete";
import type { Entity, Schema } from "~/payload/payload-types";
import { api } from "~/lib/api";
import { loadEntityForPage } from "~/lib/server-guards";
import { pageTitle } from "~/lib/serviceName";

const SUCCESS_ALERT_DURATION_MS = 5000;

type AlertDetails = {
	description: string;
	severity: "success" | "error";
};

export default function SchemasPage({
	entity,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { classes } = useStyles();
	const utils = api.useUtils();

	const [schemaModalActions] = useState<LibrarySchemaModalActions>({});
	const [confirmationModalActions] = useState<ConfirmationModalActions>({});
	const alertRef = useRef<HTMLDivElement>(null);
	const [alert, setAlert] = useState<AlertDetails | null>(null);

	useEffect(() => {
		if (!alert) return;
		alertRef.current?.focus();
		if (alert.severity !== "success") return;

		const timeout = setTimeout(() => setAlert(null), SUCCESS_ALERT_DURATION_MS);
		return () => clearTimeout(timeout);
	}, [alert]);

	const {
		data: schemas = [],
		isLoading,
		isFetching,
	} = api.library.listSchemas.useQuery();
	const { addButtonId, deleteButtonId, deleteItem } = useFocusAfterDelete({
		itemName: "schema",
		isFetching,
		deleteMutation: api.library.deleteSchema.useMutation({
			onSuccess: () => {
				setAlert({
					description: "Votre schéma a été supprimé avec succès",
					severity: "success",
				});
				return utils.library.listSchemas.invalidate();
			},
			onError: (e) => setAlert({ description: e.message, severity: "error" }),
		}),
	});

	const confirmDelete = (schema: Schema) =>
		confirmationModalActions.open?.({
			title: "Supprimer le schéma pluriannuel",
			confirmLabel: "Supprimer le schéma",
			confirmIconId: "fr-icon-delete-fill",
			confirmBackgroundColor:
				fr.colors.decisions.background.actionHigh.error.default,
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

	const openEdit = async (schema: Schema) => {
		let linked: { id: number; name: string; isPublished: boolean }[];
		try {
			linked = await utils.library.linkedDeclarations.fetch({
				kind: "schema",
				id: schema.id,
			});
		} catch (e) {
			setAlert({
				description: e instanceof Error ? e.message : String(e),
				severity: "error",
			});
			return;
		}

		if (!linked.some((declaration) => declaration.isPublished)) {
			schemaModalActions.open?.(schema);
			return;
		}

		confirmationModalActions.open?.({
			title: "Attention, ce schéma est associé à des déclarations publiées.",
			confirmLabel: "Modifier le schéma",
			confirmIconId: "fr-icon-edit-line",
			description: (
				<>
					<p>
						{linked.length === 1 ? (
							<>
								Les modifications seront appliquées à 1 déclaration
								d’accessibilité associée à ce schéma.
								<br />
								Elle sera automatiquement mise à jour.
							</>
						) : (
							<>
								Les modifications seront appliquées à {linked.length}{" "}
								déclarations d’accessibilité associées à ce schéma.
								<br />
								Elles seront automatiquement mises à jour.
							</>
						)}
					</p>
					<ul>
						{linked.map((declaration) => (
							<li key={declaration.id}>
								<a
									href={`/dashboard/declarations/${declaration.id}`}
									{...newTabLinkProps(declaration.name)}
									className={classes.link}
								>
									{declaration.name}
								</a>
							</li>
						))}
					</ul>
				</>
			),
			onConfirm: () => schemaModalActions.open?.(schema),
		});
	};

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
						Ajouter un schéma
					</Button>
				}
			/>
			<div className={fr.cx("fr-container")}>
				<div className={classes.main}>
					{alert && (
						<div className={classes.alertWrapper} ref={alertRef} tabIndex={-1}>
							<Alert
								small
								severity={alert.severity}
								description={alert.description}
								closable
								onClose={() => setAlert(null)}
							/>
						</div>
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
							faq={SCHEMA_FAQ}
						/>
					) : (
						<LibraryList
							id="schemas-list-title"
							title="Liste de mes schémas pluriannuels"
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
											/>
										}
									>
										<Part
											readOnly
											grid={false}
											title={schema.name}
											titleAside={
												<LinkedDeclarationsTag
													count={schema.declarations?.totalDocs}
												/>
											}
										>
											{schema.url && (
												<p className={classes.url}>
													<UrlText url={schema.url} />
												</p>
											)}
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
																		{plan.url && <UrlText url={plan.url} />}
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
						</LibraryList>
					)}
				</div>
			</div>
			<LibrarySchemaModal
				actions={schemaModalActions}
				onCreated={(name) =>
					setAlert({
						description: `Le document « ${name} » a été ajouté avec succès`,
						severity: "success",
					})
				}
			/>
			<ConfirmationModal actions={confirmationModalActions} />
		</>
	);
}

const useStyles = tss.withName(SchemasPage.name).create({
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
	url: {
		margin: 0,
		"& a": {
			color: fr.colors.decisions.text.actionHigh.blueFrance.default,
		},
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
