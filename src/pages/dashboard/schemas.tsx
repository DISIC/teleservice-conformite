import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Tag from "@codegouvfr/react-dsfr/Tag";
import DataVisualization from "@codegouvfr/react-dsfr/picto/DataVisualization";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useState } from "react";
import { tss } from "tss-react";
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
import EmptyState from "~/components/ui/EmptyState";
import { Loader } from "~/components/ui/Loader";
import type { Entity, Schema } from "~/payload/payload-types";
import { api } from "~/lib/api";
import { loadEntityForPage } from "~/lib/server-guards";

export default function SchemasPage({
	entity,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { classes, cx } = useStyles();
	const utils = api.useUtils();

	const [schemaModalActions] = useState<LibrarySchemaModalActions>({});
	const [confirmationModalActions] = useState<ConfirmationModalActions>({});

	const {
		data: schemas = [],
		isLoading,
		isFetching,
	} = api.library.listSchemas.useQuery();

	const { mutate: deleteSchema } = api.library.deleteSchema.useMutation({
		onSuccess: () => utils.library.listSchemas.invalidate(),
		onError: (e) => alert(e.message),
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
			onConfirm: () => deleteSchema({ id: schema.id }),
		});

	const openCreate = () => schemaModalActions.open?.();

	return (
		<>
			<Head>
				<title>Mes schémas - Téléservice Conformité</title>
			</Head>
			<PageHeading
				title="Mes schémas"
				pictogram={<DataVisualization fontSize="3.5rem" />}
				entityName={entity.name}
				actions={
					<Button iconId="fr-icon-add-line" onClick={openCreate}>
						Ajouter un schéma pluriannuel
					</Button>
				}
			/>
			<div className={fr.cx("fr-container")}>
				<div className={classes.main}>
					{isLoading || isFetching ? (
						<Loader />
					) : schemas.length === 0 ? (
						<EmptyState
							pictogram={<DataVisualization fontSize="3rem" />}
							title="Vous n’avez aucun schéma pluriannuel enregistré"
							description="Centralisez et gérez les schémas pluriannuels nécessaires à vos déclarations d’accessibilité."
							ctaProps={{
								children: "Ajouter un schéma",
								onClick: openCreate,
								iconId: "fr-icon-add-line",
							}}
						/>
					) : (
						<ul className={classes.schemaList}>
							{schemas.map((schema) => (
								<li key={schema.id} className={classes.schemaCard}>
									<div
										className={cx(classes.schemaRow, classes.schemaHeaderRow)}
									>
										<strong>{schema.name}</strong>
										<span className={classes.hint}>{schema.url}</span>
										<span className={classes.hint} suppressHydrationWarning>
											Dernière mise à jour{" "}
											<Tag
												small
												linkProps={{
													href: "#",
													style: { pointerEvents: "none" },
												}}
											>
												{new Date(schema.updatedAt).toLocaleDateString("fr-FR")}
											</Tag>
										</span>
										<ItemActions
											label={schema.name}
											onEdit={() => schemaModalActions.open?.(schema)}
											onDelete={() => confirmDelete(schema)}
										/>
									</div>
									{(schema.actionPlanUrls ?? []).map((plan) => (
										<div
											key={plan.id ?? plan.url}
											className={cx(classes.schemaRow, classes.schemaPlanRow)}
										>
											<span>{plan.name}</span>
											<span className={classes.hint}>{plan.url}</span>
										</div>
									))}
								</li>
							))}
						</ul>
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
		display: "grid",
		gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
		gap: fr.spacing("6v"),
		"& > li": {
			margin: 0,
			padding: 0,
		},
	},
	schemaCard: {
		gridColumn: "1 / -1",
		display: "grid",
		gridTemplateColumns: "subgrid",
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		borderRadius: 4,
		overflow: "hidden",
	},
	schemaRow: {
		gridColumn: "1 / -1",
		display: "grid",
		gridTemplateColumns: "subgrid",
		alignItems: "center",
		gap: fr.spacing("4v"),
		padding: `${fr.spacing("3v")} ${fr.spacing("4v")}`,
	},
	schemaHeaderRow: {
		backgroundColor: fr.colors.decisions.background.default.grey.default,
	},
	schemaPlanRow: {
		backgroundColor: fr.colors.decisions.background.alt.grey.default,
		borderTop: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
	},
	hint: {
		fontSize: "0.875rem",
		color: fr.colors.decisions.text.mention.grey.default,
		display: "flex",
		alignItems: "center",
		gap: fr.spacing("2v"),
	},
});

export const getServerSideProps = (async (context) => {
	const { session, entity } = await loadEntityForPage(context);

	if (!session) return { redirect: { destination: "/", permanent: false } };
	if (!entity)
		return { redirect: { destination: "/dashboard", permanent: false } };

	return { props: { entity } };
}) satisfies GetServerSideProps<{ entity: Entity }>;
